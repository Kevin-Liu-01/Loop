"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { Fragment, useCallback, useEffect, useState } from "react";

import { BrandWordmark } from "@/components/brand-wordmark";
import {
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  TerminalIcon,
  ZapIcon,
} from "@/components/frontier-icons";
import { GitHubStarLink } from "@/components/github-star-link";
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
import { cn } from "@/lib/cn";

interface SiteHeaderProps {
  /**
   * `"landing"` is reserved for the public landing page — renders the
   * header as its own sticky element with a constrained `max-w-[1100px]`
   * container and a scroll-aware backdrop over the hero shader.
   *
   * Every other surface (in-app pages, legal/FAQ) uses `"default"`, which
   * returns bare flex content sized for the wrapping `AppGridShell`'s
   * own sticky `<header>` (full-width, `px-4`).
   */
  variant?: "landing" | "default";
  onNewSkill?: () => void;
}

const MARKETING_NAV_LINKS: { href: string; label: string }[] = [
  { href: "/#skills", label: "Skills" },
  { href: "/#mcps", label: "Automations" },
  { href: "/faq", label: "FAQ" },
];

const NAV_ANCHOR_BASE =
  "inline-flex items-center px-3.5 text-ink-soft transition-colors hover:bg-paper-3 hover:text-ink";

function openNewSkillModal() {
  window.dispatchEvent(new Event("loop:open-new-skill"));
}

function openPalette() {
  window.dispatchEvent(new Event("loop:open-palette"));
}

