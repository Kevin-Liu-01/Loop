import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "ghost" | "soft" | "danger";
export type ButtonSize = "default" | "sm" | "icon" | "icon-sm";

/** Shared motion + focus affordance (offset follows theme paper; primary overrides ring in variant). */
export const buttonBase =
  "inline-flex items-center justify-center gap-2 font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-paper)] active:scale-[0.985] dark:focus-visible:ring-offset-[var(--color-paper)]";

export const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "border border-accent bg-accent text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] hover:bg-accent-hover hover:border-accent-hover hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22)] focus-visible:ring-white/45 focus-visible:ring-offset-[var(--color-accent)]",
  ghost:
    "border border-line bg-paper-3 text-ink hover:border-accent hover:bg-accent hover:text-white hover:shadow-[inset_0_0_0_1px_rgba(232,101,10,0.15)]",
  soft:
    "border border-line bg-paper-2/80 text-ink-soft hover:border-accent/75 hover:bg-paper-3 hover:text-ink hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:hover:bg-paper-2/55 dark:hover:shadow-[inset_0_0_0_1px_rgba(232,101,10,0.28)]",
  danger:
    "border border-line bg-paper-3 text-ink-soft hover:border-red-500/55 hover:bg-red-500/10 hover:text-red-600 dark:hover:bg-red-950/25 dark:hover:text-red-400"
};

/** Square controls; sm and all icon sizes share one height for toolbar alignment. */
export const buttonSizes: Record<ButtonSize, string> = {
  default: "h-11 min-h-11 rounded-none px-4 text-sm",
  sm: "h-9 min-h-9 rounded-none px-3 text-xs",
  icon: "size-9 shrink-0 rounded-none p-0",
  "icon-sm": "size-7 shrink-0 rounded-none p-0"
};

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  grain?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonLinkProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  grain?: boolean;
  className?: string;
  href: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export function Button({ variant = "primary", size = "default", grain, className, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(buttonBase, buttonVariants[variant], buttonSizes[size], grain && "grain-btn", className)}
      {...rest}
    />
  );
}

export function ButtonLink({ variant = "primary", size = "default", grain, className, ...rest }: ButtonLinkProps) {
  return (
    <a
      className={cn(buttonBase, buttonVariants[variant], buttonSizes[size], grain && "grain-btn", className)}
      {...rest}
    />
  );
}
