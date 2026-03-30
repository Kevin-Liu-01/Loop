import { cookies } from "next/headers";

/** Validated IANA id from `loop_tz` cookie, else UTC. */
export async function getUsageTimeZoneFromCookie(): Promise<string> {
  const raw = (await cookies()).get("loop_tz")?.value;
  if (!raw) return "UTC";
  try {
    Intl.DateTimeFormat(undefined, { timeZone: raw });
    return raw;
  } catch {
    return "UTC";
  }
}
