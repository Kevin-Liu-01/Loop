import { revalidatePath } from "next/cache";

import { auth } from "@clerk/nextjs/server";

import { getSkillCatalogue } from "@/lib/content";
import { refreshLoopSnapshot } from "@/lib/refresh";
import { withApiUsage } from "@/lib/usage-server";

async function isAuthorized(request: Request): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (secret && authorization === `Bearer ${secret}`) {
    return true;
  }

  const { userId } = await auth();
  return userId !== null;
}

async function handleRefresh(request: Request) {
  if (!(await isAuthorized(request))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await refreshLoopSnapshot();

  const catalogue = await getSkillCatalogue();

  revalidatePath("/");
  revalidatePath("/agents");
  revalidatePath("/feed.xml");
  revalidatePath("/skills/new");
  catalogue.categories.forEach((category) => revalidatePath(`/categories/${category.slug}`));
  catalogue.skills.forEach((skill) => {
    revalidatePath(`/skills/${skill.slug}`);
    revalidatePath(skill.href);
  });

  return Response.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    skills: catalogue.skills.length,
    categories: catalogue.categories.length
  });
}

export async function GET(request: Request) {
  return withApiUsage(
    {
      route: "/api/refresh",
      method: "GET",
      label: "Full refresh"
    },
    async () => handleRefresh(request)
  );
}

export async function POST(request: Request) {
  return withApiUsage(
    {
      route: "/api/refresh",
      method: "POST",
      label: "Full refresh"
    },
    async () => handleRefresh(request)
  );
}
