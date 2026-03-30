"use client";

import { useState } from "react";
import Link from "next/link";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { MenuIcon } from "lucide-react";

import { PlusIcon, SearchIcon, SettingsIcon, TerminalIcon } from "@/components/frontier-icons";
import { LoopLogo } from "@/components/loop-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/shadcn/sheet";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/shadcn/tooltip";

export function SiteHeader({ onNewSkill }: { onNewSkill?: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);

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
            className="max-sm:hidden"
            onClick={onNewSkill}
            size="sm"
            type="button"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            New
          </Button>
        ) : null}

        <div className="flex items-center gap-2 max-sm:hidden">
          <Tooltip>
            <TooltipTrigger asChild>
              <LinkButton
                href="/sandbox"
                size="icon"
                variant="soft"
              >
                <TerminalIcon className="h-4 w-4" />
              </LinkButton>
            </TooltipTrigger>
            <TooltipContent>Sandbox</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <LinkButton
                href="/settings"
                size="icon"
                variant="soft"
              >
                <SettingsIcon className="h-4 w-4" />
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
          <UserButton />
        </Show>

        <Button
          className="sm:hidden"
          onClick={() => setMobileOpen(true)}
          size="icon-sm"
          type="button"
          variant="soft"
        >
          <MenuIcon className="h-4 w-4" />
        </Button>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="right" className="grid content-start gap-4 p-6">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="grid gap-2">
              {onNewSkill ? (
                <Button
                  className="w-full justify-start"
                  onClick={() => { onNewSkill(); setMobileOpen(false); }}
                  size="sm"
                  type="button"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  New skill
                </Button>
              ) : null}
              <LinkButton className="w-full justify-start" href="/sandbox" size="sm" variant="soft">
                <TerminalIcon className="h-4 w-4" />
                Sandbox
              </LinkButton>
              <LinkButton className="w-full justify-start" href="/settings" size="sm" variant="soft">
                <SettingsIcon className="h-4 w-4" />
                Settings
              </LinkButton>
            </nav>
            <div className="pt-2">
              <ThemeToggle />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
