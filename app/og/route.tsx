import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import {
  OG_HEIGHT,
  OG_WIDTH,
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_TITLE,
  SITE_NAME,
} from "@/lib/seo";

export const runtime = "nodejs";

const SCREENSHOT_PATH = "/images/og.png";

const fontDir = join(process.cwd(), "app", "og");

const neueMontBook = readFile(join(fontDir, "NeueMontreal-Book.ttf"));
const neueMontBold = readFile(join(fontDir, "NeueMontreal-Bold.ttf"));

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || SEO_DEFAULT_TITLE;
  const description =
    searchParams.get("description") || SEO_DEFAULT_DESCRIPTION;
  const category = searchParams.get("category") || null;

  const { origin } = new URL(request.url);
  const screenshotUrl = `${origin}${SCREENSHOT_PATH}`;

  const [bookFont, boldFont] = await Promise.all([neueMontBook, neueMontBold]);

  return new ImageResponse(
    <OgCard
      title={title}
      description={description}
      category={category}
      screenshotUrl={screenshotUrl}
    />,
    {
      fonts: [
        { data: bookFont, name: "Neue Montreal", style: "normal", weight: 400 },
        { data: boldFont, name: "Neue Montreal", style: "normal", weight: 700 },
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

interface OgCardProps {
  title: string;
  description: string;
  category: string | null;
  screenshotUrl: string;
}

function OgCard({ title, description, category, screenshotUrl }: OgCardProps) {
  const displayTitle = title.length > 80 ? `${title.slice(0, 77)}...` : title;
  const displayDesc =
    description.length > 140 ? `${description.slice(0, 137)}...` : description;
  const titleSize = displayTitle.length > 50 ? 40 : 48;

  return (
    <div
      style={{
        background:
          "linear-gradient(145deg, #0a0a09 0%, #1a0f0a 35%, #3d1f10 70%, #4a2618 100%)",
        display: "flex",
        fontFamily: "Neue Montreal",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        width: "100%",
      }}
    >
      {/* Warm radial glow from bottom-left */}
      <div
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(232, 101, 10, 0.18) 0%, transparent 65%)",
          borderRadius: "50%",
          bottom: "-100px",
          height: "500px",
          left: "-60px",
          position: "absolute",
          width: "700px",
        }}
      />

      {/* Orange glow behind screenshot */}
      <div
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(232, 101, 10, 0.12) 0%, transparent 60%)",
          borderRadius: "50%",
          height: "700px",
          position: "absolute",
          right: "-100px",
          top: "-60px",
          width: "800px",
        }}
      />

      {/* Screenshot: large, positioned to bleed off the right edge */}
      <div
        style={{
          border: "1px solid rgba(255, 255, 255, 0.10)",
          borderRadius: "12px",
          bottom: "40px",
          display: "flex",
          overflow: "hidden",
          position: "absolute",
          right: "-400px",
          top: "40px",
          width: "820px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={screenshotUrl}
          width={820}
          height={550}
          style={{
            objectFit: "cover",
            objectPosition: "top left",
          }}
        />
      </div>

      {/* Left column: text content over everything */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          justifyContent: "space-between",
          padding: "48px 0 48px 56px",
          position: "relative",
          width: "720px",
        }}
      >
        {/* Header */}
        <div style={{ alignItems: "center", display: "flex", gap: "14px" }}>
          <GearIcon />
          <span
            style={{
              color: "rgba(255, 255, 255, 0.50)",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {SITE_NAME}
          </span>
        </div>

        {/* Title + description */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {category && (
            <div style={{ alignItems: "center", display: "flex" }}>
              <div
                style={{
                  borderLeft: "3px solid #e8650a",
                  color: "#e8650a",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  paddingLeft: "10px",
                  textTransform: "uppercase",
                }}
              >
                {category}
              </div>
            </div>
          )}

          <h1
            style={{
              color: "#f5f5f5",
              fontSize: titleSize,
              fontWeight: 700,
              letterSpacing: "-0.035em",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {displayTitle}
          </h1>

          <p
            style={{
              color: "rgba(255, 255, 255, 0.50)",
              fontSize: 18,
              fontWeight: 400,
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            {displayDesc}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: "16px",
          }}
        >
          <span
            style={{
              color: "rgba(255, 255, 255, 0.28)",
              fontSize: 14,
              fontWeight: 400,
              letterSpacing: "0.03em",
            }}
          >
            loooop.dev
          </span>
          <div
            style={{
              background:
                "linear-gradient(90deg, #e8650a, rgba(232, 101, 10, 0.25))",
              borderRadius: 2,
              height: 4,
              width: 48,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function GearIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="14" fill="#e8650a" />
      <g transform="translate(32 32) scale(0.4) translate(-64 -60)">
        <path
          d="M103 76A42 42 0 0 1 98 84L107 90A52 52 0 0 1 94 103L88 94A42 42 0 0 1 71 102L72 111A52 52 0 0 1 54 111L56 101A42 42 0 0 1 39 94L33 102A52 52 0 0 1 20 88L29 83A42 42 0 0 1 22 65L12 66A52 52 0 0 1 13 48L23 51A42 42 0 0 1 31 34L24 27A52 52 0 0 1 37 15L42 24A42 42 0 0 1 60 18L60 8A52 52 0 0 1 78 10L75 19A42 42 0 0 1 83 23A7 7 0 0 1 77 35A28 28 0 1 0 90 71A7 7 0 0 1 103 76Z"
          fill="#fff"
        />
        <path
          d="M96.28 33.13 L103.97 26.74 A52 52 0 0 1 108.22 32.64 L99.71 37.90 A42 42 0 0 1 101.51 41.10 L123.83 29.84 A67 67 0 0 1 129.35 45.21 L104.96 50.73 A42 42 0 0 1 105.62 54.34 L115.53 52.99 A52 52 0 0 1 116.00 60.28 L106.00 60.23 A42 42 0 0 0 96.28 33.13Z"
          fill="#fff"
        />
        <circle cx="64" cy="60" r="7" fill="#fff" />
      </g>
    </svg>
  );
}
