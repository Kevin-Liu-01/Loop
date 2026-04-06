"use client";

import { CheckIcon, ZapIcon } from "@/components/frontier-icons";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { StatusDot } from "@/components/ui/status-dot";

type SubscriptionPanelProps = {
  email: string;
  hasSubscription: boolean;
  planSlug: string | null;
  status: string | null;
  customerId: string | null;
};

const OPERATOR_FEATURES = [
  "Unlimited skills",
  "AI-powered automations",
  "Custom import sources",
  "Marketplace pricing & payouts",
];

function FeatureCheck({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-muted">
      <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
      {children}
    </li>
  );
}

function StatusLabel({ status }: { status: string | null }) {
  const normalized = (status ?? "active").toLowerCase();
  const tone =
    normalized === "active"
      ? "fresh"
      : normalized === "past_due"
        ? "stale"
        : normalized === "canceled"
          ? "error"
          : "idle";

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-tight text-ink-soft">
      <StatusDot tone={tone} pulse={tone === "fresh"} />
      {normalized}
    </span>
  );
}

export function SubscriptionPanel({
  email,
  hasSubscription,
  planSlug,
  status,
  customerId,
}: SubscriptionPanelProps) {
  if (!hasSubscription) {
    return (
      <div className="grid gap-5 rounded-none border border-line bg-paper-3/92 p-5 sm:p-6">
        <div>
          <p className="m-0 text-sm font-semibold tracking-tight text-ink">Free plan</p>
          <p className="m-0 mt-1 text-xs text-ink-faint">{email}</p>
        </div>
        <p className="m-0 text-sm leading-relaxed text-ink-muted">
          You can create 1 skill for free. Upgrade to Operator to unlock everything.
        </p>
        <ul className="m-0 grid gap-2 p-0 list-none">
          {OPERATOR_FEATURES.map((f) => (
            <FeatureCheck key={f}>{f}</FeatureCheck>
          ))}
        </ul>
        <div>
          <LinkButton href="/api/billing/checkout?plan=operator" size="sm">
            <ZapIcon className="h-3.5 w-3.5" />
            Upgrade to Operator – $19/mo
          </LinkButton>
        </div>
      </div>
    );
  }

  const portalHref = customerId
    ? `/api/billing/portal?customer=${encodeURIComponent(customerId)}`
    : "/settings/subscription?billing=no-customer";

  return (
    <div className="grid gap-5 rounded-none border border-line bg-paper-3/92 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/25 bg-accent/8 shadow-[0_1px_0_0_rgba(232,101,10,0.08)]">
            <ZapIcon className="h-4.5 w-4.5 text-accent" />
          </span>
          <div>
            <p className="m-0 text-sm font-semibold tracking-tight text-ink">Operator</p>
            <p className="m-0 text-xs text-ink-faint">{email}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge color="orange">
            {(planSlug ?? "operator").charAt(0).toUpperCase() + (planSlug ?? "operator").slice(1)}
          </Badge>
          <StatusLabel status={status} />
        </div>
      </div>

      <ul className="m-0 grid grid-cols-1 gap-2 p-0 list-none sm:grid-cols-2">
        {OPERATOR_FEATURES.map((f) => (
          <FeatureCheck key={f}>{f}</FeatureCheck>
        ))}
      </ul>

      <div>
        <LinkButton href={portalHref} size="sm" variant="ghost">
          Manage billing
        </LinkButton>
      </div>
    </div>
  );
}
