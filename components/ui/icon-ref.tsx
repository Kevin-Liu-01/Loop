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
    const pad = Math.max(2, Math.round(size * 0.14));
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-black/10",
          className,
        )}
        style={{ width: size, height: size }}
      >
        <img
          alt={icon.alt}
          className="shrink-0 object-contain"
          height={size - pad * 2}
          src={icon.url}
          width={size - pad * 2}
        />
      </span>
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
