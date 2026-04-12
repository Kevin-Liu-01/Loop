"use client";

import { useAuth, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

interface CopySkillButtonProps {
  slug: string;
  label?: string;
}

export function CopySkillButton({
  slug,
  label = "Copy to my skills",
}: CopySkillButtonProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <Button size="sm" type="button" variant="soft">
          Sign in to copy
        </Button>
      </SignInButton>
    );
  }

  function handleCopy() {
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/skills/copy", {
        body: JSON.stringify({ slug }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        href?: string;
      };

      if (!response.ok || !payload.href) {
        setError(payload.error ?? "Unable to copy skill.");
        return;
      }

      router.push(payload.href);
      router.refresh();
    });
  }

  return (
    <div className="grid content-start gap-1">
      <Button
        disabled={isPending}
        onClick={handleCopy}
        size="sm"
        type="button"
        variant="soft"
      >
        {isPending ? "Copying..." : label}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
