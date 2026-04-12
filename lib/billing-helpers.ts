import { isAdminEmail } from "@/lib/admin";
import { getUserSubscription } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";

export { isAdminEmail } from "@/lib/admin";

export async function isOperatorOrAdmin(
  session: SessionUser
): Promise<boolean> {
  if (isAdminEmail(session.email)) {
    return true;
  }
  const subscription = await getUserSubscription(session.userId);
  return subscription !== null;
}
