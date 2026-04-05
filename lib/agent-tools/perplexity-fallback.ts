import { gateway, generateText, stepCountIs } from "ai";

import { SEARCH_MAX_RESULTS, SEARCH_MAX_TOKENS } from "@/lib/agent-tools/constants";
import type { SearchRecency, WebSearchResult } from "@/lib/agent-tools/types";

function buildSearchModel() {
  return gateway("openai/gpt-5-mini");
}

function extractSourceUrl(source: {
  sourceType: string;
  url?: string;
  id?: string;
}): string {
  if ("url" in source && typeof source.url === "string") return source.url;
  if (
    "id" in source &&
    typeof source.id === "string" &&
    source.id.startsWith("http")
  )
    return source.id;
  return "";
}

export async function executePerplexitySearch(
  query: string,
  recency?: SearchRecency
): Promise<WebSearchResult[]> {
  const result = await generateText({
    model: buildSearchModel(),
    prompt: `Search: ${query}\n\nReturn the most relevant and recent results. Prioritize primary sources (official docs, changelogs, RFCs, maintainer posts) over aggregators and secondary commentary.`,
    tools: {
      perplexity_search: gateway.tools.perplexitySearch({
        maxResults: SEARCH_MAX_RESULTS,
        maxTokens: SEARCH_MAX_TOKENS,
        searchRecencyFilter: recency,
      }),
    },
    stopWhen: stepCountIs(2),
  });

  const searchResults: WebSearchResult[] = [];
  if (result.sources && result.sources.length > 0) {
    for (const source of result.sources) {
      const url = extractSourceUrl(
        source as { sourceType: string; url?: string; id?: string }
      );
      searchResults.push({
        title: source.title ?? (url || "Untitled"),
        url,
        snippet: "",
      });
    }
  }

  if (result.text) {
    searchResults.push({
      title: "Search summary",
      url: "",
      snippet: result.text.slice(0, 2000),
    });
  }

  return searchResults;
}
