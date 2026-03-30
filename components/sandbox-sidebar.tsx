"use client";

import { useEffect, useState, useCallback } from "react";

import {
  PlusIcon,
  MessageIcon,
  ClockIcon
} from "@/components/frontier-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatRelativeDate } from "@/lib/format";
import { pageInsetPadX } from "@/lib/ui-layout";

type ConversationSummary = {
  id: string;
  title: string;
  messageCount: number;
  model?: string;
  createdAt: string;
  updatedAt: string;
};

type SandboxSidebarProps = {
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  version: number;
  className?: string;
};

export function SandboxSidebar({
  currentId,
  onSelect,
  onNew,
  version,
  className
}: SandboxSidebarProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setIsLoading(true);
    fetch("/api/conversations?channel=sandbox&limit=30")
      .then((r) => r.json())
      .then((data) => setConversations(data.conversations ?? []))
      .catch(() => setConversations([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, version]);

  return (
    <div className={cn("flex h-full min-h-0 min-w-0 flex-col", className)}>
      {/* Header */}
      <div
        className={cn(
          "flex shrink-0 items-center justify-between border-b border-line/60 bg-linear-to-b from-paper-2/40 to-transparent py-4 dark:from-paper-2/20",
          pageInsetPadX
        )}
      >
        <div className="flex items-center gap-2.5">
          <ClockIcon className="h-3.5 w-3.5 text-ink-faint" />
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.06em] text-ink-soft">
            Sessions
          </span>
        </div>
        <Button
          onClick={onNew}
          size="icon-sm"
          variant="ghost"
          aria-label="New session"
        >
          <PlusIcon className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Conversation list */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 pb-3 pt-2.5">
        {isLoading ? (
          <div className="grid gap-2 p-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[52px] animate-pulse bg-paper-2/60"
              />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-paper-2/60">
              <MessageIcon className="h-4 w-4 text-ink-faint" />
            </div>
            <p className="text-[0.7rem] leading-relaxed text-ink-faint">
              No sessions yet.
              <br />
              Start a conversation to see it here.
            </p>
          </div>
        ) : (
          <div className="grid gap-1">
            {conversations.map((c) => (
              <button
                key={c.id}
                className={cn(
                  "group grid gap-1 rounded-lg px-3 py-3 text-left transition-all duration-150",
                  c.id === currentId
                    ? "bg-accent/8 ring-1 ring-accent/20"
                    : "hover:bg-paper-2/80"
                )}
                onClick={() => onSelect(c.id)}
                type="button"
              >
                <span
                  className={cn(
                    "truncate text-[0.8rem] font-medium leading-snug",
                    c.id === currentId
                      ? "text-accent"
                      : "text-ink group-hover:text-ink"
                  )}
                >
                  {c.title || "Untitled session"}
                </span>
                <span className="flex items-center gap-1.5 text-[0.6rem] tabular-nums text-ink-faint">
                  <span>{c.messageCount} msgs</span>
                  <span aria-hidden className="opacity-40">
                    ·
                  </span>
                  <span>{formatRelativeDate(c.updatedAt)}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
