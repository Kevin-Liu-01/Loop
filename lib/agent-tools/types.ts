import type { SourceDefinition } from "@/lib/types";

export interface SearchBudget {
  max: number;
  used: number;
}

export type SearchRecency = "day" | "week" | "month" | "year";

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

export type WebSearchToolOutput =
  | {
      results: WebSearchResult[];
      budgetRemaining: number;
    }
  | {
      error: string;
    };

export type FetchPageToolOutput =
  | {
      url: string;
      title: string;
      content: string;
      contentLength: number;
    }
  | {
      error: string;
    };

export type AddSourceToolOutput =
  | {
      added: boolean;
      source: SourceDefinition;
    }
  | {
      error: string;
    };
