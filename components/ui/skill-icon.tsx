"use client";

import { cn } from "@/lib/cn";
import { getSkillIcon, getMcpIcon } from "@/lib/skill-icons";
import { IconRefView } from "@/components/ui/icon-ref";

type SkillIconProps = {
  slug: string;
  iconUrl?: string | null;
  size?: number;
  className?: string;
  /** Edge-to-edge rendering with no padding, background, ring, or rounding. */
  flush?: boolean;
  /** Force the icon image to white (brightness-0 invert) for use on colored backgrounds. */
  invert?: boolean;
};

export function SkillIcon({ slug, iconUrl, size = 24, className, flush, invert }: SkillIconProps) {
  if (iconUrl) {
    return <IconTile className={className} flush={flush} invert={invert} size={size} src={iconUrl} />;
  }

  const fallback = getSkillIcon(slug);
  return <IconRefView className={className} flush={flush} invert={invert} icon={fallback} size={size} />;
}

type McpIconProps = {
  name: string;
  iconUrl?: string | null;
  homepageUrl?: string;
  size?: number;
  className?: string;
};

export function McpIcon({ name, iconUrl, homepageUrl, size = 24, className }: McpIconProps) {
  if (iconUrl) {
    return <IconTile className={className} size={size} src={iconUrl} />;
  }

  const fallback = getMcpIcon(name, homepageUrl);
  return <IconRefView className={className} icon={fallback} size={size} />;
}

type IconTileProps = {
  src: string;
  size: number;
  className?: string;
  flush?: boolean;
  invert?: boolean;
};

function IconTile({ src, size, className, flush, invert }: IconTileProps) {
  const pad = Math.max(2, Math.round(size * 0.14));

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-white",
        flush ? "overflow-hidden" : "rounded-lg ring-1 ring-black/10",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <img
        alt=""
        className={cn("shrink-0 object-contain", invert && "brightness-0 invert")}
        height={size - pad * 2}
        loading="lazy"
        src={src}
        width={size - pad * 2}
      />
    </span>
  );
}
