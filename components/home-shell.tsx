"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { CopyIcon, ExternalLinkIcon, MoreHorizontalIcon, TerminalIcon } from "lucide-react";

import {
  ActivityDashboard,
  shouldShowActivityDashboard,
} from "@/components/activity-dashboard";
import { UsageComparisonProvider } from "@/components/usage-comparison-context";
import { AppGridShell } from "@/components/app-grid-shell";
import { ArrowRightIcon, SearchIcon } from "@/components/frontier-icons";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { EmptyCard } from "@/components/ui/empty-card";
import { FilterChip } from "@/components/ui/filter-chip";
import { PageShell } from "@/components/ui/page-shell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";
import { StatusDot } from "@/components/ui/status-dot";
import { Button } from "@/components/ui/button";
import { textFieldSearch } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { computeFreshness } from "@/lib/freshness";
import { pageHeaderSub, pageInsetPadX, pageInsetPadY } from "@/lib/ui-layout";
import { RelativeTime } from "@/components/relative-time";
import type {
  AutomationSummary,
  CategoryDefinition,
  ImportedMcpDocument,
  LoopRunRecord,
  SkillRecord
} from "@/lib/types";
import type { UsageOverview } from "@/lib/usage";

type HomeShellProps = {
  automations: AutomationSummary[];
  categories: CategoryDefinition[];
  mcps: ImportedMcpDocument[];
  skills: SkillRecord[];
  loopRuns: LoopRunRecord[];
  usageOverview: UsageOverview;
};

