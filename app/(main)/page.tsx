import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import {
  HomeDashboard,
  HomeDashboardFallback,
} from "@/components/home-dashboard";
import { PUBLIC_HOME_PATH } from "@/lib/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Library",
  robots: { follow: false, index: false },
};

export default async function LibraryPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect(PUBLIC_HOME_PATH);
  }

  return (
    <Suspense fallback={<HomeDashboardFallback />}>
      <HomeDashboard userId={userId} />
    </Suspense>
  );
}