export function SiteHeader({
  variant = "default",
  onNewSkill,
}: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [brandHover, setBrandHover] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isOperator } = useOperator();
  const handleNew = onNewSkill ?? openNewSkillModal;
  const isLanding = variant === "landing";

  const handleBrandEnter = useCallback(() => setBrandHover(true), []);
  const handleBrandLeave = useCallback(() => setBrandHover(false), []);
  const handleMobileOpen = useCallback(() => setMobileOpen(true), []);
  const handleMobileNew = useCallback(() => {
    handleNew();
    setMobileOpen(false);
  }, [handleNew]);

  useEffect(() => {
    if (!isLanding) {
      return;
    }
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLanding]);

  const inner = (
    <div
      className={cn(
        "flex w-full items-center",
        isLanding
          ? "relative mx-auto max-w-[1100px] gap-4 px-6 py-3.5 max-sm:gap-3 max-sm:py-4"
          : "min-h-[52px] gap-3 px-4 py-2.5 max-md:px-3"
      )}
    >
      <Link
        className="inline-flex items-center gap-2.5 max-sm:gap-3"
        href="/"
        onPointerEnter={handleBrandEnter}
        onPointerLeave={handleBrandLeave}
      >
        <LinkPendingIcon
          className={cn(
            "items-center justify-center",
            isLanding ? "h-7 w-7 max-sm:h-9 max-sm:w-9" : "h-8 w-8"
          )}
        >
          <LoopLogo
            className={cn(
              "text-accent",
              isLanding ? "h-7 w-7 max-sm:h-9 max-sm:w-9" : "h-8 w-8"
            )}
            interactionActive={brandHover}
            operatorGlow={!isLanding && isOperator}
          />
        </LinkPendingIcon>
        <strong
          className={cn(
            "font-serif font-medium tracking-[-0.03em]",
            isLanding
              ? "text-[1.05rem] max-sm:text-[1.5rem] max-sm:tracking-[-0.035em]"
              : "text-[1.05rem]"
          )}
        >
          <BrandWordmark hover={brandHover} />
        </strong>
      </Link>

      {!isLanding && (
        <Show when="signed-in">
          {isOperator && (
            <Link
              href="/settings/subscription"
              className="inline-flex items-center gap-1 border border-accent/20 bg-accent/8 px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-accent transition-colors hover:bg-accent/14 hover:border-accent/30 max-sm:hidden"
            >
              <ZapIcon className="h-3 w-3" />
              Operator
            </Link>
          )}
        </Show>
      )}

      <div className={cn("flex-1", isLanding && "max-sm:hidden")} />

      {/* ── SIGNED-IN: in-app utilities ── */}
      <Show when="signed-in">
        <Button onClick={openPalette} size="sm" type="button" variant="soft">
          <SearchIcon className="h-3.5 w-3.5" />
          <span className="max-sm:hidden">Search</span>
          <kbd className="ml-1 text-[0.7rem] text-ink-faint max-sm:hidden">
            ⌘K
          </kbd>
        </Button>

        <Button
          className="max-sm:hidden"
          onClick={handleNew}
          size="sm"
          type="button"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          New
        </Button>

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

        <div className="flex h-9 items-center">
          <UserButton />
        </div>

        <Button
          aria-label="Open menu"
          className="sm:hidden"
          onClick={handleMobileOpen}
          size="icon"
          type="button"
          variant="soft"
        >
          <MenuIcon className="h-4 w-4" />
        </Button>
      </Show>

      {/* ── SIGNED-OUT: marketing chrome ── */}
      <Show when="signed-out">
        <div className="hidden h-9 items-stretch border border-line bg-paper-2/60 text-[0.75rem] font-medium md:flex">
          {MARKETING_NAV_LINKS.map((link, index) => (
            <Fragment key={link.href}>
              {index > 0 && <span className="my-1.5 w-px bg-line" />}
              <Link className={NAV_ANCHOR_BASE} href={link.href}>
                {link.label}
              </Link>
            </Fragment>
          ))}
        </div>

        <GitHubStarLink className="hidden md:inline-flex" />

        <ThemeToggle className="max-sm:hidden" />

        <SignInButton mode="modal">
          <button
            className="hidden h-9 items-center px-2 text-[0.78rem] font-medium text-ink-soft transition-colors hover:text-ink sm:inline-flex"
            type="button"
          >
            Sign in
          </button>
        </SignInButton>

        <LinkButton
          className="max-sm:hidden"
          href="/sign-up"
          size="sm"
          variant="primary"
        >
          Get started
        </LinkButton>

        {isLanding && (
          <div className="flex items-center gap-2 sm:hidden max-sm:absolute max-sm:right-6 max-sm:top-1/2 max-sm:-translate-y-1/2">
            <ThemeToggle />
            <Button
              aria-label="Open menu"
              onClick={handleMobileOpen}
              size="icon"
              type="button"
              variant="soft"
            >
              <MenuIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Show>
    </div>
  );

  const closeMobile = () => setMobileOpen(false);

  const mobileSheet = (
    <>
      <Show when="signed-in">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="right" className="grid content-start gap-4 p-6">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="grid gap-2">
              <Button
                className="w-full justify-start"
                onClick={handleMobileNew}
                size="sm"
                type="button"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                New skill
              </Button>
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
      </Show>

      {isLanding && (
        <Show when="signed-out">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent side="right" className="grid content-start gap-5 p-6">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>

              <LinkButton
                className="w-full justify-center"
                href="/sign-up"
                onClick={closeMobile}
                size="sm"
                variant="primary"
              >
                Get started
              </LinkButton>

              <SignInButton mode="modal">
                <button
                  className="-mx-2 flex h-10 items-center px-2 text-[0.95rem] font-medium text-ink-soft transition-colors hover:text-ink"
                  onClick={closeMobile}
                  type="button"
                >
                  Sign in
                </button>
              </SignInButton>

              <div className="h-px bg-line" />

              <nav className="grid">
                {MARKETING_NAV_LINKS.map((link) => (
                  <Link
                    className="-mx-2 flex h-10 items-center px-2 text-[0.95rem] font-medium text-ink-soft transition-colors hover:text-ink"
                    href={link.href}
                    key={link.href}
                    onClick={closeMobile}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="h-px bg-line" />

              <div className="flex items-center gap-3">
                <GitHubStarLink />
                <ThemeToggle />
              </div>
            </SheetContent>
          </Sheet>
        </Show>
      )}
    </>
  );

  if (isLanding) {
    return (
      <header className="sticky top-0 z-30">
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 transition-opacity duration-300 ease-out",
            scrolled ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="absolute inset-0 bg-paper/75 backdrop-blur-md backdrop-saturate-150" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-line" />
        </div>
        {inner}
        {mobileSheet}
      </header>
    );
  }

  return (
    <>
      {inner}
      {mobileSheet}
    </>
  );
}
