"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";

import {
  SendIcon,
  TerminalIcon,
  SparkIcon,
  ClockIcon,
  PanelRightIcon,
} from "@/components/frontier-icons";
import { SandboxStatusBar } from "@/components/ui/sandbox-status-bar";
import { SandboxMessage, SavedMessage } from "@/components/sandbox-message";
import { SandboxSidebar } from "@/components/sandbox-sidebar";
import { SandboxToolbar } from "@/components/sandbox-toolbar";
import type { SandboxToolbarConfig } from "@/components/sandbox-toolbar";
import { SandboxInspector } from "@/components/sandbox-inspector";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useSandboxInspector } from "@/hooks/use-sandbox-inspector";
import { pageHeaderSub } from "@/lib/ui-layout";
import type {
  AgentProviderPreset,
  ConversationMessage,
  ImportedMcpDocument,
  SkillRecord,
} from "@/lib/types";

type SandboxRuntime = "node24" | "python3.13";

type SandboxShellProps = {
  mcps: ImportedMcpDocument[];
  presets: AgentProviderPreset[];
  skills: SkillRecord[];
  initialSkillSlug?: string;
};

type SandboxState = "idle" | "creating" | "running" | "stopped" | "error";

const CONFIG_KEY = "loop.sandbox.config";
const SIDEBAR_KEY = "loop.sandbox.sidebar";
const INSPECTOR_KEY = "loop.sandbox.inspector";

function defaultConfig(
  presets: AgentProviderPreset[],
  initialSkillSlug?: string,
): SandboxToolbarConfig {
  const preset = presets[0];
  return {
    runtime: "node24",
    providerId: preset?.id ?? "gateway",
    model: preset?.defaultModel ?? "openai/gpt-5.4-mini",
    apiKeyEnvVar: preset?.apiKeyEnvVar ?? "",
    selectedSkillSlugs: initialSkillSlug ? [initialSkillSlug] : [],
    selectedMcpIds: [],
  };
}

type SandboxAuthError = {
  code: "SANDBOX_AUTH_FAILED";
  message: string;
  steps: string[];
};

type SandboxRequestResult =
  | { sandboxId: string }
  | { error: string; authError?: SandboxAuthError };

async function requestSandbox(
  runtime: SandboxRuntime,
): Promise<SandboxRequestResult> {
  try {
    const res = await fetch("/api/sandbox/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ runtime }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      if (body.code === "SANDBOX_AUTH_FAILED") {
        return {
          error: body.message,
          authError: body as SandboxAuthError,
        };
      }
      return {
        error: body.error ?? `Sandbox creation failed (${res.status})`,
      };
    }
    return (await res.json()) as { sandboxId: string };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Sandbox creation failed",
    };
  }
}

function extractTextFromParts(
  parts: Array<{ type?: string; text?: string }>,
): string {
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("");
}

type MessagePart = {
  type: string;
  text?: string;
  toolInvocation?: {
    toolName: string;
    args: Record<string, unknown>;
    result?: Record<string, unknown>;
    state: string;
  };
  [key: string]: unknown;
};

const SUGGESTIONS = [
  "Fetch the top HN story and analyze it",
  "Create a simple HTTP server and test it",
  "Use attached MCP tools to query my data",
];

