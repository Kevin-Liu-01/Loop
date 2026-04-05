import { tool } from "ai";
import { z } from "zod";

import {
  closeBrowserSession,
  createSessionId,
  isBrowserAvailable,
  runBrowserCommand,
} from "@/lib/agent-tools/browser";
import {
  BROWSER_COMMAND_TIMEOUT_MS,
  BROWSER_SEARCH_MAX_RESULTS,
  SEARCH_MAX_RESULTS,
  SEARCH_MAX_TOKENS,
} from "@/lib/agent-tools/constants";
import { executePerplexitySearch } from "@/lib/agent-tools/perplexity-fallback";
import type {
  SearchBudget,
  SearchRecency,
  WebSearchResult,
  WebSearchToolOutput,
} from "@/lib/agent-tools/types";

const RECENCY_TO_DDG_PARAM: Record<SearchRecency, string> = {
  day: "d",
  week: "w",
  month: "m",
  year: "y",
};

const EXTRACT_RESULTS_SCRIPT = `JSON.stringify(
  Array.from(document.querySelectorAll('.result, .results_links_deep, [data-result]'))
    .slice(0, ${BROWSER_SEARCH_MAX_RESULTS})
    .map(r => {
      const a = r.querySelector('.result__a, a.result-link, [data-testid="result-title-a"], h2 a');
      const snip = r.querySelector('.result__snippet, .result__body, [data-result="snippet"]');
      return {
        title: (a && a.textContent ? a.textContent.trim() : ''),
        url: (a && a.href ? a.href : ''),
        snippet: (snip && snip.textContent ? snip.textContent.trim() : '')
      };
    })
    .filter(r => r.title && r.url)
)`;

function buildSearchUrl(query: string, recency?: SearchRecency): string {
  const params = new URLSearchParams({ q: query });
  if (recency && RECENCY_TO_DDG_PARAM[recency]) {
    params.set("df", RECENCY_TO_DDG_PARAM[recency]);
  }
  return `https://html.duckduckgo.com/html/?${params.toString()}`;
}

async function searchWithBrowser(
  query: string,
  recency?: SearchRecency
): Promise<WebSearchResult[]> {
  const sessionId = createSessionId();
  try {
    const url = buildSearchUrl(query, recency);
    await runBrowserCommand(["open", url], {
      sessionId,
      timeoutMs: BROWSER_COMMAND_TIMEOUT_MS,
    });

    await runBrowserCommand(["wait", "1500"], { sessionId, timeoutMs: 5_000 });

    const raw = await runBrowserCommand(
      ["eval", EXTRACT_RESULTS_SCRIPT],
      { sessionId, timeoutMs: 10_000 }
    );

    const cleaned = raw.replace(/^[^[]*/, "").replace(/[^\]]*$/, "");
    const parsed: WebSearchResult[] = JSON.parse(cleaned || "[]");
    return parsed.slice(0, SEARCH_MAX_RESULTS);
  } finally {
    await closeBrowserSession(sessionId);
  }
}

export async function executeSearch(
  query: string,
  recency?: SearchRecency
): Promise<WebSearchResult[]> {
  const browserReady = await isBrowserAvailable();

  if (browserReady) {
    try {
      return await searchWithBrowser(query, recency);
    } catch (browserError) {
      console.warn(
        `[web_search] Browser search failed, falling back to Perplexity: ${
          browserError instanceof Error ? browserError.message : String(browserError)
        }`
      );
    }
  }

  return executePerplexitySearch(query, recency);
}

export function buildWebSearchTool(budget: SearchBudget) {
  return tool({
    description:
      "Search the web for live information. Returns a list of results with titles, URLs, and snippets. " +
      "Use aggressively: search for recent changes, verify claims, find primary sources, discover adjacent topics. " +
      "Chain multiple searches — start broad, then narrow on specifics. Budget is limited so make queries specific and targeted.",
    inputSchema: z.object({
      query: z
        .string()
        .min(3)
        .max(200)
        .describe(
          "Specific search query — include key terms, version numbers, or date ranges for better results"
        ),
      recency: z
        .enum(["day", "week", "month", "year"])
        .optional()
        .describe(
          "Filter by content age. Use 'week' or 'month' for fast-moving topics, omit for evergreen queries"
        ),
    }),
    execute: async ({ query, recency }): Promise<WebSearchToolOutput> => {
      if (budget.used >= budget.max) {
        console.warn(
          `[tool:web_search] Budget exhausted (${budget.max}/${budget.max}) – rejecting query: "${query}"`
        );
        return {
          error: `Search budget exhausted (${budget.max}/${budget.max} used). Work with what you have.`,
        };
      }
      budget.used++;
      const searchIndex = budget.used;
      console.info(
        `[tool:web_search] #${searchIndex}/${budget.max} query: "${query}" (recency: ${recency ?? "any"})`
      );
      const startMs = Date.now();

      try {
        const results = await executeSearch(query, recency);
        const elapsedMs = Date.now() - startMs;
        console.info(
          `[tool:web_search] #${searchIndex} returned ${results.length} results in ${elapsedMs}ms – remaining: ${budget.max - budget.used}`
        );
        return { results, budgetRemaining: budget.max - budget.used };
      } catch (error) {
        budget.used--;
        const elapsedMs = Date.now() - startMs;
        const message =
          error instanceof Error ? error.message : "Search failed";
        console.error(
          `[tool:web_search] #${searchIndex} FAILED in ${elapsedMs}ms: ${message}`
        );
        return { error: `Web search failed: ${message}` };
      }
    },
  });
}
