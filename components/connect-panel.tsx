"use client";

import { useState, useTransition } from "react";

import { EyebrowPill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

type ConnectPanelProps = {
  hasSubscription: boolean;
  connectAccountId: string | null;
};

export function ConnectPanel({ hasSubscription, connectAccountId }: ConnectPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleConnect() {
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/connect/onboard", { method: "POST" });
      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        setError(payload.error ?? "Unable to start Stripe Connect onboarding.");
        return;
      }

      window.location.href = payload.url;
    });
  }

  if (!hasSubscription) {
    return (
      <Panel className="gap-3">
        <EyebrowPill>Connect</EyebrowPill>
        <p className="text-sm text-ink-soft">
          Subscribe to Operator first, then connect your Stripe account to receive payments.
        </p>
      </Panel>
    );
  }

  return (
    <Panel className="gap-4">
      <div>
        <EyebrowPill>Connect</EyebrowPill>
        <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.03em]">
          {connectAccountId ? "Connected" : "Not connected"}
        </h2>
      </div>

      {connectAccountId ? (
        <div className="grid gap-2">
          <p className="text-sm text-ink-soft">
            Your Stripe account is connected. Payments for your skills will be deposited directly.
          </p>
          <p className="font-mono text-xs text-ink-muted">{connectAccountId}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          <p className="text-sm text-ink-soft">
            Connect your Stripe account to receive payments when buyers purchase your skills.
          </p>
          <Button disabled={isPending} onClick={handleConnect} type="button">
            {isPending ? "Redirecting..." : "Connect Stripe account"}
          </Button>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
        </div>
      )}
    </Panel>
  );
}
