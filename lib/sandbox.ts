import { Sandbox } from "@vercel/sandbox";

export type SandboxRuntime = "node24" | "node22" | "python3.13";

export type SandboxSessionInfo = {
  sandboxId: string;
  runtime: SandboxRuntime;
  status: string;
};

const DEFAULT_TIMEOUT_MS = 120_000;

export type SandboxAuthError = {
  code: "SANDBOX_AUTH_FAILED";
  message: string;
  steps: string[];
};

function isSandboxAuthError(msg: string): boolean {
  return (
    msg.includes("403") ||
    msg.includes("forbidden") ||
    msg.includes("Not authorized") ||
    msg.includes("VERCEL_TOKEN") ||
    msg.includes("not linked")
  );
}

export function buildSandboxAuthError(): SandboxAuthError {
  return {
    code: "SANDBOX_AUTH_FAILED",
    message: "Sandbox requires Vercel project authentication",
    steps: [
      "Run `vercel link` to connect this repo to your Vercel project",
      "Run `vercel env pull` to sync environment variables",
      "Restart the dev server (`pnpm dev`)",
      "If on a team, check that your role has Sandbox permissions",
    ],
  };
}

export async function createSandboxSession(
  runtime: SandboxRuntime,
  env?: Record<string, string>,
): Promise<SandboxSessionInfo> {
  try {
    const sandbox = await Sandbox.create({
      runtime,
      timeout: DEFAULT_TIMEOUT_MS,
      env,
    });

    return {
      sandboxId: sandbox.sandboxId,
      runtime,
      status: sandbox.status,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (isSandboxAuthError(msg)) {
      const authErr = buildSandboxAuthError();
      throw new Error(JSON.stringify(authErr));
    }
    throw err;
  }
}

export async function getSandboxInstance(sandboxId: string): Promise<Sandbox> {
  return Sandbox.get({ sandboxId });
}

export async function getSandboxStatus(
  sandboxId: string
): Promise<SandboxSessionInfo | null> {
  try {
    const sandbox = await Sandbox.get({ sandboxId });
    return {
      sandboxId: sandbox.sandboxId,
      runtime: "node24",
      status: sandbox.status
    };
  } catch {
    return null;
  }
}

export async function stopSandboxSession(sandboxId: string): Promise<void> {
  try {
    const sandbox = await Sandbox.get({ sandboxId });
    await sandbox.stop();
  } catch {
    // Already stopped or expired
  }
}
