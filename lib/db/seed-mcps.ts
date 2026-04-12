/**
 * Seed high-signal MCP servers into the imported_mcps table.
 *
 * Skips any MCP that already exists (matched by name).
 *
 * Usage:
 *   source <(sed 's/^/export /' .env.local) && npx tsx lib/db/seed-mcps.ts
 */

import { getServerSupabase } from "@/lib/db/client";
import { SEED_MCP_DEFINITIONS } from "@/lib/db/seed-data/mcp-definitions";
import type { SeedMcp } from "@/lib/db/seed-data/mcp-definitions";
import { buildVersionLabel } from "@/lib/format";

function seedToRow(seed: SeedMcp): Record<string, unknown> {
  const now = new Date().toISOString();
  return {
    args: seed.args,
    command: seed.command ?? null,
    created_at: now,
    description: seed.description,
    env_keys: seed.envKeys,
    headers: seed.headers ?? null,
    homepage_url: seed.homepageUrl ?? null,
    manifest_url: seed.manifestUrl,
    name: seed.name,
    raw: "",
    tags: seed.tags,
    transport: seed.transport,
    updated_at: now,
    url: seed.url ?? null,
    version: 1,
    version_label: buildVersionLabel(1),
  };
}

async function getExistingNames(): Promise<Set<string>> {
  const db = getServerSupabase();
  const { data, error } = await db.from("imported_mcps").select("name");

  if (error) {
    throw new Error(`Failed to list existing MCPs: ${error.message}`);
  }
  return new Set((data ?? []).map((row: { name: string }) => row.name));
}

async function insertMcp(row: Record<string, unknown>): Promise<void> {
  const db = getServerSupabase();
  const { error } = await db.from("imported_mcps").insert(row as never);
  if (error) {
    throw new Error(error.message);
  }
}

async function seedMcps(): Promise<{
  inserted: number;
  skipped: number;
  errors: number;
}> {
  const existing = await getExistingNames();
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const seed of SEED_MCP_DEFINITIONS) {
    if (existing.has(seed.name)) {
      console.log(`  [skip] ${seed.name} (already exists)`);
      skipped++;
      continue;
    }

    try {
      const row = seedToRow(seed);
      await insertMcp(row);
      console.log(`  [ok]   ${seed.name}`);
      inserted++;
    } catch (error) {
      console.error(`  [err]  ${seed.name}: ${(error as Error).message}`);
      errors++;
    }
  }

  return { errors, inserted, skipped };
}

async function main(): Promise<void> {
  console.log("=== MCP Seeder ===\n");
  console.log(`[1/2] Seeding ${SEED_MCP_DEFINITIONS.length} MCP servers...\n`);

  const result = await seedMcps();

  console.log("\n[2/2] Summary");
  console.log(`  Inserted: ${result.inserted}`);
  console.log(`  Skipped:  ${result.skipped}`);
  console.log(`  Errors:   ${result.errors}`);
  console.log(`  Total:    ${SEED_MCP_DEFINITIONS.length}`);
  console.log("\n=== Done ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
