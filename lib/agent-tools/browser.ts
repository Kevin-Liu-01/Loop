import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { promisify } from "node:util";

import {
  BROWSER_COMMAND_TIMEOUT_MS,
  BROWSER_MAX_OUTPUT,
  BROWSER_SESSION_PREFIX,
} from "@/lib/agent-tools/constants";

const execFileAsync = promisify(execFile);

const BIN_PATH = path.resolve(
  process.cwd(),
  "node_modules",
  ".bin",
  "agent-browser"
);

let browserAvailableCache: boolean | null = null;

export async function isBrowserAvailable(): Promise<boolean> {
  if (browserAvailableCache !== null) return browserAvailableCache;
  try {
    await execFileAsync(BIN_PATH, ["--version"], { timeout: 8_000 });
    browserAvailableCache = true;
  } catch {
    browserAvailableCache = false;
  }
  return browserAvailableCache;
}

export function resetBrowserAvailableCache(): void {
  browserAvailableCache = null;
}

export function overrideBrowserAvailable(value: boolean | null): void {
  browserAvailableCache = value;
}

export function createSessionId(): string {
  return `${BROWSER_SESSION_PREFIX}${randomUUID().slice(0, 8)}`;
}

export async function runBrowserCommand(
  args: string[],
  options?: { sessionId?: string; timeoutMs?: number }
): Promise<string> {
  const sessionArgs = options?.sessionId
    ? ["--session", options.sessionId]
    : [];
  const timeout = options?.timeoutMs ?? BROWSER_COMMAND_TIMEOUT_MS;

  const { stdout } = await execFileAsync(
    BIN_PATH,
    [...sessionArgs, ...args],
    {
      timeout,
      maxBuffer: 2 * 1024 * 1024,
      env: {
        ...process.env,
        AGENT_BROWSER_MAX_OUTPUT: String(BROWSER_MAX_OUTPUT),
      },
    }
  );
  return stdout.trim();
}

export async function runBrowserJson<T = unknown>(
  args: string[],
  options?: { sessionId?: string; timeoutMs?: number }
): Promise<T> {
  const raw = await runBrowserCommand([...args, "--json"], options);
  const parsed = JSON.parse(raw) as { success: boolean; data?: T; error?: string };
  if (!parsed.success) {
    throw new Error(parsed.error ?? "agent-browser returned unsuccessful response");
  }
  return parsed.data as T;
}

export async function closeBrowserSession(sessionId: string): Promise<void> {
  try {
    await runBrowserCommand(["close"], { sessionId, timeoutMs: 5_000 });
  } catch {
    // Session may already be closed — safe to ignore
  }
}
