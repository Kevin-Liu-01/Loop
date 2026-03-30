"use client";

import { useState, useTransition } from "react";

import { useAuth, SignInButton } from "@clerk/nextjs";

import { CheckIcon, CreditCardIcon, KeyIcon } from "@/components/frontier-icons";
import { Button } from "@/components/ui/button";

type BuySkillButtonProps = {
  slug: string;
  priceLabel: string;
  purchased: boolean;
};

export function BuySkillButton({ slug, priceLabel, purchased }: BuySkillButtonProps) {
  const { isSignedIn } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (purchased) {
    return (
      <Button disabled type="button" variant="ghost">
        <CheckIcon className="h-3.5 w-3.5" />
        Purchased
      </Button>
    );
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <Button type="button">
          <KeyIcon className="h-3.5 w-3.5" />
          {priceLabel} &middot; Sign in to buy
        </Button>
      </SignInButton>
    );
  }

  function handleBuy() {
    setError(null);
    startTransition(async () => {
      const response = await fetch(`/api/skills/${slug}/checkout`, {
        method: "POST"
      });

      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        setError(payload.error ?? "Unable to start checkout.");
        return;
      }

      window.location.href = payload.url;
    });
  }

  return (
    <div className="grid gap-1">
      <Button disabled={isPending} onClick={handleBuy} type="button">
        <CreditCardIcon className="h-3.5 w-3.5" />
        {isPending ? "Redirecting..." : `Buy for ${priceLabel}`}
      </Button>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
