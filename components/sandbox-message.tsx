"use client";

import { useEffect, useReducer } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { SandboxToolBlock } from "@/components/ui/sandbox-tool-block";
import { McpIcon, SkillIcon } from "@/components/ui/skill-icon";
import { useAppTimezone } from "@/hooks/use-app-timezone";
import { formatTime } from "@/lib/format";
import type {
  ConversationMessageMetadata,
  ConversationMessagePart,
} from "@/lib/types";

interface MessagePart {
  type: string;
  text?: string;
  toolInvocation?: {
    toolName: string;
    args: Record<string, unknown>;
    result?: Record<string, unknown>;
    state: string;
  };
  [key: string]: unknown;
}

interface SandboxMessageProps {
  role: "user" | "assistant" | "system";
  parts: MessagePart[];
  createdAt?: Date;
  metadata?: ConversationMessageMetadata;
}

interface SavedMessageProps {
  role: string;
  content: string;
  parts?: ConversationMessagePart[];
  createdAt: string;
  metadata?: ConversationMessageMetadata;
}

function Timestamp({ date }: { date: Date }) {
  const { timeZone } = useAppTimezone();
  const [, tick] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60_000);

  let relative: string;
  if (mins < 1) {
    relative = "just now";
  } else if (mins < 60) {
    relative = `${mins}m ago`;
  } else {
    const hours = Math.floor(mins / 60);
    relative =
      hours < 24 ? `${hours}h ago` : formatTime(date.toISOString(), timeZone);
  }

  return (
    <time
      dateTime={date.toISOString()}
      className="text-[0.6rem] tabular-nums text-ink-faint/50"
      suppressHydrationWarning
    >
      {formatTime(date.toISOString(), timeZone)} · {relative}
    </time>
  );
}

function AttachmentChips({
  metadata,
  align = "start",
}: {
  metadata?: ConversationMessageMetadata;
  align?: "start" | "end";
}) {
  const attachments = metadata?.attachments;
  const hasAttachments =
    (attachments?.skills.length ?? 0) > 0 ||
    (attachments?.mcps.length ?? 0) > 0;

  if (!hasAttachments) {
    return null;
  }

  return (
    <div
      className={`flex max-w-[85%] flex-wrap gap-1 ${align === "end" ? "self-end justify-end" : "self-start"}`}
    >
      {attachments?.skills.map((skill) => (
        <span
          className="inline-flex items-center gap-1 border border-line/40 px-1.5 py-px text-[0.575rem] font-medium text-ink-faint/70"
          key={`skill:${skill.slug}`}
        >
          <SkillIcon iconUrl={skill.iconUrl} size={10} slug={skill.slug} />
          {skill.title}
        </span>
      ))}
      {attachments?.mcps.map((mcp) => (
        <span
          className="inline-flex items-center gap-1 border border-line/40 px-1.5 py-px text-[0.575rem] font-medium text-ink-faint/70"
          key={`mcp:${mcp.id}`}
        >
          <McpIcon iconUrl={mcp.iconUrl} name={mcp.name} size={10} />
          {mcp.name}
        </span>
      ))}
    </div>
  );
}

function MessageMeta({ role, timestamp }: { role: string; timestamp: Date }) {
  const isUser = role === "user";

  return (
    <div
      className={`flex items-center gap-1.5 ${isUser ? "self-end" : "self-start"}`}
    >
      <span className="text-[0.575rem] font-medium uppercase tracking-[0.06em] text-ink-faint/40">
        {isUser ? "You" : "Agent"}
      </span>
      <Timestamp date={timestamp} />
    </div>
  );
}

function InlineToolBlock({
  toolInvocation,
}: {
  toolInvocation: NonNullable<MessagePart["toolInvocation"]>;
}) {
  return (
    <SandboxToolBlock
      toolName={toolInvocation.toolName}
      input={toolInvocation.args}
      output={
        toolInvocation.state === "result"
          ? (toolInvocation.result as Record<string, unknown>)
          : undefined
      }
      state={toolInvocation.state as "partial-call" | "call" | "result"}
    />
  );
}

export function SandboxMessage({
  role,
  parts,
  createdAt,
  metadata,
}: SandboxMessageProps) {
  const timestamp = createdAt ?? new Date();

  if (role === "user") {
    const text = parts
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("");

    return (
      <div className="flex flex-col gap-1">
        <div className="chat-bubble chat-bubble--user self-end">
          <span className="whitespace-pre-wrap">{text}</span>
        </div>
        <MessageMeta role="user" timestamp={timestamp} />
        <AttachmentChips metadata={metadata} align="end" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {parts.map((part, i) => {
        if (part.type === "text" && part.text) {
          return (
            <div
              key={i}
              className="chat-bubble chat-bubble--assistant self-start"
            >
              <div className="chat-markdown">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {part.text}
                </ReactMarkdown>
              </div>
            </div>
          );
        }
        if (part.type === "tool-invocation" && part.toolInvocation) {
          return (
            <div key={i} className="w-full max-w-[85%] self-start">
              <InlineToolBlock toolInvocation={part.toolInvocation} />
            </div>
          );
        }
        return null;
      })}
      <MessageMeta role="assistant" timestamp={timestamp} />
    </div>
  );
}

export function SavedMessage({
  role,
  content,
  parts,
  createdAt,
  metadata,
}: SavedMessageProps) {
  const timestamp = new Date(createdAt);

  if (role === "user") {
    return (
      <div className="flex flex-col gap-1">
        <div className="chat-bubble chat-bubble--user self-end">
          <span className="whitespace-pre-wrap">{content}</span>
        </div>
        <MessageMeta role="user" timestamp={timestamp} />
        <AttachmentChips metadata={metadata} align="end" />
      </div>
    );
  }

  if (parts && parts.length > 0) {
    return (
      <div className="flex flex-col gap-1">
        {parts.map((part, i) => {
          if (part.type === "text") {
            return (
              <div
                key={i}
                className="chat-bubble chat-bubble--assistant self-start"
              >
                <div className="chat-markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {part.text}
                  </ReactMarkdown>
                </div>
              </div>
            );
          }
          if (part.type === "tool-invocation") {
            return (
              <div key={i} className="w-full max-w-[85%] self-start">
                <InlineToolBlock toolInvocation={part.toolInvocation} />
              </div>
            );
          }
          return null;
        })}
        <MessageMeta role="assistant" timestamp={timestamp} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="chat-bubble chat-bubble--assistant self-start">
        <div className="chat-markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>
      <MessageMeta role="assistant" timestamp={timestamp} />
    </div>
  );
}
