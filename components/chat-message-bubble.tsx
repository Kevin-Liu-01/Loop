"use client";

import { useEffect, useReducer } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/cn";
import { formatRelativeDate } from "@/lib/format";

type ChatMessageBubbleProps = {
  role: "user" | "assistant" | "system";
  text: string;
  createdAt?: Date | string;
};

function RelativeTimestamp({ date, className }: { date: string; className?: string }) {
  const [, tick] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [date]);

  return (
    <time dateTime={date} suppressHydrationWarning className={className}>
      {formatRelativeDate(date)}
    </time>
  );
}

export function ChatMessageBubble({ role, text, createdAt }: ChatMessageBubbleProps) {
  const isUser = role === "user";
  const timestamp = createdAt
    ? typeof createdAt === "string"
      ? createdAt
      : createdAt.toISOString()
    : null;

  return (
    <div
      className={cn(
        "chat-message",
        isUser ? "chat-message--user" : "chat-message--assistant"
      )}
    >
      {isUser ? (
        <span className="whitespace-pre-wrap">{text}</span>
      ) : (
        <div className="chat-markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
      )}

      {timestamp ? (
        <RelativeTimestamp
          date={timestamp}
          className="mt-2 block text-[0.65rem] tabular-nums opacity-40"
        />
      ) : null}
    </div>
  );
}
