"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { ButtonSize, ButtonVariant } from "@/components/ui/button";
import { postUsageEvent } from "@/components/usage-beacon";
import type { CategorySlug, UsageEventKind } from "@/lib/types";

type CopyButtonProps = {
  value: string;
  label?: string;
  iconOnly?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  usageEvent?: {
    kind: Exclude<UsageEventKind, "api_call">;
    label: string;
    path?: string;
    skillSlug?: string;
    categorySlug?: CategorySlug;
    details?: string;
  };
};

const CopyIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <rect x={9} y={9} width={13} height={13} rx={2} />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

export function CopyButton({
  value,
  label = "Copy",
  iconOnly,
  variant,
  size,
  usageEvent,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    if (usageEvent) {
      postUsageEvent(usageEvent);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  if (iconOnly) {
    return (
      <Button
        onClick={handleCopy}
        size={size ?? "icon-sm"}
        title={label}
        type="button"
        variant={variant ?? "soft"}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleCopy}
      size={size ?? "sm"}
      type="button"
      variant={variant ?? "soft"}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span>{copied ? "Copied" : label}</span>
    </Button>
  );
}
