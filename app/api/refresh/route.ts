import { authErrorResponse, requireAdmin } from "@/lib/auth";
import {
  invalidateBriefs,
  invalidatePublicCatalogue,
} from "@/lib/cache-invalidation";
import { refreshLoopSnapshot } from "@/lib/refresh";
import {
  buildRefreshExecutionPlan,
  parseRefreshScope,
} from "@/lib/refresh-scope";
import { hasValidBearerToken } from "@/lib/request-auth";
import { withApiUsage } from "@/lib/usage-server";

export const maxDuration = 300;

async function handleRefresh(request: Request) {
  const cronAuthorized = hasValidBearerToken(
    request.headers.get("authorization"),
    process.env.CRON_SECRET
  );
  if (!cronAuthorized) {
    try {
      await requireAdmin();
    } catch (error) {
      return (
        authErrorResponse(error) ??
        Response.json({ error: "Unauthorized" }, { status: 401 })
      );
    }
  }

  const scope = parseRefreshScope(request.url);
  if (!scope) {
    return Response.json(
      { error: "scope must be all, daily, skills-only, or signals-only" },
      { status: 400 }
    );
  }
  const plan = buildRefreshExecutionPlan(scope);
  const result = await refreshLoopSnapshot(plan);

  invalidatePublicCatalogue();
  if (plan.refreshCategorySignals) {
    invalidateBriefs();
  }

  return Response.json({
    categories: result.categoryCount,
    dispatchedSkillRefreshes: result.dispatchedSkillCount,
    generatedAt: new Date().toISOString(),
    ok: true,
    scope,
    skills: result.skillCount,
  });
}

export async function GET(request: Request) {
  return withApiUsage(
    {
      label: "Full refresh",
      method: "GET",
      route: "/api/refresh",
    },
    async () => handleRefresh(request)
  );
}

export async function POST(request: Request) {
  return withApiUsage(
    {
      label: "Full refresh",
      method: "POST",
      route: "/api/refresh",
    },
    async () => handleRefresh(request)
  );
}
