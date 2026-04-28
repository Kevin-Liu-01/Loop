import { clerkClient } from "@clerk/nextjs/server";

import type { SearchProviderId } from "@/lib/agent-tools/search-provider-meta";
import type { UserSearchKeys } from "@/lib/agent-tools/search-providers";

const METADATA_KEY = "searchApiKeys";

const VALID_PROVIDERS = new Set<SearchProviderId>([
  "brave",
  "firecrawl",
  "serper",
  "tavily",
  "jina",
]);

export async function getUserSearchKeys(
  clerkUserId: string
): Promise<UserSearchKeys | null> {
  const client = await clerkClient();
  const user = await client.users.getUser(clerkUserId);
  const raw = (user.privateMetadata as Record<string, unknown>)?.[METADATA_KEY];

  if (!raw || typeof raw !== "object") {
    return null;
  }

  const keys = raw as Record<string, unknown>;
  const provider = keys.provider as string | undefined;

  return {
    provider:
      provider && VALID_PROVIDERS.has(provider as SearchProviderId)
        ? (provider as SearchProviderId)
        : undefined,
    firecrawl: typeof keys.firecrawl === "string" ? keys.firecrawl : undefined,
    serper: typeof keys.serper === "string" ? keys.serper : undefined,
    tavily: typeof keys.tavily === "string" ? keys.tavily : undefined,
    jina: typeof keys.jina === "string" ? keys.jina : undefined,
  };
}

export async function setUserSearchKeys(
  clerkUserId: string,
  keys: UserSearchKeys
): Promise<void> {
  if (keys.provider && !VALID_PROVIDERS.has(keys.provider)) {
    throw new Error(`Invalid search provider: ${keys.provider}`);
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkUserId, {
    privateMetadata: {
      [METADATA_KEY]: keys,
    },
  });
}

/**
 * Mask an API key for display, showing only the last 4 characters.
 * Returns null if the key is empty/undefined.
 */
export function maskKey(key: string | undefined): string | null {
  if (!key || key.length < 5) {
    return null;
  }
  return `${"*".repeat(key.length - 4)}${key.slice(-4)}`;
}

/**
 * Build a masked view of the user's keys safe for client-side display.
 */
export function maskUserSearchKeys(keys: UserSearchKeys | null): {
  provider: SearchProviderId;
  firecrawl: string | null;
  serper: string | null;
  tavily: string | null;
  jina: string | null;
} {
  return {
    provider: keys?.provider ?? "brave",
    firecrawl: maskKey(keys?.firecrawl),
    serper: maskKey(keys?.serper),
    tavily: maskKey(keys?.tavily),
    jina: maskKey(keys?.jina),
  };
}
