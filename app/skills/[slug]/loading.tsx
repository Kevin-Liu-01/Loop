import { AppGridShell } from "@/components/app-grid-shell";
import { LoadingStatusPill } from "@/components/ui/loading-status-pill";
import { PageShell } from "@/components/ui/page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { pageInsetPadX } from "@/lib/ui-layout";

export default function SkillSlugLoading() {
  return (
    <AppGridShell
      header={
        <div className="flex min-h-[52px] items-center gap-3 px-4 py-2.5 max-md:px-3">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-4 w-14" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-24 max-sm:w-9" />
        </div>
      }
    >
      <PageShell inset className="flex min-h-0 flex-1 flex-col">
        <div
          className={cn(
            "grid min-h-0 flex-1 items-start gap-4 py-6 sm:py-8",
            pageInsetPadX
          )}
        >
          <Skeleton className="h-10 w-1/2 max-w-md" />
          <Skeleton className="h-4 w-2/3 max-w-lg" />
          <Skeleton className="mt-4 h-64 w-full" />
        </div>
      </PageShell>
      <LoadingStatusPill label="Resolving skill" />
    </AppGridShell>
  );
}
