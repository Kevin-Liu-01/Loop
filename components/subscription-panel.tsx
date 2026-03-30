"use client";

import { ZapIcon } from "@/components/frontier-icons";
import { Badge, EyebrowPill } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { Panel } from "@/components/ui/panel";

type SubscriptionPanelProps = {
  email: string;
  hasSubscription: boolean;
  planSlug: string | null;
  status: string | null;
};

export function SubscriptionPanel({
  email,
  hasSubscription,
  planSlug,
  status
}: SubscriptionPanelProps) {
  return (
    <Panel className="gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <EyebrowPill>Plan</EyebrowPill>
          <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.03em]">
            {hasSubscription ? "Operator" : "Free Signal"}
          </h2>
        </div>
        <small className="text-sm text-ink-soft">{email}</small>
      </div>

      {hasSubscription ? (
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2 text-ink-soft">
            <Badge>{planSlug ?? "operator"}</Badge>
            <Badge muted>{status ?? "active"}</Badge>
            <span className="text-sm text-ink-soft">
              You can create skills, set prices, and manage automations.
            </span>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          <p className="text-sm text-ink-soft">
            Upgrade to Operator ($19/mo) to create skills, set prices, and run automations.
          </p>
          <LinkButton href="/api/billing/checkout?plan=operator" size="sm">
            <ZapIcon className="h-3.5 w-3.5" />
            Upgrade to Operator
          </LinkButton>
        </div>
      )}
    </Panel>
  );
}
