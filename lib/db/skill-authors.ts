import { getServerSupabase } from "@/lib/db/client";
import type { SkillAuthorRecord } from "@/lib/types";

interface SkillAuthorRow {
  id: string;
  slug: string;
  display_name: string;
  bio: string;
  logo_url: string | null;
  website_url: string | null;
  primary_email: string | null;
  clerk_user_id: string | null;
  verified: boolean;
  is_official: boolean;
  badge_label: string;
}

function rowToSkillAuthor(row: SkillAuthorRow): SkillAuthorRecord {
  return {
    badgeLabel: row.badge_label,
    bio: row.bio,
    clerkUserId: row.clerk_user_id ?? undefined,
    displayName: row.display_name,
    id: row.id,
    isOfficial: row.is_official,
    logoUrl: row.logo_url ?? undefined,
    primaryEmail: row.primary_email ?? undefined,
    slug: row.slug,
    verified: row.verified,
    websiteUrl: row.website_url ?? undefined,
  };
}

export async function listSkillAuthorsByIds(
  ids: string[]
): Promise<SkillAuthorRecord[]> {
  if (ids.length === 0) {
    return [];
  }

  const db = getServerSupabase();
  const { data, error } = await db
    .from("skill_authors")
    .select("*")
    .in("id", ids);

  if (error) {
    throw new Error(`listSkillAuthorsByIds failed: ${error.message}`);
  }

  return (data ?? []).map((row) => rowToSkillAuthor(row as SkillAuthorRow));
}

export async function getSkillAuthorBySlug(
  slug: string
): Promise<SkillAuthorRecord | null> {
  const db = getServerSupabase();
  const { data, error } = await db
    .from("skill_authors")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`getSkillAuthorBySlug failed: ${error.message}`);
  }

  return data ? rowToSkillAuthor(data as SkillAuthorRow) : null;
}

export async function findSkillAuthorForSession(session: {
  userId: string;
  email: string;
}): Promise<SkillAuthorRecord | null> {
  const db = getServerSupabase();
  const normalizedEmail = session.email.trim().toLowerCase();

  const query = db
    .from("skill_authors")
    .select("*")
    .eq("clerk_user_id", session.userId)
    .maybeSingle();

  const { data, error } = await query;
  if (error) {
    throw new Error(`findSkillAuthorForSession failed: ${error.message}`);
  }

  if (data) {
    return rowToSkillAuthor(data as SkillAuthorRow);
  }

  if (!normalizedEmail) {
    return null;
  }

  const emailMatches = await db
    .from("skill_authors")
    .select("*")
    .ilike("primary_email", normalizedEmail)
    .maybeSingle();

  if (emailMatches.error) {
    throw new Error(
      `findSkillAuthorForSession failed: ${emailMatches.error.message}`
    );
  }

  return emailMatches.data
    ? rowToSkillAuthor(emailMatches.data as SkillAuthorRow)
    : null;
}
