import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { getSkillCatalogue } from "@/lib/content";
import { refreshLoopSnapshot } from "@/lib/refresh";
import { withApiUsage } from "@/lib/usage-server";

export const maxDuration = 300;

async function isAuthorized(request: Request): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (secret && authorization === `Bearer ${secret}`) {
    return true;
  }

  if (!secret && authorization) {
    console.error(
      "[refresh] CRON_SECRET is not set – bearer token auth cannot succeed. Set CRON_SECRET in your environment."
    );
  }

  const { userId } = await auth();
  return userId !== null;
}

function parseRefreshScope(url: string): {
  refreshCategorySignals: boolean;
  refreshUserSkills: boolean;
  refreshImportedSkills: boolean;
} {
  try {
    const { searchParams } = new URL(url);
    const scope = searchParams.get("scope");

    if (scope === "skills-only") {
      return {
        refreshCategorySignals: false,
        refreshImportedSkills: true,
        refreshUserSkills: true,
      };
    }

    return {
      refreshCategorySignals: false,
      refreshImportedSkills: true,
      refreshUserSkills: true,
    };
  } catch {
    /* fall through to defaults */
  }
  return {
    refreshCategorySignals: true,
    refreshImportedSkills: true,
    refreshUserSkills: true,
  };
}

async function handleRefresh(request: Request) {
  if (!(await isAuthorized(request))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scope = parseRefreshScope(request.url);
  const { dispatchedSkillCount } = await refreshLoopSnapshot(scope);

  const catalogue = await getSkillCatalogue();

  try {
    revalidatePath("/");
    revalidatePath("/agents");
    revalidatePath("/feed.xml");
    revalidatePath("/skills/new");
    catalogue.categories.forEach((category) =>
      revalidatePath(`/categories/${category.slug}`)
    );
    catalogue.skills.forEach((skill) => {
      revalidatePath(`/skills/${skill.slug}`);
      revalidatePath(skill.href);
    });
  } catch (revalidateError) {
    console.error("[refresh] Cache revalidation failed:", revalidateError);
  }

  return Response.json({
    categories: catalogue.categories.length,
    dispatchedSkillRefreshes: dispatchedSkillCount,
    generatedAt: new Date().toISOString(),
    ok: true,
    skills: catalogue.skills.length,
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