export function SandboxShell({
  mcps = [],
  presets,
  skills,
  initialSkillSlug,
}: SandboxShellProps) {
  // ── Config ──
  const [config, setConfig] = useState<SandboxToolbarConfig>(() =>
    defaultConfig(presets, initialSkillSlug),
  );
  const hydratedRef = useRef(false);

  // ── Layout ──
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  // ── Sandbox session ──
  const [sandboxId, setSandboxId] = useState<string | null>(null);
  const [sandboxState, setSandboxState] = useState<SandboxState>("idle");
  const [sandboxError, setSandboxError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<SandboxAuthError | null>(null);

  // ── Conversation persistence ──
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sidebarVersion, setSidebarVersion] = useState(0);
  const [viewConvo, setViewConvo] = useState<{
    messages: ConversationMessage[];
    title: string;
  } | null>(null);
  const [chatKey, setChatKey] = useState(() => String(Date.now()));

  // ── Input ──
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Refs for transport body ──
  const sandboxIdRef = useRef<string | null>(null);
  const configRef = useRef(config);
  configRef.current = config;
  const conversationIdRef = useRef(conversationId);
  conversationIdRef.current = conversationId;

  // ── VM Inspector hook ──
  const inspector = useSandboxInspector(
    sandboxId,
    config.runtime,
    inspectorOpen && sandboxState === "running",
  );

  // ── Hydrate persisted config + panel states ──
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CONFIG_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SandboxToolbarConfig>;
        setConfig((prev) => ({
          ...prev,
          runtime: saved.runtime ?? prev.runtime,
          providerId: saved.providerId ?? prev.providerId,
          model: saved.model ?? prev.model,
          apiKeyEnvVar: saved.apiKeyEnvVar ?? prev.apiKeyEnvVar,
          selectedSkillSlugs: initialSkillSlug
            ? prev.selectedSkillSlugs
            : saved.selectedSkillSlugs ?? prev.selectedSkillSlugs,
          selectedMcpIds: saved.selectedMcpIds ?? prev.selectedMcpIds,
        }));
      }
    } catch {
      /* ignore */
    }
    try {
      const stored = window.localStorage.getItem(SIDEBAR_KEY);
      if (stored !== null) setSidebarOpen(stored === "true");
    } catch {
      /* ignore */
    }
    try {
      const stored = window.localStorage.getItem(INSPECTOR_KEY);
      if (stored !== null) setInspectorOpen(stored === "true");
    } catch {
      /* ignore */
    }
    hydratedRef.current = true;
  }, [initialSkillSlug]);

  // ── Persist config ──
  useEffect(() => {
    if (hydratedRef.current) {
      window.localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    }
  }, [config]);

  // ── Persist panel states ──
  useEffect(() => {
    if (hydratedRef.current) {
      window.localStorage.setItem(SIDEBAR_KEY, String(sidebarOpen));
    }
  }, [sidebarOpen]);

  useEffect(() => {
    if (hydratedRef.current) {
      window.localStorage.setItem(INSPECTOR_KEY, String(inspectorOpen));
    }
  }, [inspectorOpen]);

  // ── Cleanup sandbox on page unload ──
  useEffect(() => {
    function handleUnload() {
      if (sandboxIdRef.current) {
        fetch(`/api/sandbox/session?sandboxId=${sandboxIdRef.current}`, {
          method: "DELETE",
          keepalive: true,
        });
      }
    }
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  // ── Transport ──
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/sandbox/run",
        body: () => ({
          sandboxId: sandboxIdRef.current ?? "",
          runtime: configRef.current.runtime,
          providerId: configRef.current.providerId,
          model: configRef.current.model,
          apiKeyEnvVar: configRef.current.apiKeyEnvVar,
          selectedSkillSlugs: configRef.current.selectedSkillSlugs,
          selectedMcpIds: configRef.current.selectedMcpIds,
        }),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const { messages, sendMessage, status, error } = useChat({
    id: `sandbox-${chatKey}`,
    transport,
  });

  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // ── Auto-scroll ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Auto-save when streaming completes ──
  const prevStatusRef = useRef(status);
  useEffect(() => {
    const wasStreaming =
      prevStatusRef.current === "streaming" ||
      prevStatusRef.current === "submitted";
    if (
      wasStreaming &&
      status === "ready" &&
      messagesRef.current.length > 0 &&
      !viewConvo
    ) {
      doSave();
    }
    prevStatusRef.current = status;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function doSave() {
    const msgs = messagesRef.current;
    const firstUserMsg = msgs.find((m) => m.role === "user");
    const title = firstUserMsg
      ? extractTextFromParts(
          (firstUserMsg.parts ?? []) as Array<{
            type?: string;
            text?: string;
          }>,
        ).slice(0, 100)
      : "Untitled session";

    const serialized = msgs.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: extractTextFromParts(
        (m.parts ?? []) as Array<{ type?: string; text?: string }>,
      ),
      createdAt:
        (m as unknown as { createdAt?: Date }).createdAt?.toISOString() ??
        new Date().toISOString(),
    }));

    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: conversationIdRef.current,
          channel: "sandbox",
          title,
          messages: serialized,
          model: configRef.current.model,
          providerId: configRef.current.providerId,
        }),
      });
      const data = (await res.json()) as { id?: string };
      if (data.id && !conversationIdRef.current) {
        setConversationId(data.id);
      }
      setSidebarVersion((v) => v + 1);
    } catch {
      /* best effort */
    }
  }

  // ── Sandbox lifecycle ──
  const createSandbox = useCallback(async (): Promise<string | null> => {
    setSandboxState("creating");
    setSandboxError(null);
    setAuthError(null);
    const result = await requestSandbox(
      configRef.current.runtime as SandboxRuntime,
    );
    if ("error" in result) {
      setSandboxError(result.error);
      if (result.authError) setAuthError(result.authError);
      setSandboxState("error");
      return null;
    }
    sandboxIdRef.current = result.sandboxId;
    setSandboxId(result.sandboxId);
    setSandboxState("running");
    return result.sandboxId;
  }, []);

  const stopSandbox = useCallback(async () => {
    const id = sandboxIdRef.current;
    if (!id) return;
    try {
      await fetch(`/api/sandbox/session?sandboxId=${id}`, {
        method: "DELETE",
      });
    } catch {
      /* best effort */
    }
    sandboxIdRef.current = null;
    setSandboxId(null);
    setSandboxState("stopped");
  }, []);

  // ── Send message ──
  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");

    if (viewConvo) {
      setViewConvo(null);
      setConversationId(null);
      setChatKey(String(Date.now()));
    }

    if (!sandboxIdRef.current) {
      const created = await createSandbox();
      if (!created) return;
    }

    sendMessage({ text });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ── Conversation switching ──
  async function handleSelectConversation(id: string) {
    if (id === conversationId && !viewConvo) return;
    try {
      const res = await fetch(`/api/conversations/${id}`);
      const data = (await res.json()) as {
        conversation?: {
          messages: ConversationMessage[];
          title: string;
        };
      };
      if (data.conversation) {
        setViewConvo({
          messages: data.conversation.messages,
          title: data.conversation.title,
        });
        setConversationId(id);
      }
    } catch {
      /* ignore */
    }
  }

  function handleNewConversation() {
    setViewConvo(null);
    setConversationId(null);
    setChatKey(String(Date.now()));
    if (sandboxIdRef.current) stopSandbox();
  }

  // ── Config helpers ──
  function toggleSkill(slug: string) {
    setConfig((prev) => ({
      ...prev,
      selectedSkillSlugs: prev.selectedSkillSlugs.includes(slug)
        ? prev.selectedSkillSlugs.filter((s) => s !== slug)
        : [...prev.selectedSkillSlugs, slug],
    }));
  }

  function toggleMcp(id: string) {
    setConfig((prev) => ({
      ...prev,
      selectedMcpIds: prev.selectedMcpIds.includes(id)
        ? prev.selectedMcpIds.filter((m) => m !== id)
        : [...prev.selectedMcpIds, id],
    }));
  }

  function updateConfig<K extends keyof SandboxToolbarConfig>(
    key: K,
    value: SandboxToolbarConfig[K],
  ) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  const isStreaming = status === "submitted" || status === "streaming";
  const isBusy = isStreaming || sandboxState === "creating";
  const isActive = !viewConvo;
  const showEmptyHero = isActive && messages.length === 0;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1">
      {/* ── Left sidebar ── */}
      {sidebarOpen && (
        <aside
          className={cn(
            "flex h-full min-h-0 w-[260px] shrink-0 flex-col overflow-hidden border-r border-line/60 bg-paper-2/30 backdrop-blur-sm dark:bg-paper-2/20",
            "max-sm:absolute max-sm:inset-y-0 max-sm:left-0 max-sm:z-30 max-sm:w-[min(280px,92vw)] max-sm:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.2)]",
          )}
        >
          <SandboxSidebar
            currentId={conversationId}
            onNew={handleNewConversation}
            onSelect={handleSelectConversation}
            version={sidebarVersion}
          />
        </aside>
      )}

      {/* ── Center: toolbar + chat + composer ── */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-paper/40 dark:bg-paper/25">
        {/* Toolbar */}
        <SandboxToolbar
          config={config}
          presets={presets}
          skills={skills}
          mcps={mcps}
          sidebarOpen={sidebarOpen}
          inspectorOpen={inspectorOpen}
          onToggleSidebar={() => setSidebarOpen((p) => !p)}
          onToggleInspector={() => setInspectorOpen((p) => !p)}
          onUpdateConfig={updateConfig}
          onToggleSkill={toggleSkill}
          onToggleMcp={toggleMcp}
        />

        {/* Messages (scroll) */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth">
            {showEmptyHero ? (
              <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-10 px-6 py-20 text-center sm:py-28">
                <div className="grid max-w-lg gap-8">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-line/80 bg-paper-3/90 shadow-[0_1px_0_rgba(0,0,0,0.04),0_16px_40px_-12px_rgba(0,0,0,0.06)] ring-1 ring-ink/[0.03] dark:ring-white/[0.06]">
                    <TerminalIcon className="h-7 w-7 text-ink-faint" />
                  </div>
                  <div className="grid gap-3">
                    <h2 className="m-0 font-serif text-2xl font-medium tracking-[-0.03em] text-balance text-ink">
                      Sandbox
                    </h2>
                    <p
                      className={cn(
                        pageHeaderSub,
                        "mx-auto max-w-[min(100%,46ch)]",
                      )}
                    >
                      Run code, tools, and MCP servers in an isolated VM.
                      Attach skills and MCPs from the toolbar — a session
                      spins up when you send your first message.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2.5 pt-1">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        className="rounded-full border border-line/50 bg-paper-3/70 px-4 py-2.5 text-left text-[0.8rem] leading-snug text-ink-soft shadow-sm transition-[border-color,background-color,color] duration-150 hover:border-accent/30 hover:bg-paper-2 hover:text-ink"
                        onClick={() => setInput(suggestion)}
                        type="button"
                      >
                        <SparkIcon className="mr-2 inline-block h-3.5 w-3.5 align-[-2px] text-accent/60" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto grid w-full max-w-3xl gap-6 px-4 py-8 sm:px-6">

                {viewConvo && (
                  <>
                    <div className="flex items-center gap-3 border border-line/70 bg-paper-3/90 px-4 py-3 shadow-sm ring-1 ring-ink/[0.03] dark:bg-paper-3/70">
                      <ClockIcon className="h-4 w-4 shrink-0 text-ink-faint" />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-ink">
                          {viewConvo.title || "Untitled session"}
                        </span>
                        <span className="ml-2 text-xs text-ink-faint">
                          (read-only)
                        </span>
                      </div>
                      <Button
                        onClick={handleNewConversation}
                        size="sm"
                        variant="ghost"
                      >
                        New session
                      </Button>
                    </div>
                    {viewConvo.messages.map((m) => (
                      <SavedMessage
                        key={m.id}
                        content={m.content}
                        createdAt={m.createdAt}
                        role={m.role}
                      />
                    ))}
                  </>
                )}

                {isActive &&
                  messages.map((message) => (
                    <SandboxMessage
                      key={message.id}
                      createdAt={
                        (message as unknown as { createdAt?: Date }).createdAt
                      }
                      parts={(message.parts ?? []) as MessagePart[]}
                      role={message.role as "user" | "assistant"}
                    />
                  ))}

                {isBusy && isActive && (
                  <div className="flex items-center gap-3 pl-10">
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />
                    <span className="text-xs text-ink-soft">
                      {sandboxState === "creating"
                        ? "Starting sandbox..."
                        : "Agent is thinking..."}
                    </span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Composer + status */}
        <div
          className={cn(
            "shrink-0 border-t border-line/80 bg-paper-3/85 backdrop-blur-md dark:bg-paper-2/40",
            "px-4 sm:px-6",
            "pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4",
          )}
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-3.5">
            {isActive && (
              <SandboxStatusBar
                onStop={stopSandbox}
                runtime={config.runtime}
                sandboxId={sandboxId}
                status={sandboxState}
                uptimeSeconds={inspector.data?.uptimeSeconds ?? 0}
                timeoutMs={inspector.data?.timeoutMs ?? 120_000}
                processCount={inspector.data?.processes.length ?? 0}
              />
            )}

            <div className="flex items-end gap-2">
              <div className="relative min-w-0 flex-1">
                <textarea
                  ref={textareaRef}
                  className={cn(
                    "w-full resize-none border border-line/90 bg-paper-2/90 px-4 py-3 pr-12 text-sm leading-relaxed text-ink outline-none transition-[border-color,box-shadow,background-color]",
                    "placeholder:text-ink-faint focus:border-accent/35 focus:bg-paper-3 focus:shadow-[0_0_0_4px_rgba(232,101,10,0.08)] dark:bg-paper-2/80",
                  )}
                  disabled={isBusy}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    viewConvo
                      ? "Start a new session to send messages..."
                      : "Ask the agent to do something..."
                  }
                  rows={2}
                  value={input}
                />
                <Button
                  className="absolute bottom-2.5 right-2.5"
                  disabled={!input.trim() || isBusy}
                  onClick={handleSend}
                  size="icon-sm"
                >
                  <SendIcon className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Mobile inspector toggle */}
              <Button
                className="sm:hidden"
                onClick={() => setInspectorOpen((p) => !p)}
                size="icon-sm"
                variant={inspectorOpen ? "primary" : "ghost"}
                aria-label="Toggle VM inspector"
              >
                <PanelRightIcon className="h-3.5 w-3.5" />
              </Button>
            </div>

            {authError && (
              <div className="rounded-lg border border-danger/30 bg-danger/5 p-4">
                <p className="m-0 mb-3 text-sm font-medium text-danger">
                  {authError.message}
                </p>
                <ol className="m-0 grid gap-1.5 pl-5 text-xs leading-relaxed text-ink-soft">
                  {authError.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
            {!authError && (error || sandboxError) && (
              <p className="m-0 text-xs text-danger">
                {error?.message ?? sandboxError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Right panel: VM Inspector ── */}
      {inspectorOpen && (
        <aside
          className={cn(
            "flex h-full min-h-0 w-[320px] shrink-0 flex-col overflow-hidden border-l border-line/60 bg-paper-2/30 backdrop-blur-sm dark:bg-paper-2/20",
            "max-sm:absolute max-sm:inset-y-0 max-sm:right-0 max-sm:z-30 max-sm:w-[min(340px,92vw)] max-sm:shadow-[-24px_0_48px_-12px_rgba(0,0,0,0.2)]",
          )}
        >
          <SandboxInspector
            sandboxId={sandboxId}
            runtime={config.runtime}
            sandboxState={sandboxState}
            data={inspector.data}
            isLoading={inspector.isLoading}
            error={inspector.error}
            currentPath={inspector.currentPath}
            onRefresh={inspector.refresh}
            onBrowsePath={inspector.browsePath}
          />
        </aside>
      )}
    </div>
  );
}
