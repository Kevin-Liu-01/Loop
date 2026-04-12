"use client";

import { ZapIcon } from "@/components/frontier-icons";
import { LinkButton } from "@/components/ui/link-button";
import { cn } from "@/lib/cn";

interface OperatorGateProps {
  children?: React.ReactNode;
  message?: string;
  className?: string;
}

export function OperatorGate({
  children,
  message = "This feature requires an Operator subscription.",
  className,
}: OperatorGateProps) {
  return (
    <div
      className={cn(
        "grid gap-3 rounded-none border border-line bg-paper-3/92 p-5 sm:p-6",
        className
      )}
    >
      {children ?? <p className="m-0 text-sm text-ink-muted">{message}</p>}
      <div>
        <LinkButton href="/api/billing/checkout?plan=operator" size="sm">
          <ZapIcon className="h-3.5 w-3.5" />
          Upgrade to Operator – $19/mo
        </LinkButton>
      </div>
    </div>
  );
}

export function OperatorBadge() {
  return (
    <LinkButton href="/settings/subscription" size="sm" variant="ghost">
      View plans
    </LinkButton>
  );
}
