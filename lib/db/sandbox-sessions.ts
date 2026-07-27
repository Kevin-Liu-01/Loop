import { getServerSupabase } from "@/lib/db/client";

const ACTIVE_SANDBOX_STATUSES = ["pending", "running"];

interface SandboxOwnershipRecord {
  sandboxId: string;
  clerkUserId: string;
  runtime: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  stoppedAt: string | null;
}

function mapOwnershipRow(row: {
  sandbox_id: string;
  clerk_user_id: string;
  runtime: string;
  status: string;
  created_at: string;
  expires_at: string;
  stopped_at: string | null;
}): SandboxOwnershipRecord {
  return {
    clerkUserId: row.clerk_user_id,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    runtime: row.runtime,
    sandboxId: row.sandbox_id,
    status: row.status,
    stoppedAt: row.stopped_at,
  };
}

export async function countActiveSandboxSessions(
  clerkUserId: string,
  now = new Date()
): Promise<number> {
  const db = getServerSupabase();
  const { count, error } = await db
    .from("sandbox_sessions")
    .select("id", { count: "exact", head: true })
    .eq("clerk_user_id", clerkUserId)
    .in("status", ACTIVE_SANDBOX_STATUSES)
    .gt("expires_at", now.toISOString());

  if (error) {
    throw new Error(`countActiveSandboxSessions failed: ${error.message}`);
  }
  return count ?? 0;
}

export async function recordSandboxOwnership(input: {
  sandboxId: string;
  clerkUserId: string;
  runtime: string;
  status: string;
  expiresAt: string;
}): Promise<void> {
  const db = getServerSupabase();
  const { error } = await db.from("sandbox_sessions").insert({
    clerk_user_id: input.clerkUserId,
    expires_at: input.expiresAt,
    runtime: input.runtime,
    sandbox_id: input.sandboxId,
    status: input.status,
  });
  if (error) {
    throw new Error(`recordSandboxOwnership failed: ${error.message}`);
  }
}

export async function getSandboxOwnership(
  sandboxId: string
): Promise<SandboxOwnershipRecord | null> {
  const db = getServerSupabase();
  const { data, error } = await db
    .from("sandbox_sessions")
    .select(
      "sandbox_id,clerk_user_id,runtime,status,created_at,expires_at,stopped_at"
    )
    .eq("sandbox_id", sandboxId)
    .maybeSingle();
  if (error) {
    throw new Error(`getSandboxOwnership failed: ${error.message}`);
  }
  return data ? mapOwnershipRow(data) : null;
}

export async function updateSandboxOwnershipStatus(
  sandboxId: string,
  status: string
): Promise<void> {
  const db = getServerSupabase();
  const stoppedAt = ["stopped", "failed", "aborted"].includes(status)
    ? new Date().toISOString()
    : null;
  const { error } = await db
    .from("sandbox_sessions")
    .update({ status, stopped_at: stoppedAt })
    .eq("sandbox_id", sandboxId);
  if (error) {
    throw new Error(`updateSandboxOwnershipStatus failed: ${error.message}`);
  }
}
