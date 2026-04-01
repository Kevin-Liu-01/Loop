import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  icon?: React.ReactNode;
  title: string;
  count?: number | string;
  countLabel?: string;
  action?: React.ReactNode;
  className?: string;
};

export function SectionHeading({
  icon,
  title,
  count,
  countLabel,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {icon ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none border border-line bg-paper-3 text-ink-soft [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
      ) : null}
      <div className="flex min-w-0 flex-1 items-baseline gap-2">
        <h2 className="m-0 font-serif text-xl font-medium tracking-[-0.02em] text-ink">
          {title}
        </h2>
        {count != null && (
          <span className="text-xs tabular-nums text-ink-faint">
            {count}
            {countLabel ? ` ${countLabel}` : ""}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}
