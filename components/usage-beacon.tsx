"use client";

import { useEffect } from "react";

import type { CategorySlug, UsageEventKind } from "@/lib/types";

interface UsageBeaconProps {
  kind: Exclude<UsageEventKind, "api_call">;
  label: string;
  path?: string;
  skillSlug?: string;
  categorySlug?: CategorySlug;
  details?: string;
  dedupeKey?: string;
}

interface ClientUsagePayload {
  kind: Exclude<UsageEventKind, "api_call">;
  label: string;
  path?: string;
  skillSlug?: string;
  categorySlug?: CategorySlug;
  details?: string;
}

export async function postUsageEvent(payload: ClientUsagePayload) {
  const body = JSON.stringify(payload);

  if (
    typeof navigator !== "undefined" &&
    typeof navigator.sendBeacon === "function"
  ) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/usage", blob);
    return;
  }

  try {
    await fetch("/api/usage", {
      body,
      headers: {
        "content-type": "application/json",
      },
      keepalive: true,
      method: "POST",
    });
  } catch {
    // Telemetry is best-effort and must never interrupt the user action.
  }
}

export function UsageBeacon({
  categorySlug,
  dedupeKey,
  details,
  kind,
  label,
  path,
  skillSlug,
}: UsageBeaconProps) {
  useEffect(() => {
    if (kind === "page_view") {
      return;
    }

    if (dedupeKey) {
      const storageKey = `loop.usage.${dedupeKey}`;
      if (window.sessionStorage.getItem(storageKey)) {
        return;
      }
      window.sessionStorage.setItem(storageKey, "1");
    }

    void postUsageEvent({
      categorySlug,
      details,
      kind,
      label,
      path,
      skillSlug,
    });
  }, [categorySlug, dedupeKey, details, kind, label, path, skillSlug]);

  return null;
}
