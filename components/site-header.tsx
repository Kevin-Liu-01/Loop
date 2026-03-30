"use client";

import Link from "next/link";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";

import { PlusIcon, SearchIcon, SettingsIcon, TerminalIcon } from "@/components/frontier-icons";
import { LoopLogo } from "@/components/loop-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

export function SiteHeader({ onNewSkill }: { onNewSkill?: () => void }) {
  return (
    <header className="sticky top-0 z-60 px-4 pt-4 max-md:px-2.5 max-md:pt-2.5">
      <div className="mx-auto flex min-h-[56px] w-[min(1180px,calc(100vw-32px))] items-center gap-3 rounded-2xl border border-line/90 bg-paper/88 px-4 py-2.5 backdrop-blur-xl max-md:w-[min(100vw-20px,1180px)]">
        <Link className="inline-flex items-center gap-2.5" href="/">
          <LoopLogo className="h-8 w-8 text-accent" />
          <strong className="font-serif text-[1.05rem] font-medium tracking-[-0.03em]">Loop</strong>
        </Link>

        <div className="flex-1" />

        <Button
          onClick={() =>
            window.dispatchEvent(new Event("loop:open-palette"))
          }
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

        {onNewSkill ? (
          <Button
            onClick={onNewSkill}
            size="sm"
            type="button"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            <span className="max-sm:hidden">New</span>
          </Button>
        ) : null}

        <LinkButton
          href="/sandbox"
          size="icon"
          title="Sandbox"
          variant="soft"
        >
          <TerminalIcon className="h-4 w-4" />
        </LinkButton>

        <LinkButton
          href="/settings"
          size="icon"
          variant="soft"
        >
          <SettingsIcon className="h-4 w-4" />
        </LinkButton>

        <ThemeToggle />

        <Show when="signed-out">
          <SignInButton mode="modal">
            <Button size="sm" type="button" variant="soft">
              Sign in
            </Button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  );
}
