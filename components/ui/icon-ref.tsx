"use client";

import { icons as lucideIcons } from "lucide-react";
import type { IconRef } from "@/lib/skill-icons";
import { cn } from "@/lib/cn";

type IconRefViewProps = {
  icon: IconRef;
  size?: number;
  className?: string;
};

export function IconRefView({ icon, size = 20, className }: IconRefViewProps) {
  if (icon.kind === "url") {
    return (
      <img
        alt={icon.alt}
        className={cn("shrink-0 rounded", className)}
        height={size}
        src={icon.url}
        width={size}
      />
    );
  }

  const pascalName = icon.name
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("") as keyof typeof lucideIcons;

  const LucideIcon = lucideIcons[pascalName];
  if (!LucideIcon) return null;

  return <LucideIcon className={cn("shrink-0 text-ink-soft", className)} size={size} />;
}
