import { cn } from "@/lib/cn";
import { Sparkline } from "./sparkline";

type StatTileProps = {
  label: string;
  value: string | number;
  sparkData?: number[];
  className?: string;
};

export function StatTile({ label, value, sparkData, className }: StatTileProps) {
  const hasSparkData =
    sparkData && sparkData.length > 1 && sparkData.some((v) => v > 0);

  return (
    <div
      className={cn(
        "relative grid gap-1 overflow-hidden rounded-2xl border border-line p-4",
        className
      )}
    >
      <small className="text-[0.72rem] font-medium uppercase tracking-[0.08em] text-ink-soft">
        {label}
      </small>
      <strong className="relative z-10 text-base font-semibold tabular-nums tracking-[-0.03em] text-ink">
        {value}
      </strong>
      {hasSparkData && (
        <Sparkline
          data={sparkData!}
          height={28}
          className="absolute right-0 bottom-0 left-0"
        />
      )}
    </div>
  );
}
