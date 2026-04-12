import { cn } from "@/lib/cn";

interface FieldGroupProps {
  className?: string;
  children: React.ReactNode;
}

export function FieldGroup({ className, children }: FieldGroupProps) {
  return <label className={cn("grid gap-1.5", className)}>{children}</label>;
}

interface FieldLabelProps {
  className?: string;
  children: React.ReactNode;
}

export function FieldLabel({ className, children }: FieldLabelProps) {
  return (
    <span
      className={cn(
        "text-xs font-medium uppercase tracking-[0.08em] text-ink-soft",
        className
      )}
    >
      {children}
    </span>
  );
}

export const textFieldBase =
  "min-h-9 w-full rounded-none border border-line bg-paper-3 px-3 py-2 text-sm text-ink placeholder:text-ink-faint outline-none transition-[border-color,box-shadow] duration-150 hover:border-ink-faint/35 focus:border-accent/40 focus:shadow-[0_0_0_3px_rgba(232,101,10,0.06)] dark:bg-paper-2/60";

/** Toolbar / list search: matches control height (h-9), square corners, grid-aligned. */
export const textFieldSearch =
  "h-9 w-full rounded-none border border-line bg-paper-2/80 py-0 pl-9 pr-3 text-sm leading-none text-ink placeholder:text-ink-faint outline-none transition-[border-color,box-shadow] duration-150 hover:border-ink-faint/35 focus:border-accent/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-paper)] dark:bg-paper-2/45";

export const textFieldArea = "min-h-24 resize-y py-2.5";
export const textFieldCode =
  "min-h-48 font-mono text-[0.8125rem] leading-[1.7] resize-y py-2.5";
export const textFieldSelect = "appearance-none resize-none";
