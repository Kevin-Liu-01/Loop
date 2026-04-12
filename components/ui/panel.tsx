import { cn } from "@/lib/cn";

type PanelProps = {
  compact?: boolean;
  /** Flush corners + tighter rhythm for AppGridShell / skill detail. */
  square?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

interface PanelHeadProps {
  className?: string;
  children: React.ReactNode;
}

export function Panel({
  compact,
  square,
  className,
  children,
  ...rest
}: PanelProps) {
  return (
    <div
      className={cn(
        "grid border border-line bg-paper-3/92",
        square
          ? cn("rounded-none gap-4", compact ? "p-4" : "p-5 sm:p-6")
          : cn("gap-5 rounded-none", compact ? "p-5" : "p-6"),
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function PanelHead({ className, children }: PanelHeadProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-3",
        className
      )}
    >
      {children}
    </div>
  );
}
