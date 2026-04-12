import { cn } from "@/lib/cn";

import { Sparkline } from "./sparkline";

interface StatTileProps {
  label: string;
  value: string | number;
  sparkData?: number[];
  className?: string;
  /** Denser padding and typography for narrow sidebars */
  size?: "default" | "compact";
  /** Secondary line under the value (e.g. rolling comparison) */
  delta?: string | null;
}

export function StatTile({
  label,
  value,
  sparkData,
  className,
  size = "default",
  delta,
}: StatTileProps) {
  const hasSparkData =
    sparkData && sparkData.length > 1 && sparkData.some((v) => v > 0);
  const compact = size === "compact";

  return (
    <div
      className={cn(
        "relative grid overflow-hidden border border-line",
        compact
          ? cn(
              "gap-0.5 rounded-none bg-paper-3 p-2.5 dark:bg-paper-2/90",
              delta ? "pb-7" : "pb-6"
            )
          : "gap-1 rounded-none p-4",
        className
      )}
    >
      <small
        className={cn(
          "font-semibold uppercase tracking-[0.08em] text-ink-soft",
          compact ? "text-[0.62rem] leading-tight" : "text-[0.72rem]"
        )}
      >
        {label}
      </small>
      <strong
        className={cn(
          "relative z-10 font-semibold tabular-nums tracking-[-0.03em] text-ink",
          compact ? "text-[0.9375rem] leading-none" : "text-base"
        )}
      >
        {value}
      </strong>
      {delta ? (
        <span
          className={cn(
            "relative z-10 text-ink-faint",
            compact
              ? "text-[0.58rem] leading-tight"
              : "text-[0.65rem] leading-snug"
          )}
        >
          {delta}
        </span>
      ) : null}
      {hasSparkData && (
        <Sparkline
          data={sparkData!}
          height={compact ? 22 : 28}
          className="absolute right-0 bottom-0 left-0 opacity-90"
        />
      )}
    </div>
  );
}
