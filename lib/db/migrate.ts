/**
 * One-shot migration script: seeds categories from CATEGORY_REGISTRY,
 * reads existing JSON data files, scans filesystem SKILL.md files,
 * and inserts everything into Supabase.
 *
 * Run via: npx tsx lib/db/migrate.ts
 */

import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

import { getServerSupabase } from "@/lib/db/client";
import { seedCategories } from "@/lib/db/categories";
import { upsertSkillFromFilesystem, createSkill } from "@/lib/db/skills";
import { createSkillVersion } from "@/lib/db/skill-versions";
import { upsertMcp, createMcpVersion } from "@/lib/db/mcps";
import {
  recordLoopRun,
  recordRefreshRun,
  recordUsageEvent,
  recordBillingEvent,
  upsertSubscription
} from "@/lib/db/system-state";
import { CATEGORY_REGISTRY } from "@/lib/registry";
import type {
  BillingEventRecord,
  LoopRunRecord,
  RefreshRunRecord,
  StripeSubscriptionRecord,
  UsageEventRecord
} from "@/lib/types";

const WORKSPACE_ROOT = process.cwd();
const CONTENT_DIR = path.join(WORKSPACE_ROOT, "content", "generated");
const CODEX_SKILLS_ROOT = path.join(os.homedir(), ".codex", "skills");

const USER_SKILLS_FILE = path.join(CONTENT_DIR, "loop-user-skills.local.json");
const IMPORTS_FILE = path.join(CONTENT_DIR, "loop-imports.local.json");
const SYSTEM_STATE_FILE = path.join(CONTENT_DIR, "loop-system.local.json");

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  if (!(await fileExists(filePath))) {
    console.log(`  [skip] ${path.basename(filePath)} not found`);
    return null;
  }

  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function migrateCategories(): Promise<void> {
  console.log("\n[1/6] Seeding categories...");
  await seedCategories(CATEGORY_REGISTRY);
  console.log(`  Seeded ${CATEGORY_REGISTRY.length} categories`);
}

async function migrateUserSkills(): Promise<void> {
  console.log("\n[2/6] Migrating user skills...");
  const store = await readJsonFile<{ skills: Array<Record<string, unknown>> }>(USER_SKILLS_FILE);
  if (!store?.skills?.length) {
    console.log("  No user skills to migrate");
    return;
  }

  let count = 0;
  for (const skill of store.skills) {
    try {
      const record = await createSkill({
        slug: String(skill.slug),
        title: String(skill.title),
        description: String(skill.description ?? ""),
        category: String(skill.category),
        body: String(skill.body ?? ""),
        visibility: (skill.visibility as "public" | "member") ?? "public",
        origin: "user",
        tags: Array.isArray(skill.tags) ? skill.tags.map(String) : [],
        ownerName: skill.ownerName ? String(skill.ownerName) : undefined,
        sources: (skill.sources ?? []) as unknown[],
        automation: skill.automation as unknown,
        updates: (skill.updates ?? []) as unknown[],
        version: Number(skill.version ?? 1)
      } as Parameters<typeof createSkill>[0]);

      const versions = Array.isArray(skill.versions) ? skill.versions : [];
      for (const v of versions) {
        const vObj = v as Record<string, unknown>;
        await createSkillVersion({
          skillId: record.slug,
          version: Number(vObj.version ?? 1),
          title: String(vObj.title ?? skill.title),
          description: String(vObj.description ?? ""),
          category: String(vObj.category ?? skill.category),
          body: String(vObj.body ?? ""),
          tags: Array.isArray(vObj.tags) ? vObj.tags.map(String) : [],
          ownerName: vObj.ownerName ? String(vObj.ownerName) : undefined,
          visibility: (vObj.visibility as "public" | "member") ?? "public",
          sources: (vObj.sources ?? []) as unknown[],
          automation: vObj.automation as unknown,
          updates: (vObj.updates ?? []) as unknown[]
        } as Parameters<typeof createSkillVersion>[0]);
      }

      count++;
    } catch (error) {
      console.warn(`  [warn] Skipping user skill "${skill.slug}": ${(error as Error).message}`);
    }
  }

  console.log(`  Migrated ${count}/${store.skills.length} user skills`);
}

