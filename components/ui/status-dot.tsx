import { cn } from "@/lib/cn";

export type StatusDotTone = "fresh" | "stale" | "error" | "idle";
export type StatusDotSize = "xs" | "sm" | "md" | "lg";

type StatusDotProps = {
  tone: StatusDotTone;
  size?: StatusDotSize;
  className?: string;
  pulse?: boolean;
};

const toneStyles: Record<StatusDotTone, string> = {
  fresh: "bg-success",
  stale: "bg-warning",
  error: "bg-red-500",
  idle: "bg-ink-faint"
};

const sizeStyles: Record<StatusDotSize, string> = {
  xs: "h-1 w-1",
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2.5 w-2.5",
};

export function StatusDot({ tone, size = "md", pulse, className }: StatusDotProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block shrink-0 rounded-full",
        sizeStyles[size],
        toneStyles[tone],
        pulse && "animate-pulse",
        className
      )}
    />
  );
}
