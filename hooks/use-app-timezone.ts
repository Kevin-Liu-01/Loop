"use client";

import { useContext } from "react";

import { TimezoneContext } from "@/components/timezone-provider";

export function useAppTimezone() {
  const ctx = useContext(TimezoneContext);
  if (!ctx) {
    throw new Error("useAppTimezone must be used within <TimezoneProvider>");
  }
  return ctx;
}
