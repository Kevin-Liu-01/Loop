import { tool } from "ai";
import { z } from "zod";

import {
  FETCH_PAGE_MAX_CHARS,
  FETCH_PAGE_TIMEOUT_MS,
} from "@/lib/agent-tools/constants";
import { resolveSearchProvider } from "@/lib/agent-tools/search-providers";
import type { SearchProvider } from "@/lib/agent-tools/search-providers";
import type { FetchPageToolOutput } from "@/lib/agent-tools/types";

function stripHtmlToText(html: string): string {
  return html
    .replaceAll(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replaceAll(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replaceAll(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replaceAll(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replaceAll(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replaceAll(/<[^>]+>/g, " ")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll(/\s+/g, " ")
    .trim();
}

function extractTitle(html: string): string {
  const match = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
  return match?.[1]?.trim() ?? "Untitled";
}

async function fetchWithProvider(
  provider: SearchProvider,
  url: string,
  maxChars: number
): Promise<FetchPageToolOutput> {
  const result = await provider.scrape(url);
  if (!result) {
    throw new Error(`${provider.id} scrape returned no content`);
  }

  const content = result.markdown.slice(0, maxChars);
  return { content, contentLength: content.length, title: result.title, url };
}

async function fetchWithHttp(
  url: string,
  timeoutMs: number,
  maxChars: number
): Promise<FetchPageToolOutput> {
  const response = await fetch(url, {
    headers: {
      accept: "text/html, application/xhtml+xml, text/plain, */*",
      "user-agent": "LoopBot/0.1 (+https://loop.local)",
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    return { error: `HTTP ${response.status} ${response.statusText}` };
  }

  const raw = await response.text();
  const title = extractTitle(raw);
  const content = stripHtmlToText(raw).slice(0, maxChars);
  return { content, contentLength: content.length, title, url };
}

export async function fetchPageContent(
  url: string,
  timeoutMs = FETCH_PAGE_TIMEOUT_MS,
  maxChars = FETCH_PAGE_MAX_CHARS,
  provider?: SearchProvider
): Promise<FetchPageToolOutput> {
  const scrapeProvider = provider ?? resolveSearchProvider();

  try {
    try {
      return await fetchWithProvider(scrapeProvider, url, maxChars);
    } catch (error) {
      console.warn(
        `[fetch_page] ${scrapeProvider.id} scrape failed, falling back to HTTP: ${error instanceof Error ? error.message : String(error)}`
      );
    }
    return await fetchWithHttp(url, timeoutMs, maxChars);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fetch failed";
    return { error: `Failed to fetch ${url}: ${message}` };
  }
}

export function buildFetchPageTool(provider?: SearchProvider) {
  return tool({
    description:
      "Fetch a URL and return its content as clean markdown. Handles JavaScript-rendered pages, anti-bot protection, and dynamic content. " +
      "Use after web_search surfaces a promising link — read the full page to extract specific details like version numbers, API changes, code examples, or migration steps before citing them in the revision.",
    execute: async ({ url }): Promise<FetchPageToolOutput> => {
      console.info(`[tool:fetch_page] Fetching: ${url}`);
      const startMs = Date.now();
      const result = await fetchPageContent(
        url,
        FETCH_PAGE_TIMEOUT_MS,
        FETCH_PAGE_MAX_CHARS,
        provider
      );
      const elapsedMs = Date.now() - startMs;
      if ("error" in result) {
        console.warn(
          `[tool:fetch_page] FAILED in ${elapsedMs}ms: ${result.error}`
        );
      } else {
        console.info(
          `[tool:fetch_page] OK in ${elapsedMs}ms – "${result.title}" (${result.contentLength} chars)`
        );
      }
      return result;
    },
    inputSchema: z.object({
      url: z
        .string()
        .url()
        .describe("Full URL to fetch — must be publicly accessible"),
    }),
  });
}
