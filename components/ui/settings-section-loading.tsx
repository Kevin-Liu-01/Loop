import { LoadingStatusPill } from "@/components/ui/loading-status-pill";
import { Skeleton } from "@/components/ui/skeleton";

/** Inline fallback for streaming settings sections. Matches the vertical
 *  rhythm of the real section content so the layout doesn't jump when the
 *  Suspense boundary resolves. The spinner itself sits in the fixed status
 *  pill, not inline, so it stays put across every skeleton. */
export function SettingsSectionLoading({
  label,
  rows = 3,
}: {
  label?: string;
  rows?: number;
}) {
  return (
    <>
      <div className="grid gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
            key={i}
            className="h-32 w-full"
          />
        ))}
      </div>
      <LoadingStatusPill label={label ?? "Loading"} />
    </>
  );
}
