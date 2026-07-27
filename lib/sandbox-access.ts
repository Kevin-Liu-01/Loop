import { AuthError, requireAuth } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import { getSandboxOwnership } from "@/lib/db/sandbox-sessions";

export async function requireSandboxOwner(
  sandboxId: string
): Promise<SessionUser> {
  const session = await requireAuth();
  const ownership = await getSandboxOwnership(sandboxId);
  if (!ownership || ownership.clerkUserId !== session.userId) {
    throw new AuthError("Sandbox not found.", 404);
  }
  return session;
}
