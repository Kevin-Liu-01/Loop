import { tool } from "ai";
import { z } from "zod";

import { SEARCH_MAX_RESULTS } from "@/lib/agent-tools/constants";
import { resolveSearchProvider } from "@/lib/agent-tools/search-providers";
import type { SearchProvider } from "@/lib/agent-tools/search-providers";
import type {
  SearchBudget,
  WebSearchToolOutput,
} from "@/lib/agent-tools/types";

export function buildWebSearchTool(
  budget: SearchBudget,
  provider?: SearchProvider
) {
  const searchProvider = provider ?? resolveSearchProvider();

  return tool({
    description:
      "Search the web for live information. Returns a list of results with titles, URLs, and snippets. " +
      "Use aggressively: search for recent changes, verify claims, find primary sources, discover adjacent topics. " +
      "Chain multiple searches — start broad, then narrow on specifics. Budget is limited so make queries specific and targeted.",
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

      const searchQuery = recency ? `${query} (past ${recency})` : query;
      console.info(
        `[tool:web_search] #${searchIndex}/${budget.max} query: "${searchQuery}" (recency: ${recency ?? "any"}, provider: ${searchProvider.id})`
      );
      const startMs = Date.now();

      try {
        const results = await searchProvider.search(
          searchQuery,
          SEARCH_MAX_RESULTS
        );
        const elapsedMs = Date.now() - startMs;
        console.info(
          `[tool:web_search] #${searchIndex} returned ${results.length} results in ${elapsedMs}ms – remaining: ${budget.max - budget.used}`
        );
        return { budgetRemaining: budget.max - budget.used, results };
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
  });
}
