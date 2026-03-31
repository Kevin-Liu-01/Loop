import Link from "next/link";

import { cn } from "@/lib/cn";
import { buttonBase, buttonVariants, buttonSizes } from "@/components/ui/button";
import type { ButtonVariant, ButtonSize } from "@/components/ui/button";

type LinkButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  grain?: boolean;
  className?: string;
  href: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, "className">;

export function LinkButton({
  variant = "primary",
  size = "default",
  grain,
  className,
  ...rest
}: LinkButtonProps) {
  return (
    <Link
      className={cn(buttonBase, buttonVariants[variant], buttonSizes[size], grain && "grain-btn", className)}
      {...rest}
    />
  );
}
