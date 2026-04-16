"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  TerminalIcon,
} from "@/components/frontier-icons";
import { LoopLogo } from "@/components/loop-logo";
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

function openNewSkillModal() {
  window.dispatchEvent(new Event("loop:open-new-skill"));
}

export function SiteHeader({ onNewSkill }: { onNewSkill?: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [brandHover, setBrandHover] = useState(false);
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
              interactionActive={brandHover}
            />
          </LinkPendingIcon>
          <strong className="font-serif text-[1.05rem] font-medium tracking-[-0.03em]">
            Loop
          </strong>
        </Link>

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