async function migrateImports(): Promise<void> {
  console.log("\n[3/6] Migrating imported skills and MCPs...");
  const store = await readJsonFile<{
    skills: Array<Record<string, unknown>>;
    mcps: Array<Record<string, unknown>>;
  }>(IMPORTS_FILE);

  if (!store) {
    console.log("  No imports file found");
    return;
  }

  let skillCount = 0;
  for (const skill of store.skills ?? []) {
    try {
      await createSkill({
        slug: String(skill.slug),
        title: String(skill.title),
        description: String(skill.description ?? ""),
        category: String(skill.category),
        body: String(skill.body ?? ""),
        visibility: (skill.visibility as "public" | "member") ?? "public",
        origin: "remote",
        tags: Array.isArray(skill.tags) ? skill.tags.map(String) : [],
        ownerName: skill.ownerName ? String(skill.ownerName) : undefined,
        sourceUrl: skill.sourceUrl ? String(skill.sourceUrl) : undefined,
        canonicalUrl: skill.canonicalUrl ? String(skill.canonicalUrl) : undefined,
        syncEnabled: Boolean(skill.syncEnabled ?? true),
        version: Number(skill.version ?? 1)
      } as Parameters<typeof createSkill>[0]);
      skillCount++;
    } catch (error) {
      console.warn(`  [warn] Skipping imported skill "${skill.slug}": ${(error as Error).message}`);
    }
  }

  let mcpCount = 0;
  for (const mcp of store.mcps ?? []) {
    try {
      const doc = {
        id: String(mcp.id),
        name: String(mcp.name),
        description: String(mcp.description ?? ""),
        manifestUrl: String(mcp.manifestUrl),
        homepageUrl: mcp.homepageUrl ? String(mcp.homepageUrl) : undefined,
        transport: String(mcp.transport ?? "unknown") as "stdio" | "http" | "sse" | "ws" | "unknown",
        url: mcp.url ? String(mcp.url) : undefined,
        command: mcp.command ? String(mcp.command) : undefined,
        args: Array.isArray(mcp.args) ? mcp.args.map(String) : [],
        envKeys: Array.isArray(mcp.envKeys) ? mcp.envKeys.map(String) : [],
        headers: mcp.headers as Record<string, string> | undefined,
        tags: Array.isArray(mcp.tags) ? mcp.tags.map(String) : [],
        raw: String(mcp.raw ?? ""),
        createdAt: String(mcp.createdAt ?? new Date().toISOString()),
        updatedAt: String(mcp.updatedAt ?? new Date().toISOString()),
        version: Number(mcp.version ?? 1),
        versionLabel: String(mcp.versionLabel ?? "v1"),
        versions: []
      };

      await upsertMcp(doc);

      const versions = Array.isArray(mcp.versions) ? mcp.versions : [];
      for (const v of versions) {
        const vObj = v as Record<string, unknown>;
        await createMcpVersion(doc.id, {
          version: Number(vObj.version ?? 1),
          updatedAt: String(vObj.updatedAt ?? new Date().toISOString()),
          description: String(vObj.description ?? ""),
          manifestUrl: String(vObj.manifestUrl ?? doc.manifestUrl),
          homepageUrl: vObj.homepageUrl ? String(vObj.homepageUrl) : undefined,
          transport: String(vObj.transport ?? "unknown") as "stdio" | "http" | "sse" | "ws" | "unknown",
          url: vObj.url ? String(vObj.url) : undefined,
          command: vObj.command ? String(vObj.command) : undefined,
          args: Array.isArray(vObj.args) ? vObj.args.map(String) : [],
          envKeys: Array.isArray(vObj.envKeys) ? vObj.envKeys.map(String) : [],
          headers: vObj.headers as Record<string, string> | undefined,
          tags: Array.isArray(vObj.tags) ? vObj.tags.map(String) : [],
          raw: String(vObj.raw ?? "")
        });
      }

      mcpCount++;
    } catch (error) {
      console.warn(`  [warn] Skipping MCP "${mcp.name}": ${(error as Error).message}`);
    }
  }

  console.log(`  Migrated ${skillCount} imported skills, ${mcpCount} MCPs`);
}

