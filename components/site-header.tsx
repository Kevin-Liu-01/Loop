"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { StarIcon, MenuIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { BrandWordmark } from "@/components/brand-wordmark";
import {
  GitHubIcon,
  GITHUB_REPO_URL,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  TerminalIcon,
  ZapIcon,
} from "@/components/frontier-icons";
import { LoopLogo } from "@/components/loop-logo";
import { useOperator } from "@/components/operator-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { LinkPendingIcon } from "@/components/ui/link-pending-icon";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/shadcn/sheet";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/shadcn/tooltip";

const GITHUB_API_URL = "https://api.github.com/repos/Kevin-Liu-01/Loop";

let cachedStars: number | null = null;

function GitHubStarLink() {
  const [stars, setStars] = useState<number | null>(cachedStars);

  useEffect(() => {
    if (cachedStars !== null) {
      return;
    }

    fetch(GITHUB_API_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.stargazers_count != null) {
          cachedStars = data.stargazers_count;
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <a
      className="inline-flex h-9 items-center gap-1.5 rounded-none border border-line px-2.5 text-[0.75rem] font-medium text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink"
      href={GITHUB_REPO_URL}
      rel="noopener noreferrer"
      target="_blank"
    >
      <GitHubIcon className="h-3.5 w-3.5" />
      {stars !== null ? (
        <span className="inline-flex items-center gap-1 tabular-nums">
          <StarIcon className="h-3 w-3 fill-current" />
          {stars}
        </span>
      ) : (
        <span>GitHub</span>
      )}
    </a>
  );
}

function openNewSkillModal() {
  window.dispatchEvent(new Event("loop:open-new-skill"));
}

export function SiteHeader({ onNewSkill }: { onNewSkill?: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [brandHover, setBrandHover] = useState(false);
  const { isOperator } = useOperator();
  const handleNew = onNewSkill ?? openNewSkillModal;

  return (
    <>
      <div className="flex min-h-[52px] w-full items-center gap-3 px-4 py-2.5 max-md:px-3">
        <Link
          className="inline-flex items-center gap-2.5"
          href="/"
          onPointerEnter={() => setBrandHover(true)}
          onPointerLeave={() => setBrandHover(false)}
        >
          <LinkPendingIcon className="h-8 w-8 items-center justify-center">
            <LoopLogo
              className="h-8 w-8 text-accent"
              operatorGlow={isOperator}
              interactionActive={brandHover}
            />
          </LinkPendingIcon>
          <strong className="font-serif text-[1.05rem] font-medium tracking-[-0.03em]">
            <BrandWordmark hover={brandHover} />
          </strong>
        </Link>

        {isOperator && (
          <Link
            href="/settings/subscription"
            className="inline-flex items-center gap-1 border border-accent/20 bg-accent/8 px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-accent transition-colors hover:bg-accent/14 hover:border-accent/30 max-sm:hidden"
          >
            <ZapIcon className="h-3 w-3" />
            Operator
          </Link>
        )}

        <div className="flex-1" />

        <Button
          onClick={() => window.dispatchEvent(new Event("loop:open-palette"))}
          size="sm"
          type="button"
          variant="soft"
        >
          <SearchIcon className="h-3.5 w-3.5" />
          <span className="max-sm:hidden">Search</span>
          <kbd className="ml-1 text-[0.7rem] text-ink-faint max-sm:hidden">
            ⌘K
          </kbd>
        </Button>

        <Show when="signed-in">
          <Button
            className="max-sm:hidden"
            onClick={handleNew}
            size="sm"
            type="button"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            New
          </Button>
        </Show>

        <div className="flex items-center gap-2 max-sm:hidden">
          <GitHubStarLink />

          <Tooltip>
            <TooltipTrigger asChild>
              <LinkButton href="/sandbox" size="icon" variant="soft">
                <LinkPendingIcon className="h-4 w-4 items-center justify-center">
                  <TerminalIcon className="h-4 w-4" />
                </LinkPendingIcon>
              </LinkButton>
            </TooltipTrigger>
            <TooltipContent>Sandbox</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <LinkButton href="/settings" size="icon" variant="soft">
                <LinkPendingIcon className="h-4 w-4 items-center justify-center">
                  <SettingsIcon className="h-4 w-4" />
                </LinkPendingIcon>
              </LinkButton>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>

          <ThemeToggle />
        </div>

        <Show when="signed-out">
          <SignInButton mode="modal">
            <Button size="sm" type="button" variant="soft">
              Sign in
            </Button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <div className="flex h-9 items-center">
            <UserButton />
          </div>
        </Show>

        <Button
          className="sm:hidden"
          onClick={() => setMobileOpen(true)}
          size="icon"
          aria-label="Open menu"
          type="button"
          variant="soft"
        >
          <MenuIcon className="h-4 w-4" />
        </Button>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="grid content-start gap-4 p-6">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="grid gap-2">
            <Show when="signed-in">
              <Button
                className="w-full justify-start"
                onClick={() => {
                  handleNew();
                  setMobileOpen(false);
                }}
                size="sm"
                type="button"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                New skill
              </Button>
            </Show>
            <LinkButton
              className="w-full justify-start"
              href="/sandbox"
              size="sm"
              variant="soft"
            >
              <LinkPendingIcon className="h-4 w-4 items-center justify-center">
                <TerminalIcon className="h-4 w-4" />
              </LinkPendingIcon>
              Sandbox
            </LinkButton>
            <LinkButton
              className="w-full justify-start"
              href="/settings"
              size="sm"
              variant="soft"
            >
              <LinkPendingIcon className="h-4 w-4 items-center justify-center">
                <SettingsIcon className="h-4 w-4" />
              </LinkPendingIcon>
              Settings
            </LinkButton>
          </nav>
          <div className="pt-2">
            <ThemeToggle />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
