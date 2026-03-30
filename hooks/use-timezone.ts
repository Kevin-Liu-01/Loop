"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const COOKIE_NAME = "loop_tz";
const MAX_AGE_SEC = 60 * 60 * 24 * 400;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function isValidIanaTimeZone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export type UseTimezoneResult = {
  /** Effective zone after cookie + server resolution. */
  timeZone: string;
  /** Zone used for the last server render (from overview). */
  serverTimeZone: string;
  /** Persist cookie and refresh RSC. */
  setTimeZone: (iana: string) => void;
  /** `Intl` default for this browser profile. */
  browserTimeZone: string;
};

/**
 * Keeps `loop_tz` in sync with UI and triggers `router.refresh()` so server
 * usage windows recompute in the chosen IANA zone.
 */
export function useTimezone(serverTimeZone: string): UseTimezoneResult {
  const router = useRouter();
  const [clientTz, setClientTz] = useState<string | null>(null);

  useEffect(() => {
    const c = readCookie(COOKIE_NAME);
    if (c && isValidIanaTimeZone(c)) setClientTz(c);
  }, []);

  const browserTimeZone =
    typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";

  const timeZone = clientTz ?? serverTimeZone;

  const setTimeZone = useCallback(
    (iana: string) => {
      if (!isValidIanaTimeZone(iana)) return;
      document.cookie = `${COOKIE_NAME}=${encodeURIComponent(iana)}; path=/; max-age=${MAX_AGE_SEC}; SameSite=Lax`;
      setClientTz(iana);
      router.refresh();
    },
    [router]
  );

  return {
    timeZone,
    serverTimeZone,
    setTimeZone,
    browserTimeZone,
  };
}
