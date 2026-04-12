import { lookupBrandLogoUrl } from "@/lib/skill-icons";

/**
 * Infer a BRAND_LOGOS key from a human-readable publisher/owner name.
 *
 * Strips common suffixes ("Skills", "MCP", "Directory", etc.)
 * then tries an exact lookup against the brand logo map.
 */
function inferBrandKey(name: string): string | null {
  const stripped = name
    .toLowerCase()
    .replace(
      /\s+(skills|mcp|servers?|tools?|directory|community|labs?)\s*$/i,
      ""
    )
    .replace(/^awesome\s+/i, "")
    .trim();

  if (lookupBrandLogoUrl(stripped)) {
    return stripped;
  }

  const joined = stripped.replaceAll(/[\s-]+/g, "");
  if (lookupBrandLogoUrl(joined)) {
    return joined;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Author / publisher icon resolution
// ---------------------------------------------------------------------------

export interface AuthorIconResult {
  src: string | null;
  isMonochrome: boolean;
}

/**
 * Resolve the best available icon URL for a skill's author/publisher.
 *
 * Priority:
 *  1. Explicit author logo (from a verified SkillAuthor record)
 *  2. Skill-level iconUrl (set during import from the source registry)
 *  3. Inferred from ownerName via the brand logo map
 *  4. null → caller renders a fallback (initial letter, etc.)
 */
export function resolveAuthorIcon(opts: {
  authorLogoUrl?: string;
  iconUrl?: string;
  ownerName?: string;
}): AuthorIconResult {
  if (opts.authorLogoUrl) {
    return {
      isMonochrome: isMonochromeUrl(opts.authorLogoUrl),
      src: opts.authorLogoUrl,
    };
  }
  if (opts.iconUrl) {
    return { isMonochrome: isMonochromeUrl(opts.iconUrl), src: opts.iconUrl };
  }
  if (opts.ownerName) {
    const key = inferBrandKey(opts.ownerName);
    if (key) {
      const url = lookupBrandLogoUrl(key)!;
      return { isMonochrome: isMonochromeUrl(url), src: url };
    }
  }
  return { isMonochrome: false, src: null };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Whether a logo URL points to a monochrome SVG that needs
 * `brightness-0 dark:invert` to stay visible in both themes.
 */
function isMonochromeUrl(url: string): boolean {
  return url.includes("simpleicons.org") || url.startsWith("/brands/");
}
