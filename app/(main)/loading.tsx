import { AppGridShell } from "@/components/app-grid-shell";
import { LoadingStatusPill } from "@/components/ui/loading-status-pill";
import { PageShell } from "@/components/ui/page-shell";
import { cn } from "@/lib/cn";
import { pageInsetPadX } from "@/lib/ui-layout";

/** Home route loading shell only (`app/(main)`); keeps unknown URLs from inheriting this Suspense UI. */
export default function Loading() {
  return (
    <AppGridShell
      header={
        <div className="flex min-h-[52px] items-center gap-3 px-4 py-2.5 max-md:px-3">
          <div className="skeleton h-8 w-8 !rounded-none" />
          <div className="skeleton h-4 w-14 !rounded-none" />
          <div className="flex-1" />
          <div className="skeleton h-8 w-24 !rounded-none max-sm:w-9" />
        </div>
      }
    >
      <PageShell inset className="flex min-h-0 flex-1 flex-col">
        <div
          className={cn(
            "grid min-h-0 flex-1 gap-6 overflow-y-auto py-6 sm:py-8",
            pageInsetPadX
          )}
        >
          <section className="grid grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)] gap-5 max-lg:grid-cols-1">
            <div className="skeleton skeleton--tall" />
            <div className="skeleton skeleton--panel" />
          </section>
          <section className="grid grid-cols-3 gap-3 max-lg:grid-cols-1">
            <div className="skeleton skeleton--card" />
            <div className="skeleton skeleton--card" />
            <div className="skeleton skeleton--card" />
          </section>
        </div>
      </PageShell>
      <LoadingStatusPill label="Loading Loop" />
    </AppGridShell>
  );
}
