"use client";

import { Show, SignInButton, useAuth, UserButton } from "@clerk/nextjs";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useCallback, useEffect, useState } from "react";

import { BrandWordmark } from "@/components/brand-wordmark";
import { PlusIcon, SearchIcon, ZapIcon } from "@/components/frontier-icons";
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
import { cn } from "@/lib/cn";
import {
  APP_NAV_LINKS,
  LIBRARY_PATH,
  MARKETING_NAV_LINKS,
  PUBLIC_HOME_PATH,
  SIGN_UP_PATH,
} from "@/lib/navigation";

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
  /**
   * Only meaningful when `variant="landing"`. When true, the header is
   * `position: absolute` on `lg+` so it overlays the hero shader instead
   * of taking document-flow space (and pushing the hero down). Mobile
   * keeps the sticky behavior so the nav stays reachable on touch
   * devices. Defaults to `false` (sticky everywhere) — used by the
   * landing page itself; legal/FAQ pages omit it.
   */
  overlay?: boolean;
  onNewSkill?: () => void;
}

const NAV_ANCHOR_BASE =
  "inline-flex items-center px-3.5 text-ink-soft transition-colors hover:bg-paper-3 hover:text-ink";

function isActiveAppPath(pathname: string, href: string): boolean {
  return href === LIBRARY_PATH
    ? pathname === LIBRARY_PATH
    : pathname.startsWith(href);
}

function getBrandHref(isSignedIn: boolean | undefined): string {
  return isSignedIn ? LIBRARY_PATH : PUBLIC_HOME_PATH;
}

interface AppNavigationProps {
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
}

function AppNavigation({
  onNavigate,
  variant = "desktop",
}: AppNavigationProps) {
  const pathname = usePathname();

  if (variant === "mobile") {
    return APP_NAV_LINKS.map((link) => (
      <LinkButton
        className="w-full justify-start"
        href={link.href}
        key={link.href}
        onClick={onNavigate}
        size="sm"
        variant={isActiveAppPath(pathname, link.href) ? "primary" : "soft"}
      >
        {link.label}
      </LinkButton>
    ));
  }

  return (
    <nav
      aria-label="Application"
      className="flex h-9 items-stretch border border-line bg-paper-2/60 text-[0.75rem] font-medium"
    >
      {APP_NAV_LINKS.map((link, index) => (
        <Fragment key={link.href}>
          {index > 0 && <span className="my-1.5 w-px bg-line" />}
          <Link
            aria-current={
              isActiveAppPath(pathname, link.href) ? "page" : undefined
            }
            className={cn(
              NAV_ANCHOR_BASE,
              isActiveAppPath(pathname, link.href) && "bg-paper-3 text-ink"
            )}
            href={link.href}
          >
            {link.label}
          </Link>
        </Fragment>
      ))}
    </nav>
  );
}

function openNewSkillModal() {
  window.dispatchEvent(new Event("loop:open-new-skill"));
}

function openPalette() {
  window.dispatchEvent(new Event("loop:open-palette"));
}

export function SiteHeader({
  variant = "default",
  overlay = false,
  onNewSkill,
}: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [brandHover, setBrandHover] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn } = useAuth();
  const { isOperator } = useOperator();
  const handleNew = onNewSkill ?? openNewSkillModal;
  const isLanding = variant === "landing";
  const brandHref = getBrandHref(isSignedIn);

  const handleBrandEnter = useCallback(() => setBrandHover(true), []);
  const handleBrandLeave = useCallback(() => setBrandHover(false), []);
  const handleMobileOpen = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
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
          : "relative min-h-[52px] gap-3 px-4 py-2.5 max-md:px-3"
      )}
    >
      <Link
        className="inline-flex items-center gap-2.5 max-sm:gap-3"
        href={brandHref}
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
          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:flex">
            <AppNavigation />
          </div>
          {isOperator && (
            <Link
              href="/settings/subscription"
              className="inline-flex items-center gap-1 border border-accent/20 bg-accent/8 px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-accent transition-colors hover:bg-accent/14 hover:border-accent/30 max-lg:hidden"
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
        {isLanding ? (
          <>
            <LinkButton
              className="max-sm:hidden"
              href={LIBRARY_PATH}
              size="sm"
              variant="primary"
            >
              Open library
            </LinkButton>
            <ThemeToggle className="max-sm:hidden" />
          </>
        ) : (
          <>
            <Button
              aria-label="Search"
              onClick={openPalette}
              size="sm"
              type="button"
              variant="soft"
            >
              <SearchIcon className="h-3.5 w-3.5" />
              <span className="max-lg:hidden">Search</span>
              <kbd className="ml-1 text-[0.7rem] text-ink-faint max-lg:hidden">
                ⌘K
              </kbd>
            </Button>

            <Button
              className="max-lg:hidden"
              onClick={handleNew}
              size="sm"
              type="button"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              New
            </Button>

            <div className="flex items-center gap-2 max-lg:hidden">
              <GitHubStarLink />
              <ThemeToggle />
            </div>
          </>
        )}

        <div className="flex h-9 items-center">
          <UserButton />
        </div>

        <Button
          aria-label="Open menu"
          className="lg:hidden"
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

        <SignInButton forceRedirectUrl={LIBRARY_PATH} mode="modal">
          <button
            className="hidden h-9 items-center px-2 text-[0.78rem] font-medium text-ink-soft transition-colors hover:text-ink sm:inline-flex"
            type="button"
          >
            Sign in
          </button>
        </SignInButton>

        <LinkButton
          className="max-sm:hidden"
          href={SIGN_UP_PATH}
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

  const mobileSheet = (
    <>
      <Show when="signed-in">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="right" className="grid content-start gap-4 p-6">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="grid gap-2">
              {!isLanding && (
                <Button
                  className="w-full justify-start"
                  onClick={handleMobileNew}
                  size="sm"
                  type="button"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  New skill
                </Button>
              )}
              <AppNavigation onNavigate={closeMobile} variant="mobile" />
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
                href={SIGN_UP_PATH}
                onClick={closeMobile}
                size="sm"
                variant="primary"
              >
                Get started
              </LinkButton>

              <SignInButton forceRedirectUrl={LIBRARY_PATH} mode="modal">
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
      <header
        className={cn(
          "sticky top-0 z-30",
          overlay && "lg:absolute lg:inset-x-0"
        )}
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 transition-opacity duration-300 ease-out",
            scrolled ? "opacity-100" : "opacity-0",
            // When overlaying on desktop the header scrolls away with the
            // page, so the scroll-fade backdrop becomes irrelevant — hide
            // it on lg+ so the nav stays clean over the hero shader.
            overlay && "lg:hidden"
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