async function migrateFilesystemSkills(): Promise<void> {
  console.log("\n[4/6] Syncing filesystem skills...");
  const { findSkillFiles, parseSkill } = await import("@/lib/content");

  const [repoFiles, codexFiles] = await Promise.all([
    findSkillFiles(WORKSPACE_ROOT),
    findSkillFiles(CODEX_SKILLS_ROOT)
  ]);

  const allFiles = [...repoFiles, ...codexFiles];
  let count = 0;

  for (const skillFile of allFiles) {
    try {
      const parsed = await parseSkill(skillFile);
      await upsertSkillFromFilesystem({
        slug: parsed.slug,
        title: parsed.title,
        description: parsed.description,
        category: parsed.category,
        body: parsed.body,
        accent: parsed.accent,
        featured: parsed.featured,
        visibility: parsed.visibility,
        origin: parsed.origin as "repo" | "codex",
        path: parsed.path,
        relativeDir: parsed.relativeDir,
        tags: parsed.tags,
        headings: parsed.headings,
        references: parsed.references,
        agents: parsed.agents,
        agentDocs: parsed.agentDocs,
        version: 1
      });
      count++;
    } catch (error) {
      console.warn(`  [warn] Skipping ${skillFile}: ${(error as Error).message}`);
    }
  }

  console.log(`  Synced ${count}/${allFiles.length} filesystem skills`);
}

async function migrateSystemState(): Promise<void> {
  console.log("\n[5/6] Migrating system state...");
  const store = await readJsonFile<{
    loopRuns?: LoopRunRecord[];
    refreshRuns?: RefreshRunRecord[];
    usageEvents?: UsageEventRecord[];
    billingEvents?: BillingEventRecord[];
    subscriptions?: StripeSubscriptionRecord[];
  }>(SYSTEM_STATE_FILE);

  if (!store) {
    console.log("  No system state file found");
    return;
  }

  const counts = { loopRuns: 0, refreshRuns: 0, usageEvents: 0, billingEvents: 0, subscriptions: 0 };

  for (const run of store.loopRuns ?? []) {
    try {
      await recordLoopRun(run);
      counts.loopRuns++;
    } catch {
      /* skip duplicates */
    }
  }

  for (const run of store.refreshRuns ?? []) {
    try {
      await recordRefreshRun(run);
      counts.refreshRuns++;
    } catch {
      /* skip duplicates */
    }
  }

  for (const event of store.usageEvents ?? []) {
    try {
      await recordUsageEvent(event);
      counts.usageEvents++;
    } catch {
      /* skip duplicates */
    }
  }

  for (const event of store.billingEvents ?? []) {
    try {
      await recordBillingEvent(event);
      counts.billingEvents++;
    } catch {
      /* skip duplicates */
    }
  }

  for (const sub of store.subscriptions ?? []) {
    try {
      await upsertSubscription(sub);
      counts.subscriptions++;
    } catch {
      /* skip duplicates */
    }
  }

  console.log(`  Loop runs: ${counts.loopRuns}`);
  console.log(`  Refresh runs: ${counts.refreshRuns}`);
  console.log(`  Usage events: ${counts.usageEvents}`);
  console.log(`  Billing events: ${counts.billingEvents}`);
  console.log(`  Subscriptions: ${counts.subscriptions}`);
}

async function validateCounts(): Promise<void> {
  console.log("\n[6/6] Validating migration...");
  const db = getServerSupabase();

  const tables = [
    "categories",
    "skills",
    "skill_versions",
    "imported_mcps",
    "imported_mcp_versions",
    "daily_briefs",
    "loop_runs",
    "refresh_runs",
    "usage_events",
    "billing_events",
    "subscriptions"
  ] as const;

  for (const table of tables) {
    const { count, error } = await db.from(table).select("*", { count: "exact", head: true });
    if (error) {
      console.warn(`  [warn] Could not count ${table}: ${error.message}`);
    } else {
      console.log(`  ${table}: ${count ?? 0} rows`);
    }
  }
}

export async function runMigration(): Promise<void> {
  console.log("=== Loop Supabase Migration ===");
  console.log(`Workspace: ${WORKSPACE_ROOT}`);
  console.log(`Codex skills: ${CODEX_SKILLS_ROOT}`);

  await migrateCategories();
  await migrateUserSkills();
  await migrateImports();
  await migrateFilesystemSkills();
  await migrateSystemState();
  await validateCounts();

  console.log("\n=== Migration complete ===");
}

if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}
