export type RefreshScope = "all" | "daily" | "signals-only" | "skills-only";

export interface RefreshExecutionPlan {
  refreshCategorySignals: boolean;
  refreshImportedSkills: boolean;
  refreshUserSkills: boolean;
}

const REFRESH_SCOPES = new Set<RefreshScope>([
  "all",
  "daily",
  "signals-only",
  "skills-only",
]);

export function parseRefreshScope(url: string): RefreshScope | null {
  const rawScope = new URL(url).searchParams.get("scope") ?? "all";
  return REFRESH_SCOPES.has(rawScope as RefreshScope)
    ? (rawScope as RefreshScope)
    : null;
}

export function buildRefreshExecutionPlan(
  scope: RefreshScope
): RefreshExecutionPlan {
  switch (scope) {
    case "daily": {
      return {
        refreshCategorySignals: true,
        refreshImportedSkills: false,
        refreshUserSkills: true,
      };
    }
    case "signals-only": {
      return {
        refreshCategorySignals: true,
        refreshImportedSkills: false,
        refreshUserSkills: false,
      };
    }
    case "skills-only": {
      return {
        refreshCategorySignals: false,
        refreshImportedSkills: true,
        refreshUserSkills: true,
      };
    }
    case "all": {
      return {
        refreshCategorySignals: true,
        refreshImportedSkills: true,
        refreshUserSkills: true,
      };
    }
    default: {
      return {
        refreshCategorySignals: true,
        refreshImportedSkills: true,
        refreshUserSkills: true,
      };
    }
  }
}
