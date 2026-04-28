"use client";

import { Fragment } from "react";

import {
  AutomationIcon,
  CheckIcon,
  ClockIcon,
  CpuIcon,
  CubeStackIcon,
  GlobeIcon,
  MessageIcon,
  SparkIcon,
  TerminalIcon,
  WalletIcon,
  ZapIcon,
} from "@/components/frontier-icons";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/cn";
import {
  FREE_AUTOMATION_LIMIT,
  FREE_CONVERSATION_LIMIT,
  FREE_DAILY_AGENT_RUN_LIMIT,
  FREE_SANDBOX_CONVERSATION_LIMIT,
  MAX_SKILLS_PER_USER,
} from "@/lib/skill-limit-constants";

interface SubscriptionPanelProps {
  email: string;
  hasSubscription: boolean;
  planSlug: string | null;
  status: string | null;
  customerId: string | null;
}

interface ComparisonRow {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  free: string;
  operator: string;
  section: "usage" | "features";
}

const COMPARISON: ComparisonRow[] = [
  {
    icon: CubeStackIcon,
    label: "Skills",
    free: `${MAX_SKILLS_PER_USER}`,
    operator: `${MAX_SKILLS_PER_USER}`,
    section: "usage",
  },
  {
    icon: AutomationIcon,
    label: "Automations",
    free: `${FREE_AUTOMATION_LIMIT}`,
    operator: "Unlimited",
    section: "usage",
  },
  {
    icon: TerminalIcon,
    label: "Sandbox conversations",
    free: `${FREE_SANDBOX_CONVERSATION_LIMIT}`,
    operator: "Unlimited",
    section: "usage",
  },
  {
    icon: MessageIcon,
    label: "Agent conversations",
    free: `${FREE_CONVERSATION_LIMIT}`,
    operator: "Unlimited",
    section: "usage",
  },
  {
    icon: SparkIcon,
    label: "Agent messages / day",
    free: `${FREE_DAILY_AGENT_RUN_LIMIT}`,
    operator: "Unlimited",
    section: "usage",
  },
  {
    icon: ClockIcon,
    label: "Manual refresh cooldown",
    free: "15 min",
    operator: "5 min",
    section: "usage",
  },
  {
    icon: CpuIcon,
    label: "Model selection",
    free: "",
    operator: "included",
    section: "features",
  },
  {
    icon: GlobeIcon,
    label: "Custom import sources",
    free: "",
    operator: "included",
    section: "features",
  },
  {
    icon: WalletIcon,
    label: "Marketplace pricing & payouts",
    free: "",
    operator: "included",
    section: "features",
  },
];

const COL =
  "grid grid-cols-[1fr_minmax(120px,1fr)_minmax(120px,1fr)] sm:grid-cols-[1fr_minmax(160px,1.2fr)_minmax(160px,1.2fr)]";

const OPERATOR_CELL =
  "relative isolate overflow-hidden grain-tint-accent grain-subtle";

function CellValue({
  value,
  isOperator,
}: {
  value: string;
  isOperator?: boolean;
}) {
  if (value === "included") {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success/12">
        <CheckIcon className="h-3 w-3 text-success" />
      </span>
    );
  }
  if (value === "") {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-ink-faint/8 dark:bg-ink-faint/12">
        <span className="block h-px w-2.5 bg-ink-faint/60" />
      </span>
    );
  }
  if (value === "Unlimited") {
    return (
      <span className="text-sm font-semibold tabular-nums text-accent">
        &infin;
      </span>
    );
  }
  return (
    <span
      className={cn(
        "text-sm font-medium tabular-nums",
        isOperator ? "text-ink" : "text-ink-soft"
      )}
    >
      {value}
    </span>
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

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        COL,
        "border-b border-line bg-paper-2/50 dark:bg-paper-2/30"
      )}
    >
      <div className="col-span-3 px-3 py-1.5 sm:px-4">
        <span className="text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-ink-faint">
          {children}
        </span>
      </div>
    </div>
  );
}

function ComparisonRows({ rows }: { rows: ComparisonRow[] }) {
  return (
    <>
      {rows.map((row, i) => {
        const Icon = row.icon;
        const isLast = i === rows.length - 1;
        const borderB = isLast ? "" : "border-b border-line/50";
        return (
          <Fragment key={row.label}>
            <div className={cn(COL)}>
              <div
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 sm:px-4",
                  borderB
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
                <span className="text-[0.8125rem] leading-snug text-ink-soft">
                  {row.label}
                </span>
              </div>
              <div
                className={cn(
                  "flex items-center justify-center border-l border-line px-2 py-2.5",
                  borderB
                )}
              >
                <CellValue value={row.free} />
              </div>
              <div
                className={cn(
                  "flex items-center justify-center border-l border-line px-2 py-2.5",
                  borderB,
                  OPERATOR_CELL
                )}
              >
                <CellValue value={row.operator} isOperator />
              </div>
            </div>
          </Fragment>
        );
      })}
    </>
  );
}

