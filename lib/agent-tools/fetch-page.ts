import { tool } from "ai";
import { z } from "zod";

import { FETCH_PAGE_MAX_CHARS, FETCH_PAGE_TIMEOUT_MS } from "@/lib/agent-tools/constants";
import { firecrawlScrape } from "@/lib/agent-tools/firecrawl";
import type { FetchPageToolOutput } from "@/lib/agent-tools/types";

function stripHtmlToText(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html: string): string {
  const match = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
  return match?.[1]?.trim() ?? "Untitled";
}

async function fetchWithFirecrawl(url: string, maxChars: number): Promise<FetchPageToolOutput> {
  const response = await firecrawlScrape(url);

  if (!response.success) {
    throw new Error(response.error ?? "Firecrawl scrape returned unsuccessful response");
  }

  const markdown = response.data?.markdown ?? "";
  const title = response.data?.metadata?.title ?? "Untitled";
  const content = markdown.slice(0, maxChars);

  return { url, title, content, contentLength: content.length };
}

async function fetchWithHttp(url: string, timeoutMs: number, maxChars: number): Promise<FetchPageToolOutput> {
  const response = await fetch(url, {
    headers: {
      "user-agent": "LoopBot/0.1 (+https://loop.local)",
      accept: "text/html, application/xhtml+xml, text/plain, */*",
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    return { error: `HTTP ${response.status} ${response.statusText}` };
  }

  const raw = await response.text();
  const title = extractTitle(raw);
  const content = stripHtmlToText(raw).slice(0, maxChars);
  return { url, title, content, contentLength: content.length };
}

export async function fetchPageContent(
  url: string,
  timeoutMs = FETCH_PAGE_TIMEOUT_MS,
  maxChars = FETCH_PAGE_MAX_CHARS
): Promise<FetchPageToolOutput> {
  try {
    if (process.env.FIRECRAWL_API_KEY) {
      try {
        return await fetchWithFirecrawl(url, maxChars);
      } catch (err) {
        console.warn(`[fetch_page] Firecrawl scrape failed, falling back to HTTP: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    return await fetchWithHttp(url, timeoutMs, maxChars);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fetch failed";
    return { error: `Failed to fetch ${url}: ${message}` };
  }
}

export function buildFetchPageTool() {
  return tool({
    description:
      "Fetch a URL and return its content as clean markdown. Handles JavaScript-rendered pages, anti-bot protection, and dynamic content. " +
      "Use after web_search surfaces a promising link — read the full page to extract specific details like version numbers, API changes, code examples, or migration steps before citing them in the revision.",
    inputSchema: z.object({
      url: z.string().url().describe("Full URL to fetch — must be publicly accessible"),
    }),
    execute: async ({ url }): Promise<FetchPageToolOutput> => {
      console.info(`[tool:fetch_page] Fetching: ${url}`);
      const startMs = Date.now();
      const result = await fetchPageContent(url);
      const elapsedMs = Date.now() - startMs;
      if ("error" in result) {
        console.warn(`[tool:fetch_page] FAILED in ${elapsedMs}ms: ${result.error}`);
      } else {
        console.info(`[tool:fetch_page] OK in ${elapsedMs}ms – "${result.title}" (${result.contentLength} chars)`);
      }
      return result;
    },
  });
}
