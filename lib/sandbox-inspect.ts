import type { Sandbox } from "@vercel/sandbox";

import type {
  ProcessInfo,
  MemoryInfo,
  DiskInfo,
  FileEntry,
  PackageInfo,
  SandboxInspectResponse,
} from "@/lib/sandbox-inspect-types";

const DEFAULT_TIMEOUT_MS = 120_000;

// ---------------------------------------------------------------------------
// Stdout helpers
// ---------------------------------------------------------------------------

async function stdout(
  result: Awaited<ReturnType<Sandbox["runCommand"]>>
): Promise<string> {
  try {
    return await result.stdout();
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// Parsers – pure functions, individually testable
// ---------------------------------------------------------------------------

export function parseProcesses(raw: string): ProcessInfo[] {
  const lines = raw.trim().split("\n").filter(Boolean);
  return lines.map((line) => {
    const cols = line.trim().split(/\s+/);
    const pid = Number.parseInt(cols[1] ?? "0", 10);
    const cpuPercent = Number.parseFloat(cols[2] ?? "0");
    const memPercent = Number.parseFloat(cols[3] ?? "0");
    const name = cols[10] ?? cols[0] ?? "unknown";
    const command = cols.slice(10).join(" ") || name;
    return { command, cpuPercent, memPercent, name, pid };
  });
}

export function parseMeminfo(raw: string): MemoryInfo {
  const kv = new Map<string, number>();
  for (const line of raw.split("\n")) {
    const match = line.match(/^(\w+):\s+(\d+)/);
    if (match) {
      kv.set(match[1], Number.parseInt(match[2], 10));
    }
  }
  const totalKb = kv.get("MemTotal") ?? 0;
  const freeKb = kv.get("MemFree") ?? 0;
  const buffersKb = kv.get("Buffers") ?? 0;
  const cachedKb = kv.get("Cached") ?? 0;
  const availableKb = kv.get("MemAvailable") ?? freeKb + buffersKb + cachedKb;
  const totalMb = Math.round(totalKb / 1024);
  const freeMb = Math.round(availableKb / 1024);
  const usedMb = totalMb - freeMb;
  return { freeMb, totalMb, usedMb };
}

export function parseDf(raw: string): DiskInfo {
  const lines = raw.trim().split("\n");
  const dataLine = lines[1];
  if (!dataLine) {
    return { freeMb: 0, totalMb: 0, usedMb: 0 };
  }

  const cols = dataLine.trim().split(/\s+/);
  return {
    freeMb: parseSizeToMb(cols[3] ?? "0"),
    totalMb: parseSizeToMb(cols[1] ?? "0"),
    usedMb: parseSizeToMb(cols[2] ?? "0"),
  };
}

function parseSizeToMb(val: string): number {
  const num = Number.parseFloat(val);
  if (Number.isNaN(num)) {
    return 0;
  }
  const upper = val.toUpperCase();
  if (upper.endsWith("G")) {
    return Math.round(num * 1024);
  }
  if (upper.endsWith("M")) {
    return Math.round(num);
  }
  if (upper.endsWith("K")) {
    return Math.round(num / 1024);
  }
  if (upper.endsWith("T")) {
    return Math.round(num * 1024 * 1024);
  }
  return Math.round(num);
}

export function parseUptime(raw: string): number {
  const match = raw.trim().match(/^([\d.]+)/);
  return match ? Number.parseFloat(match[1]) : 0;
}

export function parseNpmPackages(raw: string): PackageInfo[] {
  try {
    const data = JSON.parse(raw);
    const deps: Record<string, { version?: string }> = data.dependencies ?? {};
    return Object.entries(deps).map(([name, info]) => ({
      name,
      version: info.version ?? "unknown",
    }));
  } catch {
    return [];
  }
}

export function parsePipPackages(raw: string): PackageInfo[] {
  try {
    const items = JSON.parse(raw) as { name: string; version: string }[];
    return items.map((p) => ({ name: p.name, version: p.version }));
  } catch {
    return [];
  }
}

export function parseLsOutput(raw: string, basePath: string): FileEntry[] {
  const entries: FileEntry[] = [];
  const lines = raw.trim().split("\n").filter(Boolean);

  for (const line of lines) {
    if (line.startsWith("total ") || line.endsWith(":")) {
      continue;
    }
    const cols = line.trim().split(/\s+/);
    if (cols.length < 9) {
      continue;
    }

    const perms = cols[0] ?? "";
    const size = Number.parseInt(cols[4] ?? "0", 10);
    const month = cols[5] ?? "";
    const day = cols[6] ?? "";
    const timeOrYear = cols[7] ?? "";
    const name = cols.slice(8).join(" ");

    if (name === "." || name === "..") {
      continue;
    }

    const isDir = perms.startsWith("d");
    const entryPath = basePath.endsWith("/")
      ? `${basePath}${name}`
      : `${basePath}/${name}`;

    entries.push({
      isDir,
      modified: `${month} ${day} ${timeOrYear}`,
      name,
      path: entryPath,
      size,
    });
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Orchestrator – runs all diagnostic commands in parallel
// ---------------------------------------------------------------------------

export async function inspectSandbox(
  sandbox: Sandbox,
  sandboxId: string,
  runtime: string,
  path?: string
): Promise<SandboxInspectResponse> {
  const isNode = runtime.startsWith("node");
  const versionCmd = isNode ? "node" : "python3";
  const versionArgs = isNode ? ["-v"] : ["--version"];
  const pkgCmd = isNode ? "npm" : "pip";
  const pkgArgs = isNode
    ? ["ls", "--depth=0", "--json"]
    : ["list", "--format=json"];
  const lsPath = path ?? "/home";

  const [
    psResult,
    memResult,
    dfResult,
    uptimeResult,
    versionResult,
    pkgResult,
    lsResult,
  ] = await Promise.all([
    sandbox.runCommand({
      args: ["aux", "--sort=-%mem", "--no-headers"],
      cmd: "ps",
    }),
    sandbox.runCommand({ args: ["/proc/meminfo"], cmd: "cat" }),
    sandbox.runCommand({ args: ["-h", "/"], cmd: "df" }),
    sandbox.runCommand({ args: ["/proc/uptime"], cmd: "cat" }),
    sandbox.runCommand({ args: versionArgs, cmd: versionCmd }),
    sandbox.runCommand({ args: pkgArgs, cmd: pkgCmd }),
    sandbox.runCommand({ args: ["-la", lsPath], cmd: "ls" }),
  ]);

  const [psOut, memOut, dfOut, uptimeOut, versionOut, pkgOut, lsOut] =
    await Promise.all([
      stdout(psResult),
      stdout(memResult),
      stdout(dfResult),
      stdout(uptimeResult),
      stdout(versionResult),
      stdout(pkgResult),
      stdout(lsResult),
    ]);

  const processes = parseProcesses(psOut);
  const memory = parseMeminfo(memOut);
  const disk = parseDf(dfOut);
  const uptimeSeconds = parseUptime(uptimeOut);
  const runtimeVersion = versionOut.trim();
  const packages = isNode ? parseNpmPackages(pkgOut) : parsePipPackages(pkgOut);
  const files = parseLsOutput(lsOut, lsPath);

  return {
    disk,
    files,
    memory,
    packages,
    processes,
    runtimeVersion,
    sandboxId,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    uptimeSeconds,
  };
}
