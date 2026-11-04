import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/database-types";

let serverClient: SupabaseClient<Database> | null = null;
let anonClient: SupabaseClient<Database> | null = null;

// undici waits up to 300 s for response headers by default. While Supabase was stalling (its
// Cloudflare edge returned 522s), page renders ran into the 300 s function timeout and billed a
// 2 GB instance for five minutes each. Normal queries finish in well under a second.
export const SUPABASE_REQUEST_TIMEOUT_MS = 20_000;

export function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const timeout = AbortSignal.timeout(SUPABASE_REQUEST_TIMEOUT_MS);
  return fetch(input, {
    ...init,
    signal: init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout,
  });
}

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getServerSupabase(): SupabaseClient<Database> {
  if (serverClient) {
    return serverClient;
  }

  serverClient = createClient<Database>(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { fetch: fetchWithTimeout },
    }
  );

  return serverClient;
}

export function getAnonSupabase(): SupabaseClient<Database> {
  if (anonClient) {
    return anonClient;
  }

  anonClient = createClient<Database>(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );

  return anonClient;
}
