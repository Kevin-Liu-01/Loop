import Link from "next/link";

import { AutomationCalendar } from "@/components/automation-calendar";
import { GITHUB_REPO_URL, GitHubIcon } from "@/components/frontier-icons";
import { GrainShader } from "@/components/home-landing/grain-shader";
import { HeroDiffField } from "@/components/home-landing/hero-diff-field";
import { LoopLogo } from "@/components/loop-logo";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { McpIcon, SkillIcon } from "@/components/ui/skill-icon";
import { StatusDot } from "@/components/ui/status-dot";
import type {
  LandingSkillRow,
  LandingMcpRow,
} from "@/lib/home-landing/landing-data";
import { SIGN_IN_PATH, SIGN_UP_PATH } from "@/lib/navigation";
import {
  formatTagLabel,
  getTagColorForCategory,
  getTagColorForTransport,
} from "@/lib/tag-utils";
import type { AutomationSummary, CategorySlug } from "@/lib/types";

interface NormalizedSkill {
  slug: string;
  title: string;
  category: string;
  versionLabel: string;
  tone: "fresh" | "stale" | "idle";
  relativeTime: string;
  description: string;
  iconUrl?: string;
  ownerName: string;
  href: string;
}

function normalizeStaticSkill(s: LandingSkillRow): NormalizedSkill {
  return {
    category: s.category,
    description: s.description,
    href: s.href ?? SIGN_UP_PATH,
    iconUrl: s.iconUrl,
    ownerName: s.ownerName,
    relativeTime: s.updatedAt,
    slug: s.slug,
    title: s.title,
    tone: s.tone,
    versionLabel: s.versionLabel,
  };
}

interface LandingShellProps {
  staticSkills?: LandingSkillRow[];
  mcps: LandingMcpRow[];
  automations: AutomationSummary[];
}

