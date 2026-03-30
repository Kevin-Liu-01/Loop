import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  parseProcesses,
  parseMeminfo,
  parseDf,
  parseUptime,
  parseNpmPackages,
  parsePipPackages,
  parseLsOutput,
} from "@/lib/sandbox-inspect";

// ---------------------------------------------------------------------------
// parseProcesses
// ---------------------------------------------------------------------------

describe("parseProcesses", () => {
  it("parses ps aux output into structured process list", () => {
    const raw = [
      "root         1  0.0  0.1   2396  1536 ?        Ss   00:00   0:00 /sbin/init",
      "root        42  1.2  3.4  45612 34816 ?        Sl   00:01   0:05 node /app/server.js",
      "root        99  0.0  0.0   2196   512 ?        S    00:02   0:00 sleep 60",
    ].join("\n");

    const result = parseProcesses(raw);
    assert.equal(result.length, 3);

    assert.equal(result[0].pid, 1);
    assert.equal(result[0].cpuPercent, 0.0);
    assert.equal(result[0].memPercent, 0.1);
    assert.ok(result[0].command.includes("/sbin/init"));

    assert.equal(result[1].pid, 42);
    assert.equal(result[1].cpuPercent, 1.2);
    assert.equal(result[1].memPercent, 3.4);
    assert.ok(result[1].command.includes("node"));
  });

  it("returns empty array for empty input", () => {
    assert.deepEqual(parseProcesses(""), []);
    assert.deepEqual(parseProcesses("  \n  \n"), []);
  });
});

// ---------------------------------------------------------------------------
// parseMeminfo
// ---------------------------------------------------------------------------

describe("parseMeminfo", () => {
  const SAMPLE = [
    "MemTotal:        2048000 kB",
    "MemFree:          512000 kB",
    "MemAvailable:     768000 kB",
    "Buffers:          128000 kB",
    "Cached:           256000 kB",
    "SwapTotal:        512000 kB",
    "SwapFree:         512000 kB",
  ].join("\n");

  it("parses /proc/meminfo into MB values", () => {
    const result = parseMeminfo(SAMPLE);
    assert.equal(result.totalMb, 2000);
    assert.equal(result.freeMb, 750);
    assert.equal(result.usedMb, 1250);
  });

  it("falls back to MemFree + Buffers + Cached when MemAvailable absent", () => {
    const raw = [
      "MemTotal:        1024000 kB",
      "MemFree:          256000 kB",
      "Buffers:           64000 kB",
      "Cached:           128000 kB",
    ].join("\n");
    const result = parseMeminfo(raw);
    assert.equal(result.totalMb, 1000);
    assert.equal(result.freeMb, 438);
    assert.equal(result.usedMb, 562);
  });

  it("returns zeros for empty input", () => {
    const result = parseMeminfo("");
    assert.equal(result.totalMb, 0);
    assert.equal(result.usedMb, 0);
    assert.equal(result.freeMb, 0);
  });
});

// ---------------------------------------------------------------------------
// parseDf
// ---------------------------------------------------------------------------

describe("parseDf", () => {
  it("parses df -h output with G/M suffixes", () => {
    const raw = [
      "Filesystem      Size  Used Avail Use% Mounted on",
      "/dev/root        10G  3.2G  6.5G  33% /",
    ].join("\n");

    const result = parseDf(raw);
    assert.equal(result.totalMb, 10240);
    assert.equal(result.usedMb, 3277);
    assert.equal(result.freeMb, 6656);
  });

  it("parses df -h output with M suffixes", () => {
    const raw = [
      "Filesystem      Size  Used Avail Use% Mounted on",
      "/dev/root       512M  128M  384M  25% /",
    ].join("\n");

    const result = parseDf(raw);
    assert.equal(result.totalMb, 512);
    assert.equal(result.usedMb, 128);
    assert.equal(result.freeMb, 384);
  });

  it("returns zeros for malformed input", () => {
    const result = parseDf("some garbage");
    assert.equal(result.totalMb, 0);
  });
});

// ---------------------------------------------------------------------------
// parseUptime
// ---------------------------------------------------------------------------