export function SubscriptionPanel({
  email,
  hasSubscription,
  planSlug,
  status,
  customerId,
}: SubscriptionPanelProps) {
  const currentPlan = hasSubscription ? "operator" : "free";
  const portalHref = customerId
    ? "/api/billing/portal"
    : "/settings/subscription?billing=no-customer";

  const usageRows = COMPARISON.filter((r) => r.section === "usage");
  const featureRows = COMPARISON.filter((r) => r.section === "features");

  return (
    <div className="grid gap-6">
      {/* ── Active subscriber status ── */}
      {hasSubscription && (
        <div className="flex flex-wrap items-center justify-between gap-4 border border-accent/20 bg-accent/[0.035] p-4 dark:bg-accent/[0.06]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 shadow-[0_1px_0_0_rgba(232,101,10,0.08)]">
              <ZapIcon className="h-4.5 w-4.5 text-accent" />
            </span>
            <div>
              <p className="m-0 text-sm font-semibold tracking-tight text-ink">
                Operator
              </p>
              <p className="m-0 text-xs text-ink-faint">{email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge color="orange">
              {(planSlug ?? "operator").charAt(0).toUpperCase() +
                (planSlug ?? "operator").slice(1)}
            </Badge>
            <StatusLabel status={status} />
            <LinkButton href={portalHref} size="sm" variant="ghost">
              Manage billing
            </LinkButton>
          </div>
        </div>
      )}

      {/* ── Comparison table ── */}
      <div className="overflow-hidden border border-line">
        {/* Plan headers */}
        <div className={COL}>
          <div className="border-b border-line bg-paper-2/50 p-4 dark:bg-paper-2/30" />

          {/* Free column header */}
          <div
            className={cn(
              "border-b border-l border-line p-3 text-center sm:p-4",
              "bg-paper-2/50 dark:bg-paper-2/30"
            )}
          >
            <p className="m-0 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              Free
            </p>
            <p className="m-0 mt-1.5 font-serif text-xl font-medium tracking-tight text-ink sm:text-2xl">
              $0
            </p>
            <p className="m-0 mt-0.5 text-[0.625rem] text-ink-faint">forever</p>
            {currentPlan === "free" && (
              <Badge size="sm" className="mt-2.5">
                Current plan
              </Badge>
            )}
          </div>

          {/* Operator column header */}
          <div
            className={cn(
              "border-b border-l border-line p-3 text-center sm:p-4",
              OPERATOR_CELL
            )}
          >
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-accent/60 via-accent to-accent/60" />
            <p className="m-0 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-accent">
              Operator
            </p>
            <p className="m-0 mt-1.5 font-serif text-xl font-medium tracking-tight text-ink sm:text-2xl">
              $5
            </p>
            <p className="m-0 mt-0.5 text-[0.625rem] text-ink-faint">
              per month
            </p>
            {currentPlan === "operator" && (
              <Badge color="orange" size="sm" className="mt-2.5">
                Current plan
              </Badge>
            )}
          </div>
        </div>

        {/* Usage limits */}
        <SectionHeader>Usage limits</SectionHeader>
        <ComparisonRows rows={usageRows} />

        {/* Features */}
        <SectionHeader>Features</SectionHeader>
        <ComparisonRows rows={featureRows} />

        {/* Catalog access (both tiers) */}
        <div className="border-t border-line">
          <SectionHeader>Included in all plans</SectionHeader>
          <div className={COL}>
            <div className="flex items-center gap-2.5 px-3 py-2.5 sm:px-4">
              <SparkIcon className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
              <span className="text-[0.8125rem] leading-snug text-ink-soft">
                Full catalog access
              </span>
            </div>
            <div className="flex items-center justify-center border-l border-line px-2 py-2.5">
              <CellValue value="included" />
            </div>
            <div
              className={cn(
                "flex items-center justify-center border-l border-line px-2 py-2.5",
                OPERATOR_CELL
              )}
            >
              <CellValue value="included" />
            </div>
          </div>
          <div className={COL}>
            <div className="flex items-center gap-2.5 px-3 py-2.5 sm:px-4">
              <TerminalIcon className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
              <span className="text-[0.8125rem] leading-snug text-ink-soft">
                Sandbox environment
              </span>
            </div>
            <div className="flex items-center justify-center border-l border-line px-2 py-2.5">
              <CellValue value="included" />
            </div>
            <div
              className={cn(
                "flex items-center justify-center border-l border-line px-2 py-2.5",
                OPERATOR_CELL
              )}
            >
              <CellValue value="included" />
            </div>
          </div>
        </div>

        {/* CTA footer */}
        {!hasSubscription && (
          <div
            className={cn(
              COL,
              "border-t border-line bg-paper-2/30 dark:bg-paper-2/20"
            )}
          >
            <div className="px-3 py-4 sm:px-4">
              <p className="m-0 text-xs leading-relaxed text-ink-faint">
                Upgrade any time. Cancel any time from the Stripe portal.
              </p>
            </div>
            <div className="flex items-center justify-center border-l border-line px-2 py-4">
              <span className="text-[0.6875rem] font-medium text-ink-faint">
                You are here
              </span>
            </div>
            <div
              className={cn(
                "flex items-center justify-center border-l border-line px-2 py-4",
                OPERATOR_CELL
              )}
            >
              <LinkButton
                href="/api/billing/checkout?plan=operator"
                size="sm"
                className="w-full max-w-[120px] text-[0.6875rem]"
              >
                <ZapIcon className="h-3 w-3" />
                Upgrade
              </LinkButton>
            </div>
          </div>
        )}

        {hasSubscription && (
          <div
            className={cn(
              COL,
              "border-t border-line bg-paper-2/30 dark:bg-paper-2/20"
            )}
          >
            <div className="col-span-3 px-3 py-3 text-center sm:px-4">
              <p className="m-0 text-xs text-ink-faint">
                Manage payment methods, invoices, and cancellation from the{" "}
                <a
                  href={portalHref}
                  className="text-accent underline underline-offset-2 transition-colors hover:text-accent-hover"
                >
                  Stripe customer portal
                </a>
                .
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
