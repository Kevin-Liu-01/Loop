export type SearchProviderId =
  | "brave"
  | "firecrawl"
  | "serper"
  | "tavily"
  | "jina";

export interface SearchProviderMeta {
  label: string;
  docsUrl: string;
  description: string;
}

export const SEARCH_PROVIDER_META: Record<
  SearchProviderId,
  SearchProviderMeta
> = {
  brave: {
    label: "Brave Search (default — free)",
    docsUrl: "https://brave.com/search/api/",
    description:
      "Independent search index with 2,000 free queries per month. No API key required from you — the platform provides this.",
  },
  firecrawl: {
    label: "Firecrawl",
    docsUrl: "https://firecrawl.dev",
    description:
      "Premium web scraping and search API. Handles JavaScript-rendered pages and anti-bot protection.",
  },
  serper: {
    label: "Serper",
    docsUrl: "https://serper.dev",
    description:
      "Google Search results via API. Fast and affordable with a generous free tier.",
  },
  tavily: {
    label: "Tavily",
    docsUrl: "https://tavily.com",
    description:
      "Search API built for AI agents. Returns clean, relevant results optimized for LLMs.",
  },
  jina: {
    label: "Jina",
    docsUrl: "https://jina.ai/?sui=apikey",
    description:
      "Search and page reading powered by Jina AI. Includes a scrape/reader API for full page content.",
  },
};
