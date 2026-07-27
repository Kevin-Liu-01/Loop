import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import {
  HomeDashboard,
  HomeDashboardFallback,
} from "@/components/home-dashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/home");
  }

  return (
    <Suspense fallback={<HomeDashboardFallback />}>
      <HomeDashboard userId={userId} />
    </Suspense>
  );
}