function filterSkills(
  skills: SkillRecord[],
  query: string,
  categoryFilter: string
): SkillRecord[] {
  const normalized = query.trim().toLowerCase();

  return skills
    .filter((s) => (categoryFilter === "all" ? true : s.category === categoryFilter))
    .filter((s) => {
      if (!normalized) return true;
      const haystack = [s.title, s.description, s.category, ...s.tags]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    })
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

function originLabel(skill: SkillRecord): string {
  if (skill.origin === "user") {
    return skill.automation?.enabled ? "auto" : "tracked";
  }
  return skill.origin === "remote" ? "imported" : "catalog";
}

export function HomeShell({ automations, categories, mcps = [], skills, loopRuns, usageOverview }: HomeShellProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    const saved = window.localStorage.getItem("loop.home.filter");
    if (saved) setCategoryFilter(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("loop.home.filter", categoryFilter);
  }, [categoryFilter]);

  const filtered = useMemo(
    () => filterSkills(skills, deferredQuery, categoryFilter),
    [skills, deferredQuery, categoryFilter]
  );

  const trackedCount = skills.filter((s) => s.origin === "user").length;

  const handleNewSkill = useCallback(() => {
    window.dispatchEvent(new Event("loop:open-new-skill"));
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of skills) {
      counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
    }
    return counts;
  }, [skills]);

  const showActivitySidebar = shouldShowActivityDashboard(usageOverview, automations);

  const skillsList = (
    <div className="grid gap-0">
      {filtered.length > 0 ? (
        filtered.map((skill) => {
          const freshness = computeFreshness(skill, loopRuns);
          const summary = skill.updates?.[0]?.whatChanged ?? skill.description;

          return (
            <article
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-line py-3 first:border-t-0 first:pt-0 max-sm:grid-cols-1"
              key={skill.slug}
            >
              <Link className="group min-w-0" href={skill.href}>
                <div className="flex items-start gap-2">
                  <StatusDot className="mt-[0.35rem]" tone={freshness.tone} />
                  <div className="min-w-0 grid flex-1 gap-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="truncate font-serif text-[0.94rem] font-medium text-ink group-hover:text-ink-soft">
                        {skill.title}
                      </span>
                      <Badge>{skill.category}</Badge>
                      <Badge muted>{skill.versionLabel}</Badge>
                    </div>
                    <p className="m-0 line-clamp-1 text-sm text-ink-soft">{summary}</p>
                    <span className="text-xs text-ink-faint">
                      <RelativeTime date={skill.updatedAt} /> · {originLabel(skill)} · {freshness.label}
                    </span>
                  </div>
                </div>
              </Link>

              <div className="flex items-center gap-1.5 max-sm:pl-4">
                <Button onClick={() => router.push(skill.href)} size="sm" variant="ghost">
                  Open
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon-sm" variant="ghost" type="button">
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => navigator.clipboard.writeText(skill.href)}>
                      <CopyIcon />
                      Copy link
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => router.push(`/sandbox?skill=${skill.slug}`)}>
                      <TerminalIcon />
                      Open in sandbox
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => window.open(skill.href, "_blank")}>
                      <ExternalLinkIcon />
                      Open in new tab
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </article>
          );
        })
      ) : (
        <EmptyCard icon={<SearchIcon className="h-6 w-6" />}>No skills match your search.</EmptyCard>
      )}
    </div>
  );

  const skillsFilters = (
    <div className="grid gap-3">
      <label className="relative block">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
        <input
          className={textFieldSearch}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search skills..."
          value={query}
        />
      </label>

      <div className="flex flex-wrap gap-1" role="tablist" aria-label="Filter by category">
        <FilterChip active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")} type="button">
          All
        </FilterChip>
        {categories.map((cat) => (
          <FilterChip
            active={categoryFilter === cat.slug}
            key={cat.slug}
            onClick={() => setCategoryFilter(cat.slug)}
            type="button"
          >
            {cat.title}
            <span className="text-[0.65rem] opacity-60">{categoryCounts.get(cat.slug) ?? 0}</span>
          </FilterChip>
        ))}
      </div>

      <div className="text-[0.6875rem] font-medium tabular-nums tracking-wide text-ink-faint">
        {filtered.length} result{filtered.length !== 1 ? "s" : ""}
      </div>

      {skillsList}
    </div>
  );

  const executableMcpCount = mcps.filter(
    (m) => m.transport === "stdio" || m.transport === "http"
  ).length;

  const pageTitleSkills = (
    <div className="grid gap-2">
      <h1 className="m-0 font-serif text-2xl font-medium tracking-[-0.03em] text-ink">Skills</h1>
      <p className={pageHeaderSub}>
        <span className="tabular-nums">{skills.length}</span> in catalog ·{" "}
        <span className="tabular-nums">{trackedCount}</span> tracked ·{" "}
        <span className="tabular-nums">{mcps.length}</span> MCP{mcps.length !== 1 ? "s" : ""}
        {executableMcpCount > 0 && (
          <span className="text-emerald-600 dark:text-emerald-400">
            {" "}({executableMcpCount} executable)
          </span>
        )}
      </p>
    </div>
  );

  return (
    <AppGridShell header={<SiteHeader onNewSkill={handleNewSkill} />}>
      <PageShell inset narrow className="flex min-h-0 flex-1 flex-col">
        {showActivitySidebar ? (
          <UsageComparisonProvider>
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <div
              className={cn(
                "flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto border-line lg:border-r",
                pageInsetPadX,
                pageInsetPadY
              )}
            >
              <header className="min-w-0">{pageTitleSkills}</header>
              {skillsFilters}
            </div>

            <aside
              aria-label="Activity insights"
              className={cn(
                "flex min-h-0 w-full flex-col gap-4 overflow-y-auto border-t border-line lg:w-[min(360px,36vw)] lg:max-w-[360px] lg:min-w-[280px] lg:shrink-0 lg:border-t-0",
                pageInsetPadX,
                pageInsetPadY
              )}
            >
              <header className="min-w-0">
                <h2 className="m-0 font-serif text-2xl font-medium tracking-[-0.03em] text-ink">
                  Activity
                </h2>
              </header>
              <ActivityDashboard
                automations={automations}
                overview={usageOverview}
                variant="sidebar"
              />
            </aside>
          </div>
          </UsageComparisonProvider>
        ) : (
          <div
            className={cn(
              "grid min-h-0 flex-1 gap-4 overflow-y-auto",
              pageInsetPadX,
              pageInsetPadY
            )}
          >
            <header className="min-w-0">{pageTitleSkills}</header>
            <div className="grid min-w-0 gap-4">{skillsFilters}</div>
          </div>
        )}
      </PageShell>
    </AppGridShell>
  );
}
