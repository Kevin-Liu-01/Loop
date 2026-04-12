import {
  FIRECRAWL_API_URL,
  FIRECRAWL_TIMEOUT_MS,
  JINA_READER_URL,
  JINA_SEARCH_URL,
  JINA_TIMEOUT_MS,
} from "@/lib/agent-tools/constants";
import type { SearchProviderId } from "@/lib/agent-tools/search-provider-meta";
import type { WebSearchResult } from "@/lib/agent-tools/types";

export type { SearchProviderId } from "@/lib/agent-tools/search-provider-meta";
export { SEARCH_PROVIDER_META } from "@/lib/agent-tools/search-provider-meta";

export interface SearchProvider {
  id: SearchProviderId;
  search(query: string, limit: number): Promise<WebSearchResult[]>;
  scrape(url: string): Promise<{ markdown: string; title: string } | null>;
}

export interface UserSearchKeys {
  provider?: SearchProviderId;
  firecrawl?: string;
  serper?: string;
  tavily?: string;
  brave?: string;
}

// ---------------------------------------------------------------------------
// Jina (default, free)
// ---------------------------------------------------------------------------

interface JinaSearchItem {
  title: string;
  description: string;
  url: string;
  content?: string;
}

interface JinaSearchResponse {
  code: number;
  data: JinaSearchItem[];
}

interface JinaReaderResponse {
  code: number;
  data: { title: string; content: string; url: string };
}

function getJinaApiKey(): string {
  const key = process.env.JINA_API_KEY;
  if (!key) {
    throw new Error(
      "JINA_API_KEY is not set. Get a free key at https://jina.ai/?sui=apikey"
    );
  }
  return key;
}

function createJinaProvider(): SearchProvider {
  return {
    id: "jina",
    async search(query, limit) {
      const response = await fetch(JINA_SEARCH_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${getJinaApiKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: query }),
        signal: AbortSignal.timeout(JINA_TIMEOUT_MS),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
          `Jina search returned HTTP ${response.status}: ${text.slice(0, 200)}`
        );
      }

      const json = (await response.json()) as JinaSearchResponse;
      return (json.data ?? []).slice(0, limit).map((item) => ({
        title: item.title,
        url: item.url,
        snippet: item.description,
      }));
    },

    async scrape(url) {
      const response = await fetch(JINA_READER_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${getJinaApiKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(JINA_TIMEOUT_MS),
      });

      if (!response.ok) {
        return null;
      }

      const json = (await response.json()) as JinaReaderResponse;
      return {
        markdown: json.data?.content ?? "",
        title: json.data?.title ?? "Untitled",
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Firecrawl (user-provided key)
// ---------------------------------------------------------------------------

function createFirecrawlProvider(apiKey: string): SearchProvider {
  async function firecrawlRequest<T>(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<T> {
    const response = await fetch(`${FIRECRAWL_API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(FIRECRAWL_TIMEOUT_MS),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Firecrawl ${endpoint} returned HTTP ${response.status}: ${text.slice(0, 200)}`
      );
    }

    return response.json() as Promise<T>;
  }

  return {
    id: "firecrawl",
    async search(query, limit) {
      const json = await firecrawlRequest<{
        success: boolean;
        data?: { web?: { title: string; url: string; description: string }[] };
        error?: string;
      }>("/search", { limit, query });

      if (!json.success) {
        throw new Error(json.error ?? "Firecrawl search failed");
      }

      return (json.data?.web ?? []).map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.description,
      }));
    },

    async scrape(url) {
      const json = await firecrawlRequest<{
        success: boolean;
        data?: {
          markdown?: string;
          metadata?: { title?: string };
        };
        error?: string;
      }>("/scrape", { formats: ["markdown"], url });

      if (!json.success) {
        return null;
      }

      return {
        markdown: json.data?.markdown ?? "",
        title: json.data?.metadata?.title ?? "Untitled",
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Serper (user-provided key)
// ---------------------------------------------------------------------------

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
}

function createSerperProvider(apiKey: string): SearchProvider {
  return {
    id: "serper",
    async search(query, limit) {
      const response = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify({ q: query, num: limit }),
        signal: AbortSignal.timeout(JINA_TIMEOUT_MS),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
          `Serper returned HTTP ${response.status}: ${text.slice(0, 200)}`
        );
      }

      const json = (await response.json()) as { organic?: SerperResult[] };
      return (json.organic ?? []).slice(0, limit).map((r) => ({
        title: r.title,
        url: r.link,
        snippet: r.snippet,
      }));
    },

    async scrape() {
      return null;
    },
  };
}

// ---------------------------------------------------------------------------
// Tavily (user-provided key)
// ---------------------------------------------------------------------------

interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

function createTavilyProvider(apiKey: string): SearchProvider {
  return {
    id: "tavily",
    async search(query, limit) {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          max_results: limit,
          search_depth: "basic",
        }),
        signal: AbortSignal.timeout(JINA_TIMEOUT_MS),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
          `Tavily returned HTTP ${response.status}: ${text.slice(0, 200)}`
        );
      }

      const json = (await response.json()) as { results?: TavilyResult[] };
      return (json.results ?? []).slice(0, limit).map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.content,
      }));
    },

    async scrape() {
      return null;
    },
  };
}

// ---------------------------------------------------------------------------
// Brave Search (user-provided key)
// ---------------------------------------------------------------------------

interface BraveResult {
  title: string;
  url: string;
  description: string;
}

function createBraveProvider(apiKey: string): SearchProvider {
  return {
    id: "brave",
    async search(query, limit) {
      const params = new URLSearchParams({
        q: query,
        count: String(limit),
      });

      const response = await fetch(
        `https://api.search.brave.com/res/v1/web/search?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": apiKey,
          },
          signal: AbortSignal.timeout(JINA_TIMEOUT_MS),
        }
      );

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
          `Brave Search returned HTTP ${response.status}: ${text.slice(0, 200)}`
        );
      }

      const json = (await response.json()) as {
        web?: { results?: BraveResult[] };
      };
      return (json.web?.results ?? []).slice(0, limit).map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.description,
      }));
    },

    async scrape() {
      return null;
    },
  };
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

const PROVIDER_FACTORIES: Record<
  Exclude<SearchProviderId, "jina">,
  (apiKey: string) => SearchProvider
> = {
  firecrawl: createFirecrawlProvider,
  serper: createSerperProvider,
  tavily: createTavilyProvider,
  brave: createBraveProvider,
};

let _jinaProvider: SearchProvider | null = null;

function getJinaProvider(): SearchProvider {
  _jinaProvider ??= createJinaProvider();
  return _jinaProvider;
}

/**
 * Resolve the search provider for a request.
 *
 * If the user has configured a non-Jina provider with a valid key, use it.
 * Otherwise, always fall back to Jina (free, platform-level).
 */
export function resolveSearchProvider(
  userKeys?: UserSearchKeys | null
): SearchProvider {
  if (userKeys?.provider && userKeys.provider !== "jina") {
    const key = userKeys[userKeys.provider];
    if (key) {
      const factory = PROVIDER_FACTORIES[userKeys.provider];
      return factory(key);
    }
  }

  return getJinaProvider();
}
