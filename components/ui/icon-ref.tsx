"use client";

import { icons as lucideIcons } from "lucide-react";

import { cn } from "@/lib/cn";
import type { IconRef } from "@/lib/skill-icons";

interface IconRefViewProps {
  icon: IconRef;
  size?: number;
  className?: string;
  flush?: boolean;
  invert?: boolean;
}

export function IconRefView({
  icon,
  size = 20,
  className,
  flush,
  invert,
}: IconRefViewProps) {
  if (icon.kind === "url") {
    const pad = Math.max(2, Math.round(size * 0.14));
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center bg-white",
          flush ? "overflow-hidden" : "rounded-lg ring-1 ring-black/10",
          className
        )}
        style={{ height: size, width: size }}
      >
        <img
          alt={icon.alt}
          className={cn(
            "shrink-0 object-contain",
            invert && "brightness-0 invert"
          )}
          height={size - pad * 2}
          loading="lazy"
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
  if (!LucideIcon) {
    return null;
  }

  return (
    <LucideIcon
      className={cn("shrink-0 text-ink-soft", className)}
      size={size}
    />
  );
}
