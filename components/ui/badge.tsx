import { cn } from "@/lib/cn";

type BadgeProps = {
  muted?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Badge({ muted, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 max-w-[min(12rem,100%)] shrink-0 items-center justify-center rounded-full border border-line bg-paper-3 px-2.5 text-[0.6875rem] font-medium leading-none tracking-tight text-ink-soft whitespace-nowrap tabular-nums",
        muted && "border-transparent bg-paper-2 ring-1 ring-inset ring-line/50 dark:ring-line/35",
        className
      )}
    >
      {children}
    </span>
  );
}

type EyebrowPillProps = {
  className?: string;
  children: React.ReactNode;
};

export function EyebrowPill({ className, children }: EyebrowPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-line bg-paper-3 px-3 py-1.5 text-sm text-ink-soft",
        className
      )}
    >
      {children}
    </span>
  );
}
