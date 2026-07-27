import { AppGridShell } from "@/components/app-grid-shell";
import { SiteHeader } from "@/components/site-header";
import { LoadingStatusPill } from "@/components/ui/loading-status-pill";
import { PageShell } from "@/components/ui/page-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { pageInsetPadX } from "@/lib/ui-layout";

export function SkillDetailFallback() {
  return (
    <AppGridShell header={<SiteHeader />}>
      <PageShell inset className="flex min-h-0 flex-1 flex-col">
        <div
          className={cn(
            "grid min-h-0 flex-1 gap-6 overflow-y-auto py-6 sm:py-8",
            pageInsetPadX
          )}
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10" />
            <div className="grid gap-1.5">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-80" />
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_minmax(280px,0.4fr)] gap-6 max-lg:grid-cols-1">
            <div className="grid gap-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="grid gap-4 self-start">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </PageShell>
      <LoadingStatusPill label="Loading skill" />
    </AppGridShell>
  );
}
