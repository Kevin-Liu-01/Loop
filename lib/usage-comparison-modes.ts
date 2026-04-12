export const USAGE_COMPARISON_MODES = [
  "yesterday_same_time",
  "prior_24h",
  "prior_12h",
] as const;

export type UsageComparisonMode = (typeof USAGE_COMPARISON_MODES)[number];

export function isUsageComparisonMode(
  value: string
): value is UsageComparisonMode {
  return (USAGE_COMPARISON_MODES as readonly string[]).includes(value);
}

export const USAGE_COMPARISON_LABELS: Record<UsageComparisonMode, string> = {
  prior_12h: "Prior 12h (in 24h window)",
  prior_24h: "Prior 24h",
  yesterday_same_time: "Same time yesterday",
};
