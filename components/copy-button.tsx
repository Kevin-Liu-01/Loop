"use client";

import { useState } from "react";

import { CheckIcon, ClipboardIcon } from "@/components/frontier-icons";
import { Button } from "@/components/ui/button";
import type { ButtonSize, ButtonVariant } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/shadcn/tooltip";
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

const CopyIcon = () => <ClipboardIcon className="h-4 w-4" />;
const CopyCheck = () => <CheckIcon className="h-4 w-4" />;

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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleCopy}
            size={size ?? "icon-sm"}
            type="button"
            variant={variant ?? "soft"}
          >
            {copied ? <CopyCheck /> : <CopyIcon />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copied!" : label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button
      onClick={handleCopy}
      size={size ?? "sm"}
      type="button"
      variant={variant ?? "soft"}
    >
      {copied ? <CopyCheck /> : <CopyIcon />}
      <span>{copied ? "Copied" : label}</span>
    </Button>
  );
}
