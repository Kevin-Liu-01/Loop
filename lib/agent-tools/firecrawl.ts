import {
  FIRECRAWL_API_URL,
  FIRECRAWL_TIMEOUT_MS,
} from "@/lib/agent-tools/constants";

export interface FirecrawlSearchResult {
  url: string;
  title: string;
  description: string;
  position: number;
}

export interface FirecrawlSearchResponse {
  success: boolean;
  data?: { web?: FirecrawlSearchResult[] };
  error?: string;
}

export interface FirecrawlScrapeResponse {
  success: boolean;
  data?: {
    markdown?: string;
    metadata?: { title?: string; sourceURL?: string; statusCode?: number };
  };
  error?: string;
}

function getApiKey(): string {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) {
    throw new Error("FIRECRAWL_API_KEY environment variable is not set");
  }
  return key;
}

async function firecrawlRequest<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  const response = await fetch(`${FIRECRAWL_API_URL}${endpoint}`, {
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    method: "POST",
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

export async function firecrawlSearch(
  query: string,
  limit: number
): Promise<FirecrawlSearchResponse> {
  return firecrawlRequest<FirecrawlSearchResponse>("/search", { limit, query });
}

export async function firecrawlScrape(
  url: string
): Promise<FirecrawlScrapeResponse> {
  return firecrawlRequest<FirecrawlScrapeResponse>("/scrape", {
    formats: ["markdown"],
    url,
  });
}
