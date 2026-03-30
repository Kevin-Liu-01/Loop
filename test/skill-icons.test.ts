import assert from "node:assert/strict";
import test from "node:test";

import { getSkillIcon, getMcpIcon, computeSourceLogoUrl } from "@/lib/skill-icons";
import { validateIconFile } from "@/lib/icon-storage";
import { SEED_SKILL_DEFINITIONS } from "@/lib/db/seed-data/skill-definitions";

// ---------------------------------------------------------------------------
// Icon resolution fallback chain
// ---------------------------------------------------------------------------

test("getSkillIcon returns an icon for every seed skill", () => {
  for (const skill of SEED_SKILL_DEFINITIONS) {
    const icon = getSkillIcon(skill.slug);
    assert.ok(icon, `Missing icon for skill ${skill.slug}`);
    assert.ok(icon.kind === "lucide" || icon.kind === "url", `Invalid icon kind for ${skill.slug}`);
  }
});

test("getSkillIcon returns a default for unknown slugs", () => {
  const icon = getSkillIcon("nonexistent-skill-slug");
  assert.equal(icon.kind, "lucide");
  assert.equal(icon.name, "file-text");
});

test("getMcpIcon returns a brand icon for known MCPs", () => {
  const github = getMcpIcon("GitHub");
  assert.equal(github.kind, "url");

  const supabase = getMcpIcon("Supabase");
  assert.equal(supabase.kind, "url");
});

test("getMcpIcon falls back to homepage favicon when name is unknown", () => {
  const icon = getMcpIcon("CustomMcp", "https://example.com");
  assert.equal(icon.kind, "url");
  assert.ok((icon as { url: string }).url.includes("example.com"));
});

test("getMcpIcon returns lucide plug for completely unknown MCP", () => {
  const icon = getMcpIcon("CompletelyUnknownMcp");
  assert.equal(icon.kind, "lucide");
  assert.equal(icon.name, "plug");
});

// ---------------------------------------------------------------------------
// Icon file validation
// ---------------------------------------------------------------------------

test("validateIconFile rejects files over 1 MB", () => {
  const bigFile = new File([new ArrayBuffer(2_000_000)], "big.png", { type: "image/png" });
  const err = validateIconFile(bigFile);
  assert.ok(err);
  assert.ok(err.includes("too large"));
});

test("validateIconFile rejects unsupported MIME types", () => {
  const gifFile = new File([new ArrayBuffer(100)], "icon.gif", { type: "image/gif" });
  const err = validateIconFile(gifFile);
  assert.ok(err);
  assert.ok(err.includes("Invalid file type"));
});

test("validateIconFile accepts valid PNG under 1 MB", () => {
  const ok = new File([new ArrayBuffer(500)], "icon.png", { type: "image/png" });
  assert.equal(validateIconFile(ok), null);
});

test("validateIconFile accepts valid SVG", () => {
  const ok = new File([new ArrayBuffer(200)], "icon.svg", { type: "image/svg+xml" });
  assert.equal(validateIconFile(ok), null);
});

test("validateIconFile accepts valid WebP", () => {
  const ok = new File([new ArrayBuffer(300)], "icon.webp", { type: "image/webp" });
  assert.equal(validateIconFile(ok), null);
});

// ---------------------------------------------------------------------------
// Brand mapping coverage
// ---------------------------------------------------------------------------

test("all 40 seed skills have a skill icon mapping", () => {
  const slugs = SEED_SKILL_DEFINITIONS.map((s) => s.slug);
  assert.ok(slugs.length >= 40, `Expected at least 40 skills, got ${slugs.length}`);

  for (const slug of slugs) {
    const icon = getSkillIcon(slug);
    assert.ok(icon.kind === "lucide" || icon.kind === "url", `No icon for ${slug}`);
  }
});

test("seed skills with brand icons use URL kind", () => {
  const brandSlugs = [
    "motion-framer",
    "gsap-scrolltrigger",
    "react-three-fiber",
    "tailwind-design-system",
    "nextjs-patterns",
    "dockerfile-mastery",
    "kubernetes-essentials",
    "gh-actions-ci",
  ];

  for (const slug of brandSlugs) {
    const icon = getSkillIcon(slug);
    assert.equal(icon.kind, "url", `Expected URL icon for ${slug}, got ${icon.kind}`);
  }
});

// ---------------------------------------------------------------------------
// computeSourceLogoUrl
// ---------------------------------------------------------------------------

test("computeSourceLogoUrl returns Google favicon URL for valid URLs", () => {
  const url = computeSourceLogoUrl("https://react.dev/rss.xml");
  assert.ok(url.includes("react.dev"));
  assert.ok(url.startsWith("https://www.google.com/s2/favicons"));
});

test("computeSourceLogoUrl returns empty string for invalid URLs", () => {
  assert.equal(computeSourceLogoUrl("not-a-url"), "");
});

// ---------------------------------------------------------------------------
// Title format: no parenthetical brand names
// ---------------------------------------------------------------------------

test("no seed skill titles use parenthetical format", () => {
  for (const skill of SEED_SKILL_DEFINITIONS) {
    assert.ok(
      !skill.title.match(/\(.+\)\s*$/),
      `Skill "${skill.title}" uses parenthetical format — should lead with brand name instead`
    );
  }
});
