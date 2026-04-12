import { getServerSupabase } from "@/lib/db/client";
import type { CategoryDefinition, SourceDefinition } from "@/lib/types";

interface CategoryRow {
  slug: string;
  title: string;
  strapline: string;
  description: string;
  hero: string;
  accent: string;
  status: string;
  keywords: string[];
  sources: unknown;
  created_at: string;
  updated_at: string;
}

function rowToCategory(row: CategoryRow): CategoryDefinition {
  return {
    accent: row.accent,
    description: row.description,
    hero: row.hero,
    keywords: row.keywords,
    slug: row.slug as CategoryDefinition["slug"],
    sources: (row.sources ?? []) as SourceDefinition[],
    status: row.status as CategoryDefinition["status"],
    strapline: row.strapline,
    title: row.title,
  };
}

function categoryToRow(
  category: CategoryDefinition
): Omit<CategoryRow, "created_at" | "updated_at"> {
  return {
    accent: category.accent,
    description: category.description,
    hero: category.hero,
    keywords: category.keywords,
    slug: category.slug,
    sources: category.sources as unknown,
    status: category.status,
    strapline: category.strapline,
    title: category.title,
  };
}

export async function listCategories(): Promise<CategoryDefinition[]> {
  const db = getServerSupabase();
  const { data, error } = await db
    .from("categories")
    .select("*")
    .order("title");

  if (error) {
    throw new Error(`listCategories failed: ${error.message}`);
  }
  return (data as CategoryRow[]).map(rowToCategory);
}

export async function getCategoryBySlug(
  slug: string
): Promise<CategoryDefinition | null> {
  const db = getServerSupabase();
  const { data, error } = await db
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`getCategoryBySlug failed: ${error.message}`);
  }
  return data ? rowToCategory(data as CategoryRow) : null;
}

export async function upsertCategory(
  category: CategoryDefinition
): Promise<void> {
  const db = getServerSupabase();
  const { error } = await db
    .from("categories")
    .upsert(categoryToRow(category) as never, { onConflict: "slug" });

  if (error) {
    throw new Error(`upsertCategory failed: ${error.message}`);
  }
}

export async function seedCategories(
  categories: CategoryDefinition[]
): Promise<void> {
  const db = getServerSupabase();
  const rows = categories.map(categoryToRow);
  const { error } = await db
    .from("categories")
    .upsert(rows as never, { onConflict: "slug" });

  if (error) {
    throw new Error(`seedCategories failed: ${error.message}`);
  }
}
