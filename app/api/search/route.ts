import { CATEGORY_REGISTRY } from "@/lib/registry";
import { search } from "@/lib/search";
import type { CategorySlug, SearchDocumentKind } from "@/lib/types";
import { logUsageEvent, withApiUsage } from "@/lib/usage-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  return withApiUsage(
    {
      details: query ? `q=${query.slice(0, 80)}` : "latest",
      label: "Catalog search",
      method: "GET",
      route: "/api/search",
    },
    async () => {
      const categoryValue = searchParams.get("category") || undefined;
      const category = CATEGORY_REGISTRY.some(
        (entry) => entry.slug === categoryValue
      )
        ? (categoryValue as CategorySlug)
        : undefined;
      const kind =
        (searchParams.get("kind") as SearchDocumentKind | null) ?? undefined;
      const limitParam = Number(searchParams.get("limit") ?? "12");
      const limit = Number.isFinite(limitParam)
        ? Math.max(1, Math.min(200, limitParam))
        : 12;

      const hits = await search(query, { category, kind, limit });

      if (query.trim()) {
        await logUsageEvent({
          categorySlug: category,
          details: query.trim().slice(0, 120),
          kind: "search",
          label: "Searched catalog",
          source: "api",
        });
      }

      return Response.json({
        count: hits.length,
        generatedAt: new Date().toISOString(),
        hits,
        ok: true,
      });
    }
  );
}
