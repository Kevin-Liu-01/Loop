import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/database-types";

let serverClient: SupabaseClient<Database> | null = null;
let anonClient: SupabaseClient<Database> | null = null;

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