export function LandingShell({
  staticSkills,
  mcps,
  automations,
}: LandingShellProps) {
  const normalizedSkills = (staticSkills ?? []).map(normalizeStaticSkill);

  return (
    <div className="relative min-h-screen bg-paper text-ink">
      <SiteHeader variant="landing" overlay />

      {/* ── HERO ── */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0">
          <GrainShader />
          <div className="hero-fade absolute inset-0" />
        </div>

        {/* Hero – centered stack */}
        <div className="relative z-10 mx-auto max-w-[1100px] px-6 pb-16 pt-[min(14vh,140px)] text-center lg:pt-[min(20vh,200px)]">
          <div className="grid gap-7" data-motion="hero">
            <div className="grid gap-5">
              {/*
                Headline lives in its own wider column than the body copy so
                "Skills that evolve on their own." can hold one line on
                desktop. text-balance kicks in only when the viewport is
                narrow enough to force a wrap.
              */}
              <h1 className="mx-auto max-w-[1040px] text-balance font-serif text-[clamp(2.6rem,5.4vw,3.8rem)] font-medium leading-[1.04] tracking-[-0.045em] text-ink">
                Skills that{" "}
                <span className="text-accent">evolve on their own.</span>
              </h1>

              <p className="mx-auto max-w-[34rem] text-balance text-[1.1rem] leading-[1.7] text-ink/55">
                Loop autonomously monitors, evaluates, and updates your agent
                playbooks, so every skill evolves on its own.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <LinkButton href={SIGN_UP_PATH} variant="primary">
                Get started free
              </LinkButton>
              <LinkButton href="#skills" variant="ghost">
                Browse skills
              </LinkButton>
            </div>
          </div>

          {/* Proof strip */}
          {/*
          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.72rem] font-medium tabular-nums text-white/25"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <span>142+ skills tracked</span>
            <span className="hidden h-3 w-px bg-white/10 sm:block" />
            <span>2,400+ updates shipped</span>
            <span className="hidden h-3 w-px bg-white/10 sm:block" />
            <span>23 MCP providers</span>
          </motion.div>
          */}
        </div>

        {/* 3D diff card field */}
        <div className="relative z-10 px-6 pb-16" data-motion="hero-card">
          <HeroDiffField />
        </div>

        <div className="relative z-10 mx-auto max-w-[1100px] px-6">
          <div className="h-px w-full bg-line" />
        </div>
      </section>

      {/* ── LIVE SKILLS ── */}
      <section
        className="relative z-10 scroll-mt-20"
        data-motion="section"
        id="skills"
      >
        <div className="mx-auto max-w-[1100px] px-6 pb-16 pt-14">
          <div className="mb-8 grid gap-2">
            <h2 className="font-serif text-[clamp(1.4rem,2.6vw,2rem)] font-medium leading-[1.12] tracking-[-0.03em]">
              Every skill, always current
            </h2>
          </div>

          <div className="grid gap-0">
            {normalizedSkills.map((skill) => (
              <article
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-line py-3.5 first:border-t-0 first:pt-0 max-sm:grid-cols-1"
                key={skill.slug}
              >
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <SkillIcon
                      className="rounded-md"
                      iconUrl={skill.iconUrl}
                      size={24}
                      slug={skill.slug}
                    />
                    <StatusDot tone={skill.tone} />
                    <span className="truncate font-serif text-[0.94rem] font-medium text-ink">
                      {skill.title}
                    </span>
                    <Badge
                      color={getTagColorForCategory(
                        skill.category as CategorySlug
                      )}
                      size="sm"
                    >
                      {formatTagLabel(skill.category)}
                    </Badge>
                    <Badge color="neutral" size="sm">
                      {skill.versionLabel}
                    </Badge>
                  </div>
                  <p className="m-0 mt-1 line-clamp-1 text-sm text-ink-soft">
                    {skill.description}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-ink-faint">
                    <span>{skill.ownerName}</span>
                    <span>·</span>
                    <span className="tabular-nums">{skill.relativeTime}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 max-sm:pl-0">
                  <LinkButton href={skill.href} size="sm" variant="ghost">
                    Open
                  </LinkButton>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6">
            <LinkButton href={SIGN_UP_PATH} variant="ghost">
              See all skills
            </LinkButton>
          </div>
        </div>

        <div className="mx-auto max-w-[1100px] px-6">
          <div className="h-px w-full bg-line" />
        </div>
      </section>

      {/* ── AUTOMATION CALENDAR + MCP GRID ── */}
      <section
        className="relative z-10 scroll-mt-20"
        data-motion="section"
        id="mcps"
      >
        <div className="mx-auto max-w-[1100px] px-6 pb-16 pt-14">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-0">
            {/* Left: Calendar */}
            <div className="lg:border-r lg:border-line lg:pr-8">
              <div className="mb-6 grid gap-2">
                <h2 className="font-serif text-[clamp(1.3rem,2.2vw,1.7rem)] font-medium leading-[1.12] tracking-[-0.03em]">
                  Scheduled intelligence
                </h2>
                <p className="max-w-[26rem] text-sm leading-[1.65] text-ink-soft">
                  Every dot is an automated agent run – skills refresh
                  themselves on a schedule you control.
                </p>
              </div>
              <AutomationCalendar
                automations={automations}
                maxLegendRows={5}
                variant="sidebar"
              />
            </div>

            {/* Right: MCP list */}
            <div className="lg:pl-8">
              <div className="mb-6 grid gap-2">
                <h2 className="font-serif text-[clamp(1.3rem,2.2vw,1.7rem)] font-medium leading-[1.12] tracking-[-0.03em]">
                  Connect any tool
                </h2>
                <p className="max-w-[26rem] text-sm leading-[1.65] text-ink-soft">
                  Import from the open MCP ecosystem – Loop versions everything
                  alongside your skills.
                </p>
              </div>
              <div className="grid gap-1.5">
                {mcps.map((mcp) => (
                  <div
                    className="group flex items-start gap-3 border border-line bg-paper-2/50 p-3 transition-colors hover:border-accent/25 hover:bg-paper-2"
                    key={mcp.id}
                  >
                    <McpIcon
                      className="mt-0.5 shrink-0 rounded-md"
                      iconUrl={mcp.iconUrl}
                      name={mcp.name}
                      size={28}
                    />
                    <div className="min-w-0 flex-1 grid gap-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-ink">
                          {mcp.name}
                        </span>
                        <Badge
                          color={getTagColorForTransport(mcp.transport)}
                          size="sm"
                        >
                          {mcp.transport}
                        </Badge>
                      </div>
                      <p className="m-0 truncate text-xs text-ink-faint">
                        {mcp.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1100px] px-6">
          <div className="h-px w-full bg-line" />
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section className="relative z-10" data-motion="section">
        <div className="mx-auto grid max-w-[680px] place-items-center gap-6 px-6 pb-20 pt-16 text-center">
          <div className="grid gap-4">
            <LoopLogo className="mx-auto h-10 w-10 text-accent" />
            <h2 className="font-serif text-[clamp(1.4rem,2.4vw,2rem)] font-medium tracking-[-0.03em]">
              Start keeping skills fresh
            </h2>
            <p className="mx-auto max-w-[30rem] text-[0.95rem] leading-[1.7] text-ink-soft">
              Set up in minutes. Connect your repos, import skills and MCP
              servers, and let Loop handle the rest.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <LinkButton href={SIGN_UP_PATH} variant="primary">
              Get started free
            </LinkButton>
            <LinkButton href={SIGN_IN_PATH} variant="ghost">
              Sign in
            </LinkButton>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="h-px w-full bg-line" />
      </div>
      <footer className="relative z-10 px-6 py-6">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-x-4 gap-y-3 max-sm:justify-center max-sm:text-center">
          <p className="m-0 text-[0.62rem] tabular-nums text-ink-faint">
            © {new Date().getFullYear()} Loop · Operator desk for agent skills
          </p>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.62rem] max-sm:justify-center">
            <Link
              className="text-ink-faint transition-colors hover:text-ink"
              href={SIGN_UP_PATH}
            >
              Get started
            </Link>
            <Link
              className="text-ink-faint transition-colors hover:text-ink"
              href="#skills"
            >
              Skills
            </Link>
            <Link
              className="text-ink-faint transition-colors hover:text-ink"
              href="#mcps"
            >
              MCPs
            </Link>
            <Link
              className="text-ink-faint transition-colors hover:text-ink"
              href="/faq"
            >
              FAQ
            </Link>
            <Link
              className="text-ink-faint transition-colors hover:text-ink"
              href="/privacy"
            >
              Privacy
            </Link>
            <Link
              className="text-ink-faint transition-colors hover:text-ink"
              href="/terms"
            >
              Terms
            </Link>
            <Link
              className="text-ink-faint transition-colors hover:text-ink"
              href={SIGN_IN_PATH}
            >
              Sign in
            </Link>
            <a
              className="text-ink-faint transition-colors hover:text-ink"
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
            >
              <GitHubIcon className="size-3" />
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