describe("parseUptime", () => {
  it("parses /proc/uptime seconds", () => {
    assert.equal(parseUptime("345.67 1234.56"), 345.67);
  });

  it("handles integer uptime", () => {
    assert.equal(parseUptime("60 120"), 60);
  });

  it("returns 0 for empty input", () => {
    assert.equal(parseUptime(""), 0);
  });
});

// ---------------------------------------------------------------------------
// parseNpmPackages
// ---------------------------------------------------------------------------

describe("parseNpmPackages", () => {
  it("parses npm ls --json output", () => {
    const raw = JSON.stringify({
      name: "sandbox",
      dependencies: {
        express: { version: "4.18.2" },
        lodash: { version: "4.17.21" },
      },
    });

    const result = parseNpmPackages(raw);
    assert.equal(result.length, 2);
    assert.equal(result[0].name, "express");
    assert.equal(result[0].version, "4.18.2");
    assert.equal(result[1].name, "lodash");
    assert.equal(result[1].version, "4.17.21");
  });

  it("handles empty dependencies", () => {
    const raw = JSON.stringify({ name: "empty", dependencies: {} });
    assert.deepEqual(parseNpmPackages(raw), []);
  });

  it("returns empty array for invalid JSON", () => {
    assert.deepEqual(parseNpmPackages("not json"), []);
  });

  it("returns empty array for no dependencies key", () => {
    assert.deepEqual(parseNpmPackages(JSON.stringify({ name: "bare" })), []);
  });
});

// ---------------------------------------------------------------------------
// parsePipPackages
// ---------------------------------------------------------------------------

describe("parsePipPackages", () => {
  it("parses pip list --format=json output", () => {
    const raw = JSON.stringify([
      { name: "requests", version: "2.31.0" },
      { name: "flask", version: "3.0.0" },
    ]);

    const result = parsePipPackages(raw);
    assert.equal(result.length, 2);
    assert.equal(result[0].name, "requests");
    assert.equal(result[1].version, "3.0.0");
  });

  it("returns empty array for invalid JSON", () => {
    assert.deepEqual(parsePipPackages("bad"), []);
  });
});

// ---------------------------------------------------------------------------
// parseLsOutput
// ---------------------------------------------------------------------------

describe("parseLsOutput", () => {
  it("parses ls -la output into file entries", () => {
    const raw = [
      "total 32",
      "drwxr-xr-x  3 root root 4096 Mar 28 12:00 .",
      "drwxr-xr-x  5 root root 4096 Mar 28 12:00 ..",
      "drwxr-xr-x  2 root root 4096 Mar 28 12:00 node_modules",
      "-rw-r--r--  1 root root  256 Mar 28 12:01 package.json",
      "-rw-r--r--  1 root root 1024 Mar 28 12:01 index.js",
    ].join("\n");

    const result = parseLsOutput(raw, "/home");
    assert.equal(result.length, 3);

    const dir = result.find((f) => f.name === "node_modules");
    assert.ok(dir);
    assert.equal(dir.isDir, true);
    assert.equal(dir.path, "/home/node_modules");

    const file = result.find((f) => f.name === "package.json");
    assert.ok(file);
    assert.equal(file.isDir, false);
    assert.equal(file.size, 256);
    assert.equal(file.path, "/home/package.json");
  });

  it("skips . and .. entries", () => {
    const raw = [
      "total 8",
      "drwxr-xr-x  2 root root 4096 Mar 28 12:00 .",
      "drwxr-xr-x  5 root root 4096 Mar 28 12:00 ..",
    ].join("\n");

    assert.deepEqual(parseLsOutput(raw, "/home"), []);
  });

  it("handles trailing slash on base path", () => {
    const raw = "-rw-r--r--  1 root root 100 Mar 28 12:00 test.txt";
    const result = parseLsOutput(raw, "/home/");
    assert.equal(result[0].path, "/home/test.txt");
  });

  it("returns empty for empty input", () => {
    assert.deepEqual(parseLsOutput("", "/"), []);
  });
});
