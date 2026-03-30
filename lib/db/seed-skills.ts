/**
 * Seed 40 skills into Supabase with body content and agent docs.
 *
 * Depends on categories already being seeded (run migrate first, or
 * this script seeds them automatically).
 *
 * Usage: npx tsx lib/db/seed-skills.ts
 */

import { seedCategories } from "@/lib/db/categories";
import { createSkill, getSkillBySlug } from "@/lib/db/skills";
import { CATEGORY_REGISTRY } from "@/lib/registry";
import {
  SEED_SKILL_DEFINITIONS,
  toCreateSkillInput
} from "@/lib/db/seed-data/skill-definitions";

async function ensureCategoriesExist(): Promise<void> {
  console.log("[1/3] Ensuring categories are seeded...");
  await seedCategories(CATEGORY_REGISTRY);
  console.log(`  ${CATEGORY_REGISTRY.length} categories ready`);
}

async function seedSkills(): Promise<{ inserted: number; skipped: number; errors: number }> {
  console.log(`\n[2/3] Seeding ${SEED_SKILL_DEFINITIONS.length} skills...`);

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const def of SEED_SKILL_DEFINITIONS) {
    try {
      const existing = await getSkillBySlug(def.slug);
      if (existing) {
        console.log(`  [skip] ${def.slug} already exists`);
        skipped++;
        continue;
      }

      const input = toCreateSkillInput(def);
      await createSkill(input);
      console.log(`  [ok]   ${def.slug}`);
      inserted++;
    } catch (error) {
      console.error(`  [err]  ${def.slug}: ${(error as Error).message}`);
      errors++;
    }
  }

  return { inserted, skipped, errors };
}

function printSummary(result: { inserted: number; skipped: number; errors: number }): void {
  console.log("\n[3/3] Summary");
  console.log(`  Inserted: ${result.inserted}`);
  console.log(`  Skipped:  ${result.skipped}`);
  console.log(`  Errors:   ${result.errors}`);
  console.log(`  Total:    ${SEED_SKILL_DEFINITIONS.length}`);
}

async function main(): Promise<void> {
  console.log("=== Skill Seeder ===\n");

  await ensureCategoriesExist();
  const result = await seedSkills();
  printSummary(result);

  console.log("\n=== Done ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
