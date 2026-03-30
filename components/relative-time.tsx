"use client";

import { useEffect, useReducer } from "react";

import { formatRelativeDate } from "@/lib/format";

type RelativeTimeProps = {
  date: string;
  className?: string;
};

export function RelativeTime({ date, className }: RelativeTimeProps) {
  const [, tick] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [date]);

  return (
    <time dateTime={date} suppressHydrationWarning className={className}>
      {formatRelativeDate(date)}
    </time>
  );
}
