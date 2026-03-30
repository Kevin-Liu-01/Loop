import { cn } from "@/lib/cn";

type FieldGroupProps = {
  className?: string;
  children: React.ReactNode;
};

export function FieldGroup({ className, children }: FieldGroupProps) {
  return <label className={cn("grid gap-2", className)}>{children}</label>;
}

type FieldLabelProps = {
  className?: string;
  children: React.ReactNode;
};

export function FieldLabel({ className, children }: FieldLabelProps) {
  return (
    <span className={cn("text-xs font-medium uppercase tracking-[0.08em] text-ink-soft", className)}>
      {children}
    </span>
  );
}

export const textFieldBase =
  "min-h-[52px] w-full rounded-[14px] border border-line bg-paper-3 px-4 py-4 text-ink outline-none transition-all duration-200 focus:border-accent/30 focus:shadow-[0_0_0_4px_rgba(232,101,10,0.08)]";

/** Toolbar / list search: matches control height (h-9), square corners, grid-aligned. */
export const textFieldSearch =
  "h-9 w-full rounded-none border border-line bg-paper-2/80 py-0 pl-9 pr-3 text-sm leading-none text-ink placeholder:text-ink-faint outline-none transition-[border-color,box-shadow] duration-150 hover:border-ink-faint/35 focus:border-accent/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-paper)] dark:bg-paper-2/45";

export const textFieldArea = "min-h-32 resize-y";
export const textFieldCode = "min-h-80 font-mono leading-[1.8] resize-y";
export const textFieldSelect = "appearance-none resize-none";
