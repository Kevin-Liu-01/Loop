"use client";

import { CopyButton } from "@/components/copy-button";
import { DownloadIcon } from "@/components/frontier-icons";
import { cn } from "@/lib/cn";

const BRAND_COLORS = [
  { hex: "#E8650A", name: "Accent", oklch: "oklch(0.62 0.19 47)" },
  { hex: "#0A0A09", name: "Background", oklch: "oklch(0.10 0.00 0)" },
  { hex: "#050505", name: "Surface", oklch: "oklch(0.07 0.00 0)" },
  { hex: "#F5F5F5", name: "Foreground", oklch: "oklch(0.97 0.00 0)" },
] as const;

const PREVIEW_BG = "bg-[#e8e8e6] dark:bg-[#1a1a19]";

const LOGO_ASSETS = [
  {
    description:
      "Standalone gear in accent orange with dark chip. Default mark.",
    download: "loop-mark.svg",
    height: 120,
    label: "Loop mark",
    previewBg: PREVIEW_BG,
    src: "/brand/loop-mark.svg",
    width: 134,
  },
  {
    description: "Accent gear with white chip. Use on dark backgrounds.",
    download: "loop-mark-light.svg",
    height: 120,
    label: "Loop mark (light chip)",
    previewBg: PREVIEW_BG,
    src: "/brand/loop-mark-light.svg",
    width: 134,
  },
  {
    description: "Gear mark on dark container. Favicon and PWA icon.",
    download: "loop-icon.svg",
    height: 64,
    label: "App icon (dark)",
    previewBg: PREVIEW_BG,
    src: "/icon.svg",
    width: 64,
  },
  {
    description:
      "Gear mark on accent-orange container. Social and marketing use.",
    download: "loop-icon-accent.svg",
    height: 64,
    label: "App icon (accent)",
    previewBg: PREVIEW_BG,
    src: "/brand/loop-icon-accent.svg",
    width: 64,
  },
] as const;

function AssetCard({
  label,
  description,
  src,
  download,
  width,
  height,
  previewBg,
}: (typeof LOGO_ASSETS)[number]) {
  const aspect = width / height;

  return (
    <div className="grid gap-0 overflow-hidden border border-line">
      <div className={cn("flex items-center justify-center p-8", previewBg)}>
        <div className="flex items-end gap-6">
          {[80, 40, 20].map((h) => (
            <img
              key={h}
              src={src}
              alt={`${label} ${h}px`}
              width={Math.round(h * aspect)}
              height={h}
              className="shrink-0"
              draggable={false}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line bg-paper-3/40 px-4 py-3">
        <div className="grid min-w-0 gap-0.5">
          <span className="text-sm font-medium text-ink">{label}</span>
          <span className="text-[0.75rem] leading-snug text-ink-faint">
            {description}
          </span>
        </div>
        <a
          href={src}
          download={download}
          className={cn(
            "flex shrink-0 items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors",
            "border border-line hover:border-line-strong hover:bg-paper-3 hover:text-ink"
          )}
        >
          <DownloadIcon className="h-3.5 w-3.5" />
          SVG
        </a>
      </div>
    </div>
  );
}

function ColorSwatch({ name, hex, oklch }: (typeof BRAND_COLORS)[number]) {
  return (
    <div className="grid gap-2">
      <div
        className="h-16 w-full border border-line"
        style={{ background: hex }}
      />
      <div className="grid gap-0.5 px-0.5">
        <span className="text-[0.8125rem] font-medium text-ink">{name}</span>
        <div className="flex items-center gap-1.5">
          <code className="text-[0.6875rem] tabular-nums text-ink-faint">
            {hex}
          </code>
          <CopyButton
            value={hex}
            iconOnly
            iconSize="sm"
            size="icon-sm"
            variant="ghost"
          />
        </div>
        <code className="text-[0.625rem] tabular-nums text-ink-faint/60">
          {oklch}
        </code>
      </div>
    </div>
  );
}

export function BrandAssetsPanel() {
  return (
    <div className="grid gap-10">
      {/* Logo assets */}
      <section className="grid gap-4">
        <div className="grid gap-1">
          <h2 className="m-0 text-xs font-medium uppercase tracking-[0.08em] text-ink-soft">
            Logo marks
          </h2>
          <p className="m-0 text-[0.8125rem] text-ink-faint">
            SVG vector files — crisp at any resolution.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {LOGO_ASSETS.map((asset) => (
            <AssetCard key={asset.label} {...asset} />
          ))}
        </div>
      </section>

      {/* Open Graph */}
      <section className="grid gap-4">
        <div className="grid gap-1">
          <h2 className="m-0 text-xs font-medium uppercase tracking-[0.08em] text-ink-soft">
            Open Graph image
          </h2>
          <p className="m-0 text-[0.8125rem] text-ink-faint">
            Social preview card generated dynamically at{" "}
            <code className="text-[0.75rem] text-ink-muted">/og</code>. Accepts
            optional{" "}
            <code className="text-[0.75rem] text-ink-muted">?title=</code>,{" "}
            <code className="text-[0.75rem] text-ink-muted">&description=</code>
            , and{" "}
            <code className="text-[0.75rem] text-ink-muted">&category=</code>{" "}
            query parameters.
          </p>
        </div>
        <div className="grid gap-0 overflow-hidden border border-line">
          <div className={cn(PREVIEW_BG, "p-4 sm:p-6")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/og"
              alt="Default Open Graph social preview"
              width={1200}
              height={630}
              className="w-full border border-white/[0.06]"
              draggable={false}
            />
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-line bg-paper-3/40 px-4 py-3">
            <div className="grid min-w-0 gap-0.5">
              <span className="text-sm font-medium text-ink">
                Default social preview
              </span>
              <span className="text-[0.75rem] tabular-nums text-ink-faint">
                1200 x 630 &middot; PNG &middot; edge-generated
              </span>
            </div>
            <CopyButton
              value="/og"
              label="Copy URL"
              iconType="link"
              size="sm"
              variant="soft"
            />
          </div>
        </div>
      </section>

      {/* Brand colors */}
      <section className="grid gap-4">
        <div className="grid gap-1">
          <h2 className="m-0 text-xs font-medium uppercase tracking-[0.08em] text-ink-soft">
            Brand colors
          </h2>
          <p className="m-0 text-[0.8125rem] text-ink-faint">
            Core palette tokens. Click the hex value to copy.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {BRAND_COLORS.map((color) => (
            <ColorSwatch key={color.name} {...color} />
          ))}
        </div>
      </section>
    </div>
  );
}
