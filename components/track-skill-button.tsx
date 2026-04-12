"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { PlayIcon } from "@/components/frontier-icons";
import { Button } from "@/components/ui/button";
import type { ButtonSize, ButtonVariant } from "@/components/ui/button";

const SELECTION_KEY = "loop.admin.selected-loop";

interface TrackSkillButtonProps {
  slug: string;
  label?: string;
  showFeedback?: boolean;
  redirectTo?: "detail" | "updates";
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function TrackSkillButton({
  slug,
  label = "Set up skill",
  showFeedback = false,
  redirectTo = "detail",
  variant = "ghost",
  size = "default",
}: TrackSkillButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/skills/track", {
        body: JSON.stringify({ slug }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        href?: string;
      };
      if (!response.ok || !payload.href) {
        setError(payload.error ?? "Unable to make this skill updateable.");
        return;
      }

      window.localStorage.setItem(SELECTION_KEY, `user:${slug}`);
      setMessage("Tracked. Opened in setup.");
      router.push(
        redirectTo === "updates" ? "/settings/automations" : payload.href
      );
      router.refresh();
    });
  }

  return (
    <div className="grid content-start justify-items-end gap-2">
      <Button
        disabled={isPending}
        onClick={handleClick}
        size={size}
        type="button"
        variant={variant}
      >
        <PlayIcon className="h-3.5 w-3.5" />
        {isPending ? "Setting up..." : label}
      </Button>
      {showFeedback && message ? (
        <p className="text-sm text-ink-soft">{message}</p>
      ) : null}
      {showFeedback && error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : null}
    </div>
  );
}
