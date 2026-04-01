"use client";

import { createContext, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const COOKIE_NAME = "loop_tz";
const MAX_AGE_SEC = 60 * 60 * 24 * 400;

export type TimezoneContextValue = {
  timeZone: string;
  setTimeZone: (iana: string) => void;
  browserTimeZone: string;
};

export const TimezoneContext = createContext<TimezoneContextValue | null>(null);

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

function getBrowserTimeZone(): string {
  return typeof Intl !== "undefined"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "UTC";
}

export function TimezoneProvider({
  serverTimeZone,
  children,
}: {
  serverTimeZone: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [clientTz, setClientTz] = useState<string | null>(null);
  const browserTimeZone = getBrowserTimeZone();

  useEffect(() => {
    const cookie = readCookie(COOKIE_NAME);
    if (cookie && isValidIanaTimeZone(cookie)) {
      setClientTz(cookie);
    }
  }, []);

  const timeZone = clientTz ?? serverTimeZone;

  const setTimeZone = useCallback(
    (iana: string) => {
      if (!isValidIanaTimeZone(iana)) return;
      document.cookie = `${COOKIE_NAME}=${encodeURIComponent(iana)}; path=/; max-age=${MAX_AGE_SEC}; SameSite=Lax`;
      setClientTz(iana);
      router.refresh();
    },
    [router],
  );

  return (
    <TimezoneContext value={{ timeZone, setTimeZone, browserTimeZone }}>
      {children}
    </TimezoneContext>
  );
}
