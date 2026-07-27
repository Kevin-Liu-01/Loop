import { execFile } from "node:child_process";
import { performance } from "node:perf_hooks";
import { setTimeout as wait } from "node:timers/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const REQUEST_TIMEOUT_MS = 10_000;

function option(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index !== -1 ? process.argv[index + 1] : fallback;
}

function positiveInteger(name, fallback) {
  const parsed = Number.parseInt(option(name, String(fallback)), 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error(`--${name} must be a positive integer`);
  }
  return parsed;
}

function nonNegativeInteger(name, fallback) {
  const parsed = Number.parseInt(option(name, String(fallback)), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`--${name} must be a non-negative integer`);
  }
  return parsed;
}

function percentile(values, percentileRank) {
  const sorted = values.toSorted((left, right) => left - right);
  const index = Math.max(
    0,
    Math.ceil((percentileRank / 100) * sorted.length) - 1
  );
  return sorted[index];
}

async function measure(url) {
  const startedAt = performance.now();
  const response = await fetch(url, {
    headers: { "user-agent": "loop-http-profiler/1.0" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const headersAt = performance.now();
  const body = await response.arrayBuffer();

  return {
    bytes: body.byteLength,
    ok: response.ok,
    status: response.status,
    totalMs: performance.now() - startedAt,
    ttfbMs: headersAt - startedAt,
  };
}

const buildCurlArguments = (url) => [
  "--compressed",
  "--location",
  "--max-time",
  String(REQUEST_TIMEOUT_MS / 1000),
  "--output",
  "/dev/null",
  "--show-error",
  "--silent",
  "--write-out",
  "%{http_code} %{time_starttransfer} %{time_total} %{size_download}",
  url,
];

function parseCurlMeasurement(stdout) {
  const measurement = stdout.trim().split("\n").at(-1) ?? "";
  const [status, ttfbSeconds, totalSeconds, bytes] = measurement.split(" ");
  const statusCode = Number.parseInt(status, 10);
  return {
    bytes: Number.parseInt(bytes, 10),
    ok: statusCode >= 200 && statusCode < 400,
    status: statusCode,
    totalMs: Number.parseFloat(totalSeconds) * 1000,
    ttfbMs: Number.parseFloat(ttfbSeconds) * 1000,
  };
}

async function measureWithCurl(url) {
  const { stdout } = await execFileAsync("curl", buildCurlArguments(url));
  return parseCurlMeasurement(stdout);
}

async function measureWithVercelCurl(url) {
  const { stdout } = await execFileAsync("pnpm", [
    "dlx",
    "vercel",
    "curl",
    url,
    "--compressed",
    "--location",
    "--max-time",
    String(REQUEST_TIMEOUT_MS / 1000),
    "--output",
    "/dev/null",
    "--show-error",
    "--silent",
    "--write-out",
    "%{http_code} %{time_starttransfer} %{time_total} %{size_download}",
  ]);
  return parseCurlMeasurement(stdout);
}

async function runConcurrent(
  url,
  requestCount,
  concurrency,
  delayMs,
  measureRequest
) {
  const results = [];
  let cursor = 0;

  async function worker() {
    while (cursor < requestCount) {
      cursor += 1;
      try {
        results.push(await measureRequest(url));
      } catch {
        results.push({
          bytes: 0,
          ok: false,
          status: 0,
          totalMs: REQUEST_TIMEOUT_MS,
          ttfbMs: REQUEST_TIMEOUT_MS,
        });
      }
      if (delayMs > 0) {
        await wait(delayMs);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, requestCount) }, () => worker())
  );
  return results;
}

const url = option("url", "http://localhost:3000");
const requests = positiveInteger("requests", 24);
const concurrency = positiveInteger("concurrency", 4);
const warmups = positiveInteger("warmups", 2);
const budgetMs = positiveInteger("budget", 300);
const delayMs = nonNegativeInteger("delay", 0);
const engine = option("engine", "fetch");
if (engine !== "fetch" && engine !== "curl" && engine !== "vercel") {
  throw new Error('--engine must be "fetch", "curl", or "vercel"');
}
const measureRequest =
  engine === "vercel"
    ? measureWithVercelCurl
    : engine === "curl"
      ? measureWithCurl
      : measure;

for (let index = 0; index < warmups; index += 1) {
  await measureRequest(url);
  if (delayMs > 0) {
    await wait(delayMs);
  }
}

const results = await runConcurrent(
  url,
  requests,
  concurrency,
  delayMs,
  measureRequest
);
const ttfb = results.map((result) => result.ttfbMs);
const total = results.map((result) => result.totalMs);
const failures = results.filter((result) => !result.ok);
const statusCounts = Object.fromEntries(
  [...new Set(results.map((result) => result.status))]
    .toSorted((left, right) => left - right)
    .map((status) => [
      status,
      results.filter((result) => result.status === status).length,
    ])
);
const p95Ttfb = percentile(ttfb, 95);

console.table({
  TTFB: {
    p50: `${percentile(ttfb, 50).toFixed(1)}ms`,
    p95: `${p95Ttfb.toFixed(1)}ms`,
  },
  Total: {
    p50: `${percentile(total, 50).toFixed(1)}ms`,
    p95: `${percentile(total, 95).toFixed(1)}ms`,
  },
});
console.log(
  `${requests} requests · concurrency ${concurrency} · ${delayMs}ms pacing · ${engine} · ${results[0]?.bytes ?? 0} bytes · ${failures.length} failures`
);
console.log(`statuses: ${JSON.stringify(statusCounts)}`);
console.log(
  `slowest TTFB: ${ttfb
    .toSorted((left, right) => right - left)
    .slice(0, 5)
    .map((value) => `${value.toFixed(1)}ms`)
    .join(", ")}`
);

if (failures.length > 0 || p95Ttfb > budgetMs) {
  console.error(
    `FAIL: p95 TTFB ${p95Ttfb.toFixed(1)}ms exceeds ${budgetMs}ms budget or requests failed.`
  );
  process.exitCode = 1;
} else {
  console.log(
    `PASS: p95 TTFB ${p95Ttfb.toFixed(1)}ms is within the ${budgetMs}ms budget.`
  );
}
