"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";
import { formatRelativeDate } from "@/lib/format";
import type { ConversationChannel } from "@/lib/types";

type ConversationSummary = {
  id: string;
  channel: ConversationChannel;
  title: string;
  messageCount: number;
  model?: string;
  providerId?: string;
  createdAt: string;
  updatedAt: string;
};

type ConversationHistoryProps = {
  channel: ConversationChannel;
  onSelect: (id: string) => void;
  className?: string;
};

export function ConversationHistory({ channel, onSelect, className }: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    fetch(`/api/conversations?channel=${channel}&limit=15`)
      .then((r) => r.json())
      .then((data) => setConversations(data.conversations ?? []))
      .catch(() => setConversations([]))
      .finally(() => setIsLoading(false));
  }, [channel, isOpen]);

  return (
    <div className={cn("relative", className)}>
      <button
        className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-ink"
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        {isOpen ? "Hide history" : "History"}
      </button>

      {isOpen ? (
        <div className="mt-3 grid max-h-[280px] gap-1.5 overflow-auto">
          {isLoading ? (
            <span className="text-xs text-ink-faint">Loading...</span>
          ) : conversations.length === 0 ? (
            <span className="text-xs text-ink-faint">No saved conversations yet.</span>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                className="group grid gap-0.5 rounded-xl border border-line px-3 py-2.5 text-left transition-colors hover:border-line-strong hover:bg-paper-3"
                onClick={() => onSelect(c.id)}
                type="button"
              >
                <span className="truncate text-sm font-medium text-ink group-hover:text-accent">
                  {c.title || "Untitled"}
                </span>
                <span className="flex items-center gap-2 text-[0.65rem] tabular-nums text-ink-faint">
                  <span>{c.messageCount} messages</span>
                  <span aria-hidden>&middot;</span>
                  <span>{formatRelativeDate(c.updatedAt)}</span>
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
