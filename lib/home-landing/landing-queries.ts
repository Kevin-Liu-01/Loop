import { unstable_cache } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { getServerSupabase } from "@/lib/db/client";
import { listSkillAuthorsByIds } from "@/lib/db/skill-authors";
import { buildSkillVersionHref, buildVersionLabel } from "@/lib/format";
import type {
  LandingMcpRow,
  LandingSkillRow,
} from "@/lib/home-landing/landing-data";
import { buildSkillAutomationSummaries } from "@/lib/skill-automations";
import type {
  AutomationSummary,
  SkillAutomationState,
  SkillOrigin,
} from "@/lib/types";

export interface LandingData {
  skills: LandingSkillRow[];
  mcps: LandingMcpRow[];
  automations: AutomationSummary[];
}

interface LandingSkillDbRow {
  slug: string;
  title: string;
  description: string;
  category: string;
  version: number;
  updated_at: string;
  icon_url: string | null;
  owner_name: string | null;
  author_id: string | null;
  automation: unknown;
  origin: string;
}

function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === "string" && value.length > 0;
}

function toneFor(updatedAt: string): LandingSkillRow["tone"] {
  const ageHours = (Date.now() - new Date(updatedAt).getTime()) / 3_600_000;
  if (ageHours < 6) {
    return "fresh";
  }
  if (ageHours < 72) {
    return "stale";
  }
  return "idle";
}

function relativeTime(updatedAt: string): string {
  const minutes = Math.max(
    0,
    Math.round((Date.now() - new Date(updatedAt).getTime()) / 60_000)
  );
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

async function loadLandingData(): Promise<LandingData> {
  const db = getServerSupabase();
  const [
    { data: skillData, error: skillError },
    { data: mcpData, error: mcpError },
  ] = await Promise.all([
    db
      .from("skills")
      .select(
        "slug,title,description,category,version,updated_at,icon_url,owner_name,author_id,automation,origin"
      )
      .eq("visibility", "public")
      .order("updated_at", { ascending: false })
      .limit(40),
    db
      .from("imported_mcps")
      .select("id,name,description,transport,icon_url,homepage_url")
      .order("name")
      .limit(10),
  ]);

  if (skillError) {
    throw new Error(`fetchLandingData skills failed: ${skillError.message}`);
  }
  if (mcpError) {
    throw new Error(`fetchLandingData MCPs failed: ${mcpError.message}`);
  }

  const rows = (skillData ?? []) as LandingSkillDbRow[];
  const authors = await listSkillAuthorsByIds(
    rows.map((row) => row.author_id).filter(isNonEmptyString)
  );
  const authorById = new Map(authors.map((author) => [author.id, author]));
  const verifiedRows = rows
    .filter((row) => row.author_id && authorById.get(row.author_id)?.verified)
    .slice(0, 10);

  const skills: LandingSkillRow[] = verifiedRows.map((row) => ({
    automationEnabled: Boolean(
      (row.automation as SkillAutomationState | null)?.enabled
    ),
    category: row.category,
    description: row.description,
    href: buildSkillVersionHref(row.slug, row.version),
    iconUrl: row.icon_url ?? undefined,
    ownerName:
      row.owner_name ??
      (row.author_id
        ? authorById.get(row.author_id)?.displayName
        : undefined) ??
      "Loop",
    slug: row.slug,
    title: row.title,
    tone: toneFor(row.updated_at),
    updatedAt: relativeTime(row.updated_at),
    versionLabel: buildVersionLabel(row.version),
  }));

  const automations = verifiedRows.flatMap((row) =>
    buildSkillAutomationSummaries({
      automation: (row.automation ?? undefined) as
        | SkillAutomationState
        | undefined,
      automations: [],
      origin: row.origin as SkillOrigin,
      slug: row.slug,
      title: row.title,
    })
  );

  const mcps: LandingMcpRow[] = (mcpData ?? []).map((mcp) => ({
    description: mcp.description,
    homepageUrl: mcp.homepage_url ?? undefined,
    iconUrl: mcp.icon_url ?? undefined,
    id: mcp.id,
    name: mcp.name,
    transport: mcp.transport as LandingMcpRow["transport"],
  }));

  return { automations, mcps, skills };
}

const getCachedLandingData = unstable_cache(
  loadLandingData,
  ["public-landing-data-v1"],
  { revalidate: 300, tags: [CACHE_TAGS.publicLanding] }
);

export async function fetchLandingData(): Promise<LandingData> {
  return getCachedLandingData();
}
