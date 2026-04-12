/**
 * One-shot migration script: seeds categories from CATEGORY_REGISTRY,
 * reads existing JSON data files, scans filesystem SKILL.md files,
 * and inserts everything into Supabase.
 *
 * Run via: npx tsx lib/db/migrate.ts
 */

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { seedCategories } from "@/lib/db/categories";
import { getServerSupabase } from "@/lib/db/client";
import { upsertMcp, createMcpVersion } from "@/lib/db/mcps";
import { createSkillVersion } from "@/lib/db/skill-versions";
import { upsertSkillFromFilesystem, createSkill } from "@/lib/db/skills";
import {
  recordLoopRun,
  recordRefreshRun,
  recordUsageEvent,
  recordBillingEvent,
  upsertSubscription,
} from "@/lib/db/system-state";
import { CATEGORY_REGISTRY } from "@/lib/registry";
import type {
  BillingEventRecord,
  LoopRunRecord,
  RefreshRunRecord,
  StripeSubscriptionRecord,
  UsageEventRecord,
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

  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

async function migrateCategories(): Promise<void> {
  console.log("\n[1/6] Seeding categories...");
  await seedCategories(CATEGORY_REGISTRY);
  console.log(`  Seeded ${CATEGORY_REGISTRY.length} categories`);
}

async function migrateUserSkills(): Promise<void> {
  console.log("\n[2/6] Migrating user skills...");
  const store = await readJsonFile<{ skills: Record<string, unknown>[] }>(
    USER_SKILLS_FILE
  );
  if (!store?.skills?.length) {
    console.log("  No user skills to migrate");
    return;
  }

  let count = 0;
  for (const skill of store.skills) {
    try {
      const record = await createSkill({
        automation: skill.automation as unknown,
        body: String(skill.body ?? ""),
        category: String(skill.category),
        description: String(skill.description ?? ""),
        origin: "user",
        ownerName: skill.ownerName ? String(skill.ownerName) : undefined,
        slug: String(skill.slug),
        sources: (skill.sources ?? []) as unknown[],
        tags: Array.isArray(skill.tags) ? skill.tags.map(String) : [],
        title: String(skill.title),
        updates: (skill.updates ?? []) as unknown[],
        version: Number(skill.version ?? 1),
        visibility: (skill.visibility as "public" | "member") ?? "public",
      } as Parameters<typeof createSkill>[0]);

      const versions = Array.isArray(skill.versions) ? skill.versions : [];
      for (const v of versions) {
        const vObj = v as Record<string, unknown>;
        await createSkillVersion({
          automation: vObj.automation as unknown,
          body: String(vObj.body ?? ""),
          category: String(vObj.category ?? skill.category),
          description: String(vObj.description ?? ""),
          ownerName: vObj.ownerName ? String(vObj.ownerName) : undefined,
          skillId: record.slug,
          sources: (vObj.sources ?? []) as unknown[],
          tags: Array.isArray(vObj.tags) ? vObj.tags.map(String) : [],
          title: String(vObj.title ?? skill.title),
          updates: (vObj.updates ?? []) as unknown[],
          version: Number(vObj.version ?? 1),
          visibility: (vObj.visibility as "public" | "member") ?? "public",
        } as Parameters<typeof createSkillVersion>[0]);
      }

      count++;
    } catch (error) {
      console.warn(
        `  [warn] Skipping user skill "${skill.slug}": ${(error as Error).message}`
      );
    }
  }

  console.log(`  Migrated ${count}/${store.skills.length} user skills`);
}

async function migrateImports(): Promise<void> {
  console.log("\n[3/6] Migrating imported skills and MCPs...");
  const store = await readJsonFile<{
    skills: Record<string, unknown>[];
    mcps: Record<string, unknown>[];
  }>(IMPORTS_FILE);

  if (!store) {
    console.log("  No imports file found");
    return;
  }

  let skillCount = 0;
  for (const skill of store.skills ?? []) {
    try {
      await createSkill({
        body: String(skill.body ?? ""),
        canonicalUrl: skill.canonicalUrl
          ? String(skill.canonicalUrl)
          : undefined,
        category: String(skill.category),
        description: String(skill.description ?? ""),
        origin: "remote",
        ownerName: skill.ownerName ? String(skill.ownerName) : undefined,
        slug: String(skill.slug),
        sourceUrl: skill.sourceUrl ? String(skill.sourceUrl) : undefined,
        syncEnabled: Boolean(skill.syncEnabled ?? true),
        tags: Array.isArray(skill.tags) ? skill.tags.map(String) : [],
        title: String(skill.title),
        version: Number(skill.version ?? 1),
        visibility: (skill.visibility as "public" | "member") ?? "public",
      } as Parameters<typeof createSkill>[0]);
      skillCount++;
    } catch (error) {
      console.warn(
        `  [warn] Skipping imported skill "${skill.slug}": ${(error as Error).message}`
      );
    }
  }

  let mcpCount = 0;
  for (const mcp of store.mcps ?? []) {
    try {
      const doc = {
        args: Array.isArray(mcp.args) ? mcp.args.map(String) : [],
        command: mcp.command ? String(mcp.command) : undefined,
        createdAt: String(mcp.createdAt ?? new Date().toISOString()),
        description: String(mcp.description ?? ""),
        envKeys: Array.isArray(mcp.envKeys) ? mcp.envKeys.map(String) : [],
        headers: mcp.headers as Record<string, string> | undefined,
        homepageUrl: mcp.homepageUrl ? String(mcp.homepageUrl) : undefined,
        id: String(mcp.id),
        manifestUrl: String(mcp.manifestUrl),
        name: String(mcp.name),
        raw: String(mcp.raw ?? ""),
        tags: Array.isArray(mcp.tags) ? mcp.tags.map(String) : [],
        transport: String(mcp.transport ?? "unknown") as
          | "stdio"
          | "http"
          | "sse"
          | "ws"
          | "unknown",
        updatedAt: String(mcp.updatedAt ?? new Date().toISOString()),
        url: mcp.url ? String(mcp.url) : undefined,
        version: Number(mcp.version ?? 1),
        versionLabel: String(mcp.versionLabel ?? "v1"),
        versions: [],
      };

      await upsertMcp(doc);

      const versions = Array.isArray(mcp.versions) ? mcp.versions : [];
      for (const v of versions) {
        const vObj = v as Record<string, unknown>;
        await createMcpVersion(doc.id, {
          args: Array.isArray(vObj.args) ? vObj.args.map(String) : [],
          command: vObj.command ? String(vObj.command) : undefined,
          description: String(vObj.description ?? ""),
          envKeys: Array.isArray(vObj.envKeys) ? vObj.envKeys.map(String) : [],
          headers: vObj.headers as Record<string, string> | undefined,
          homepageUrl: vObj.homepageUrl ? String(vObj.homepageUrl) : undefined,
          manifestUrl: String(vObj.manifestUrl ?? doc.manifestUrl),
          raw: String(vObj.raw ?? ""),
          tags: Array.isArray(vObj.tags) ? vObj.tags.map(String) : [],
          transport: String(vObj.transport ?? "unknown") as
            | "stdio"
            | "http"
            | "sse"
            | "ws"
            | "unknown",
          updatedAt: String(vObj.updatedAt ?? new Date().toISOString()),
          url: vObj.url ? String(vObj.url) : undefined,
          version: Number(vObj.version ?? 1),
        });
      }

      mcpCount++;
    } catch (error) {
      console.warn(
        `  [warn] Skipping MCP "${mcp.name}": ${(error as Error).message}`
      );
    }
  }

  console.log(`  Migrated ${skillCount} imported skills, ${mcpCount} MCPs`);
}

async function migrateFilesystemSkills(): Promise<void> {
  console.log("\n[4/6] Syncing filesystem skills...");
  const { findSkillFiles, parseSkill } = await import("@/lib/content");

  const [repoFiles, codexFiles] = await Promise.all([
    findSkillFiles(WORKSPACE_ROOT),
    findSkillFiles(CODEX_SKILLS_ROOT),
  ]);

  const allFiles = [...repoFiles, ...codexFiles];
  let count = 0;

  for (const skillFile of allFiles) {
    try {
      const parsed = await parseSkill(skillFile);
      await upsertSkillFromFilesystem({
        accent: parsed.accent,
        agentDocs: parsed.agentDocs,
        agents: parsed.agents,
        body: parsed.body,
        category: parsed.category,
        description: parsed.description,
        featured: parsed.featured,
        headings: parsed.headings,
        origin: parsed.origin as "repo" | "codex",
        path: parsed.path,
        references: parsed.references,
        relativeDir: parsed.relativeDir,
        slug: parsed.slug,
        tags: parsed.tags,
        title: parsed.title,
        version: 1,
        visibility: parsed.visibility,
      });
      count++;
    } catch (error) {
      console.warn(
        `  [warn] Skipping ${skillFile}: ${(error as Error).message}`
      );
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

  const counts = {
    billingEvents: 0,
    loopRuns: 0,
    refreshRuns: 0,
    subscriptions: 0,
    usageEvents: 0,
  };

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
    "subscriptions",
  ] as const;

  for (const table of tables) {
    const { count, error } = await db
      .from(table)
      .select("*", { count: "exact", head: true });
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
