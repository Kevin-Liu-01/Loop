"use client";

import { cn } from "@/lib/cn";
import { getSkillIcon, getMcpIcon } from "@/lib/skill-icons";
import { IconRefView } from "@/components/ui/icon-ref";

type SkillIconProps = {
  slug: string;
  iconUrl?: string | null;
  size?: number;
  className?: string;
};

export function SkillIcon({ slug, iconUrl, size = 24, className }: SkillIconProps) {
  if (iconUrl) {
    return <IconTile className={className} size={size} src={iconUrl} />;
  }

  const fallback = getSkillIcon(slug);
  return <IconRefView className={className} icon={fallback} size={size} />;
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
};

function IconTile({ src, size, className }: IconTileProps) {
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
        alt=""
        className="shrink-0 object-contain"
        height={size - pad * 2}
        src={src}
        width={size - pad * 2}
      />
    </span>
  );
}
