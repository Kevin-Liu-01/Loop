import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import type { CSSProperties } from "react";

import {
  LOOP_GEAR_BODY_PATH,
  LOOP_GEAR_CHIP_PATH,
} from "@/lib/loop-logo-paths";
import {
  OG_HEIGHT,
  OG_WIDTH,
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_TITLE,
  SITE_NAME,
} from "@/lib/seo";

export const runtime = "nodejs";

const fontDirectory = join(process.cwd(), "app", "og");
const neueMontrealBook = readFile(join(fontDirectory, "NeueMontreal-Book.ttf"));
const neueMontrealBold = readFile(join(fontDirectory, "NeueMontreal-Bold.ttf"));

const ACCENT = "#e8650a";
const PAPER = "#f4f1ea";
const INK = "#0a0a09";
const LINE = "#c9c4ba";

const diagramLabelStyle: CSSProperties = {
  display: "flex",
  fontSize: 17,
  position: "absolute",
};

function LoopMark({
  color = INK,
  size = 88,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <svg aria-hidden="true" height={size} viewBox="0 0 136 120" width={size}>
      <path d={LOOP_GEAR_BODY_PATH} fill={color} />
      <path d={LOOP_GEAR_CHIP_PATH} fill={color} />
      <circle cx="64" cy="60" fill={color} r="7" />
    </svg>
  );
}

function RefreshDiagram() {
  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        height: 410,
        justifyContent: "center",
        position: "relative",
        width: 410,
      }}
    >
      <svg
        aria-hidden="true"
        height="410"
        style={{ inset: 0, position: "absolute" }}
        viewBox="0 0 410 410"
        width="410"
      >
        <circle
          cx="205"
          cy="205"
          fill="none"
          r="142"
          stroke={LINE}
          strokeWidth="2"
        />
        <path
          d="M205 63A142 142 0 0 1 347 205"
          fill="none"
          stroke={ACCENT}
          strokeWidth="5"
        />
        <path
          d="M205 347A142 142 0 0 1 63 205"
          fill="none"
          stroke={ACCENT}
          strokeOpacity="0.34"
          strokeWidth="5"
        />

        <circle
          cx="205"
          cy="63"
          fill={PAPER}
          r="8"
          stroke={INK}
          strokeWidth="2"
        />
        <circle cx="347" cy="205" fill={ACCENT} r="8" />
        <circle
          cx="205"
          cy="347"
          fill={PAPER}
          r="8"
          stroke={INK}
          strokeWidth="2"
        />
        <circle
          cx="63"
          cy="205"
          fill={PAPER}
          r="8"
          stroke={INK}
          strokeWidth="2"
        />

        <path d="M305 92L321 95L310 107Z" fill={ACCENT} />
        <path d="M106 316L90 313L101 301Z" fill={ACCENT} fillOpacity="0.55" />
      </svg>

      <div
        style={{
          ...diagramLabelStyle,
          justifyContent: "center",
          top: 3,
          width: 100,
        }}
      >
        Sources
      </div>
      <div style={{ ...diagramLabelStyle, right: 0, top: 194 }}>Refresh</div>
      <div
        style={{
          ...diagramLabelStyle,
          bottom: 1,
          justifyContent: "center",
          width: 100,
        }}
      >
        Version
      </div>
      <div style={{ ...diagramLabelStyle, left: 0, top: 194 }}>Diff</div>

      <div
        style={{
          alignItems: "center",
          background: PAPER,
          border: `2px solid ${INK}`,
          borderRadius: 999,
          display: "flex",
          height: 138,
          justifyContent: "center",
          width: 138,
        }}
      >
        <LoopMark color={ACCENT} size={82} />
      </div>
    </div>
  );
}

interface OgCardProps {
  category: string | null;
  description: string;
  title: string;
}

function OgCard({ category, description, title }: OgCardProps) {
  const normalizedTitle =
    title === SEO_DEFAULT_TITLE ? "Skills that never go stale." : title;
  const displayTitle =
    normalizedTitle.length > 80
      ? `${normalizedTitle.slice(0, 77)}...`
      : normalizedTitle;
  const displayDescription =
    description.length > 150 ? `${description.slice(0, 147)}...` : description;
  const titleSize =
    displayTitle.length > 58 ? 45 : displayTitle.length > 38 ? 55 : 72;

  return (
    <div
      style={{
        background: PAPER,
        color: INK,
        display: "flex",
        fontFamily: "Neue Montreal",
        height: "100%",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "58px 0 58px 64px",
          width: 720,
        }}
      >
        <div style={{ alignItems: "center", display: "flex" }}>
          <LoopMark color={ACCENT} size={46} />
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: -0.8,
              marginLeft: 10,
            }}
          >
            {SITE_NAME}
          </div>
        </div>

        <div
          style={{
            color: ACCENT,
            display: "flex",
            fontSize: 16,
            fontWeight: 700,
            height: 24,
            marginTop: 76,
          }}
        >
          {category ?? ""}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            fontWeight: 700,
            letterSpacing: -3.6,
            lineHeight: 0.98,
            marginTop: 8,
            maxWidth: 640,
          }}
        >
          {displayTitle}
        </div>
        <div
          style={{
            color: "#55514b",
            display: "flex",
            fontSize: 21,
            lineHeight: 1.45,
            marginTop: 24,
            maxWidth: 610,
          }}
        >
          {displayDescription}
        </div>
      </div>

      <div
        style={{
          alignItems: "center",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: 480,
        }}
      >
        <RefreshDiagram />
      </div>
    </div>
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || SEO_DEFAULT_TITLE;
  const description =
    searchParams.get("description") || SEO_DEFAULT_DESCRIPTION;
  const category = searchParams.get("category") || null;
  const [bookFont, boldFont] = await Promise.all([
    neueMontrealBook,
    neueMontrealBold,
  ]);

  return new ImageResponse(
    <OgCard category={category} description={description} title={title} />,
    {
      fonts: [
        {
          data: bookFont,
          name: "Neue Montreal",
          style: "normal",
          weight: 400,
        },
        {
          data: boldFont,
          name: "Neue Montreal",
          style: "normal",
          weight: 700,
        },
      ],
      headers: {
        "Cache-Control":
          "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        "Content-Type": "image/png",
      },
      height: OG_HEIGHT,
      width: OG_WIDTH,
    }
  );
}
