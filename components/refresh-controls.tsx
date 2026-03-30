"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { EyebrowPill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

type RefreshResponse = {
  error?: string;
  generatedAt?: string;
  skills?: number;
  dailyBriefs?: number;
};

export function RefreshControls() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleRefresh() {
    setStatusMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/refresh?mode=full", { method: "POST" });
      const payload = (await response.json()) as RefreshResponse;

      if (!response.ok) {
        setErrorMessage(payload.error ?? "Refresh failed.");
        return;
      }

      const generatedAt = payload.generatedAt
        ? new Date(payload.generatedAt).toLocaleString()
        : "just now";
      setStatusMessage(
        `Refresh finished at ${generatedAt}. ${payload.skills ?? 0} skills and ${payload.dailyBriefs ?? 0} briefs updated.`
      );
      router.refresh();
    });
  }

  return (
    <Panel className="gap-4">
      <div>
        <EyebrowPill>Refresh</EyebrowPill>
        <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.03em]">
          Manual refresh
        </h2>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button disabled={isPending} onClick={handleRefresh} type="button">
          {isPending ? "Running..." : "Run full refresh"}
        </Button>
      </div>

      {errorMessage ? <p className="text-sm text-danger">{errorMessage}</p> : null}
      {statusMessage ? <p className="text-ink-soft leading-7">{statusMessage}</p> : null}
    </Panel>
  );
}
