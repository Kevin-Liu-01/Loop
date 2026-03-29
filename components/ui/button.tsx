import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "ghost" | "soft" | "danger";
export type ButtonSize = "default" | "sm" | "icon" | "icon-sm";

export const buttonBase =
  "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50";

export const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "border border-accent bg-accent text-white hover:bg-accent-hover hover:border-accent-hover",
  ghost:
    "border border-line bg-paper-3 text-ink hover:border-accent hover:bg-accent hover:text-white",
  soft:
    "border border-line bg-paper-2/80 text-ink-soft hover:border-accent hover:text-ink",
  danger:
    "border border-line bg-paper-3 text-ink-soft hover:border-red-400 hover:text-red-400"
};

export const buttonSizes: Record<ButtonSize, string> = {
  default: "min-h-10 rounded-2xl px-4 py-2 text-sm",
  sm: "min-h-8 rounded-full px-3 py-1.5 text-xs",
  icon: "h-9 w-9 rounded-xl p-0",
  "icon-sm": "h-8 w-8 rounded-lg p-0"
};

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonLinkProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  href: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export function Button({ variant = "primary", size = "default", className, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(buttonBase, buttonVariants[variant], buttonSizes[size], className)}
      {...rest}
    />
  );
}

export function ButtonLink({ variant = "primary", size = "default", className, ...rest }: ButtonLinkProps) {
  return (
    <a
      className={cn(buttonBase, buttonVariants[variant], buttonSizes[size], className)}
      {...rest}
    />
  );
}
