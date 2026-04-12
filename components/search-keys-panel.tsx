"use client";

import { useState, useTransition } from "react";

import { CheckIcon, GlobeIcon, KeyIcon } from "@/components/frontier-icons";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLabel, textFieldBase } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import type { SelectOption } from "@/components/ui/select";
import { StatusDot } from "@/components/ui/status-dot";
import type { SearchProviderId } from "@/lib/agent-tools/search-provider-meta";
import { SEARCH_PROVIDER_META } from "@/lib/agent-tools/search-provider-meta";
import { cn } from "@/lib/cn";

type ProviderKey = Exclude<SearchProviderId, "jina">;

interface MaskedKeys {
  provider: SearchProviderId;
  firecrawl: string | null;
  serper: string | null;
  tavily: string | null;
  brave: string | null;
}

interface SearchKeysPanelProps {
  initialKeys: MaskedKeys;
}

const PROVIDER_OPTIONS: SelectOption[] = (
  Object.entries(SEARCH_PROVIDER_META) as [
    SearchProviderId,
    (typeof SEARCH_PROVIDER_META)[SearchProviderId],
  ][]
).map(([id, meta]) => ({
  value: id,
  label: meta.label,
  icon:
    id === "jina" ? (
      <GlobeIcon className="h-3.5 w-3.5 text-success" />
    ) : (
      <KeyIcon className="h-3.5 w-3.5 text-ink-faint" />
    ),
}));

const KEY_FIELDS: ProviderKey[] = ["firecrawl", "serper", "tavily", "brave"];

export function SearchKeysPanel({ initialKeys }: SearchKeysPanelProps) {
  const [provider, setProvider] = useState<SearchProviderId>(
    initialKeys.provider
  );
  const [keyInputs, setKeyInputs] = useState<Record<ProviderKey, string>>({
    firecrawl: "",
    serper: "",
    tavily: "",
    brave: "",
  });
  const [savedMasks, setSavedMasks] = useState<
    Record<ProviderKey, string | null>
  >({
    firecrawl: initialKeys.firecrawl,
    serper: initialKeys.serper,
    tavily: initialKeys.tavily,
    brave: initialKeys.brave,
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const activeProvider = provider;
  const needsKey = activeProvider !== "jina";
  const activeKey = needsKey ? activeProvider : null;

  function handleSave() {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const body: Record<string, unknown> = { provider };

      for (const field of KEY_FIELDS) {
        const input = keyInputs[field];
        if (input.trim()) {
          body[field] = input.trim();
        }
      }

      const response = await fetch("/api/settings/search-keys", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        searchKeys?: MaskedKeys;
      };

      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Failed to save search settings.");
        return;
      }

      if (payload.searchKeys) {
        setSavedMasks({
          firecrawl: payload.searchKeys.firecrawl,
          serper: payload.searchKeys.serper,
          tavily: payload.searchKeys.tavily,
          brave: payload.searchKeys.brave,
        });
      }

      setKeyInputs({ firecrawl: "", serper: "", tavily: "", brave: "" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  }

  return (
    <div className="grid gap-6">
      {/* Active provider status */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-none border border-line bg-paper-3/92 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/25 bg-accent/8 shadow-[0_1px_0_0_rgba(232,101,10,0.08)]">
            <GlobeIcon className="h-4.5 w-4.5 text-accent" />
          </span>
          <div>
            <p className="m-0 text-sm font-semibold tracking-tight text-ink">
              Active search provider
            </p>
            <p className="m-0 flex items-center gap-1.5 text-xs text-ink-faint">
              <StatusDot tone="fresh" size="xs" />
              {SEARCH_PROVIDER_META[activeProvider].label}
            </p>
          </div>
        </div>
      </div>

      {/* Provider selector */}
      <FieldGroup>
        <FieldLabel>Search provider</FieldLabel>
        <Select
          options={PROVIDER_OPTIONS}
          value={provider}
          onChange={(v) => {
            setProvider(v as SearchProviderId);
            setError(null);
            setSuccess(false);
          }}
        />
        <p className="m-0 text-xs leading-relaxed text-ink-faint">
          {SEARCH_PROVIDER_META[provider].description}
        </p>
      </FieldGroup>

      {/* API key input — shown only for non-Jina providers */}
      {needsKey && activeKey && (
        <FieldGroup>
          <FieldLabel>
            {SEARCH_PROVIDER_META[activeKey].label} API key
          </FieldLabel>
          <div className="relative">
            <input
              type="password"
              className={cn(textFieldBase, "pr-10 font-mono text-[0.8125rem]")}
              placeholder={
                savedMasks[activeKey]
                  ? `Current: ${savedMasks[activeKey]}`
                  : "Paste your API key"
              }
              value={keyInputs[activeKey]}
              onChange={(e) =>
                setKeyInputs((prev) => ({
                  ...prev,
                  [activeKey]: e.target.value,
                }))
              }
              autoComplete="off"
            />
            {savedMasks[activeKey] && (
              <span className="absolute top-1/2 right-3 -translate-y-1/2">
                <CheckIcon className="h-3.5 w-3.5 text-success" />
              </span>
            )}
          </div>
          <p className="m-0 text-xs text-ink-faint">
            Get a key at{" "}
            <a
              href={SEARCH_PROVIDER_META[activeKey].docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
            >
              {SEARCH_PROVIDER_META[activeKey].docsUrl.replace(
                /^https?:\/\//,
                ""
              )}
            </a>
          </p>
        </FieldGroup>
      )}

      {/* Save button + feedback */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={isPending}
          variant="primary"
          size="sm"
        >
          {isPending ? "Saving\u2026" : "Save search settings"}
        </Button>

        {success && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-success">
            <CheckIcon className="h-3.5 w-3.5" />
            Saved
          </span>
        )}

        {error && (
          <span className="text-xs font-medium text-red-500">{error}</span>
        )}
      </div>
    </div>
  );
}
