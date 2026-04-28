"use client";

import {
  Clipboard,
  CopyIcon,
  ExternalLinkIcon,
  GitForkIcon,
  MoreHorizontalIcon,
  PlusIcon,
  PlugIcon,
  TerminalIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ActiveOperationBanner } from "@/components/active-operation-banner";
import {
  ActivityDashboard,
  shouldShowActivityDashboard,
} from "@/components/activity-dashboard";
import { AppGridShell } from "@/components/app-grid-shell";
import { AutomationEditModal } from "@/components/automation-edit-modal";
import {
  ArrowRightIcon,
  AutomationIcon,
  CheckIcon,
  SearchIcon,
} from "@/components/frontier-icons";
import { RelativeTime } from "@/components/relative-time";
import { SiteHeader } from "@/components/site-header";
import { SkillAuthorBadge } from "@/components/skill-author-badge";
import { SkillMetaBar } from "@/components/skill-meta-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/ui/empty-card";
import { textFieldSearch } from "@/components/ui/field";
import { FilterChip } from "@/components/ui/filter-chip";
import { LinkButton } from "@/components/ui/link-button";
import { PageShell } from "@/components/ui/page-shell";
import { Pagination, paginate } from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";
import { McpIcon, SkillIcon } from "@/components/ui/skill-icon";
import { StatusDot } from "@/components/ui/status-dot";
import { Tip } from "@/components/ui/tip";
import { UsageComparisonProvider } from "@/components/usage-comparison-context";
import { cn } from "@/lib/cn";
import type { RecentImportItem } from "@/lib/db/recent-imports";
import { buildMcpVersionHref } from "@/lib/format";
import { computeFreshness } from "@/lib/freshness";
import { supportsSandboxMcp } from "@/lib/mcp-utils";
import { formatNextRun } from "@/lib/schedule";
import { getSiteUrlString } from "@/lib/seo";
import {
  formatTagLabel,
  getTagColorForCategory,
  getTagColorForTransport,
} from "@/lib/tag-utils";
import type {
  AutomationSummary,
  CategoryDefinition,
  ImportedMcpDocument,
  LoopRunSummary,
  SkillRecord,
} from "@/lib/types";
import { pageHeaderSub, pageInsetPadX, pageInsetPadY } from "@/lib/ui-layout";
import type { UsageOverview } from "@/lib/usage";

type HomeTab = "skills" | "mcps";

interface HomeShellProps {
  automations: AutomationSummary[];
  categories: CategoryDefinition[];
  currentUserId?: string;
  mcps: ImportedMcpDocument[];
  recentImports: RecentImportItem[];
  skills: SkillRecord[];
  loopRuns: LoopRunSummary[];
  usageOverview: UsageOverview;
}

function filterSkills(
  skills: SkillRecord[],
  query: string,
  categoryFilter: string,
  currentUserId?: string
): SkillRecord[] {
  const normalized = query.trim().toLowerCase();

  return skills
    .filter((s) =>
      categoryFilter === "all" ? true : s.category === categoryFilter
    )
    .filter((s) => {
      if (!normalized) {
        return true;
      }
      const haystack = [s.title, s.description, s.category, ...s.tags]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    })
    .toSorted((a, b) => {
      const aIsOwn =
        currentUserId && a.creatorClerkUserId === currentUserId ? 1 : 0;
      const bIsOwn =
        currentUserId && b.creatorClerkUserId === currentUserId ? 1 : 0;
      if (aIsOwn !== bIsOwn) {
        return bIsOwn - aIsOwn;
      }

      const featuredDelta = (b.featuredRank ?? 0) - (a.featuredRank ?? 0);
      if (featuredDelta !== 0) {
        return featuredDelta;
      }

      const qualityDelta = (b.qualityScore ?? 0) - (a.qualityScore ?? 0);
      if (qualityDelta !== 0) {
        return qualityDelta;
      }

      if (a.featured !== b.featured) {
        return a.featured ? -1 : 1;
      }

      return +new Date(b.updatedAt) - +new Date(a.updatedAt);
    });
}

const MCP_TAG_GROUPS = [
  "all",
  "official",
  "database",
  "search",
  "browser",
  "productivity",
  "developer-tools",
  "infra",
  "ai",
  "security",
  "utility",
] as const;

function filterMcps(
  mcps: ImportedMcpDocument[],
  query: string,
  tagFilter: string
): ImportedMcpDocument[] {
  const normalized = query.trim().toLowerCase();
  return mcps
    .filter((m) => {
      if (tagFilter === "all") {
        return true;
      }
      return m.tags.some((t) => t === tagFilter || t.includes(tagFilter));
    })
    .filter((m) => {
      if (!normalized) {
        return true;
      }
      const haystack = [m.name, m.description, ...m.tags]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    })
    .toSorted((a, b) => {
      const sandboxDelta =
        Number(supportsSandboxMcp(b)) - Number(supportsSandboxMcp(a));
      if (sandboxDelta !== 0) {
        return sandboxDelta;
      }

      const verificationRank = (
        status?: ImportedMcpDocument["verificationStatus"]
      ) => {
        switch (status) {
          case "verified": {
            return 3;
          }
          case "partial": {
            return 2;
          }
          case "unverified": {
            return 1;
          }
          case "broken":
          default: {
            return 0;
          }
        }
      };

      const verificationDelta =
        verificationRank(b.verificationStatus) -
        verificationRank(a.verificationStatus);
      if (verificationDelta !== 0) {
        return verificationDelta;
      }

      return a.name.localeCompare(b.name);
    });
}

const SKILLS_PER_PAGE = 30;

export function HomeShell({
  automations,
  categories,
  currentUserId,
  mcps = [],
  recentImports = [],
  skills,
  loopRuns,
  usageOverview,
}: HomeShellProps) {
  const router = useRouter();
  const [tab, setTab] = useState<HomeTab>("skills");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [mcpTagFilter, setMcpTagFilter] = useState("all");
  const deferredQuery = useDeferredValue(query);
  const [skillPage, setSkillPage] = useState(1);
  const [mcpPage, setMcpPage] = useState(1);
  const listAnchorRef = useRef<HTMLDivElement>(null);
  const [editTarget, setEditTarget] = useState<AutomationSummary | null>(null);
  const [loadingSlugs, setLoadingSlugs] = useState<Set<string>>(
    () => new Set()
  );

  const markLoading = useCallback((slug: string) => {
    setLoadingSlugs((prev) => new Set(prev).add(slug));
  }, []);

  const clearLoading = useCallback((slug: string) => {
    setLoadingSlugs((prev) => {
      const next = new Set(prev);
      next.delete(slug);
      return next;
    });
  }, []);

  const automationBySkillSlug = useMemo(() => {
    const map = new Map<string, AutomationSummary>();
    for (const a of automations) {
      for (const slug of a.matchedSkillSlugs) {
        if (!map.has(slug)) {
          map.set(slug, a);
        }
      }
    }
    return map;
  }, [automations]);

  const skillMap = useMemo(() => {
    const map = new Map<string, SkillRecord>();
    for (const s of skills) {
      map.set(s.slug, s);
    }
    return map;
  }, [skills]);

  useEffect(() => {
    const saved = window.localStorage.getItem("loop.home.filter");
    if (saved) {
      setCategoryFilter(saved);
    }
    const savedTab = window.localStorage.getItem(
      "loop.home.tab"
    ) as HomeTab | null;
    if (savedTab === "skills" || savedTab === "mcps") {
      setTab(savedTab);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("loop.home.filter", categoryFilter);
  }, [categoryFilter]);

  useEffect(() => {
    window.localStorage.setItem("loop.home.tab", tab);
  }, [tab]);

  function switchTab(next: HomeTab) {
    setTab(next);
    setQuery("");
    setSkillPage(1);
    setMcpPage(1);
    if (next === "skills") {
      setMcpTagFilter("all");
    } else {
      setCategoryFilter("all");
    }
  }

  function handleSkillPageChange(page: number) {
    setSkillPage(page);
    listAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleMcpPageChange(page: number) {
    setMcpPage(page);
    listAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const filtered = useMemo(
    () => filterSkills(skills, deferredQuery, categoryFilter, currentUserId),
    [skills, deferredQuery, categoryFilter, currentUserId]
  );

  const filteredMcps = useMemo(
    () => filterMcps(mcps, deferredQuery, mcpTagFilter),
    [mcps, deferredQuery, mcpTagFilter]
  );

  const prevFilteredLen = useRef(filtered.length);
  const prevMcpLen = useRef(filteredMcps.length);
  useEffect(() => {
    if (filtered.length !== prevFilteredLen.current) {
      setSkillPage(1);
      prevFilteredLen.current = filtered.length;
    }
  }, [filtered.length]);
  useEffect(() => {
    if (filteredMcps.length !== prevMcpLen.current) {
      setMcpPage(1);
      prevMcpLen.current = filteredMcps.length;
    }
  }, [filteredMcps.length]);

  const paginatedSkills = useMemo(
    () => paginate(filtered, skillPage, SKILLS_PER_PAGE),
    [filtered, skillPage]
  );

  const paginatedMcps = useMemo(
    () => paginate(filteredMcps, mcpPage, SKILLS_PER_PAGE),
    [filteredMcps, mcpPage]
  );

  const mcpTagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of mcps) {
      for (const t of m.tags) {
        for (const group of MCP_TAG_GROUPS) {
          if (group !== "all" && (t === group || t.includes(group))) {
            counts.set(group, (counts.get(group) ?? 0) + 1);
          }
        }
      }
    }
    return counts;
  }, [mcps]);

  const trackedCount = skills.filter((s) => s.origin === "user").length;

  const ownSkills = useMemo(
    () =>
      currentUserId
        ? skills
            .filter((s) => s.creatorClerkUserId === currentUserId)
            .toSorted((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
        : [],
    [skills, currentUserId]
  );

  const userSkillSlugs = useMemo(
    () => new Set(ownSkills.map((s) => s.slug)),
    [ownSkills]
  );

  const handleNewSkill = useCallback(() => {
    window.dispatchEvent(new Event("loop:open-new-skill"));
  }, []);

  const handleFork = useCallback(
    async (slug: string) => {
      markLoading(slug);
      try {
        const res = await fetch("/api/skills/fork", {
          body: JSON.stringify({ slug }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        const data = await res.json();
        if (data.ok && data.href) {
          router.push(data.href);
          return;
        }
      } catch {
        /* silent */
      }
      clearLoading(slug);
    },
    [router, markLoading, clearLoading]
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of skills) {
      counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
    }
    return counts;
  }, [skills]);

  const showActivitySidebar = shouldShowActivityDashboard(
    usageOverview,
    automations,
    recentImports
  );

  const skillsList = (
    <div className="grid gap-0">
      {paginatedSkills.length > 0 ? (
        paginatedSkills.map((skill) => {
          const freshness = computeFreshness(skill, loopRuns);
          const isLoading = loadingSlugs.has(skill.slug);

          return (
            <article
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-line py-3 first:border-t-0 first:pt-0 max-sm:grid-cols-1 transition-opacity",
                isLoading && "animate-pulse pointer-events-none opacity-60"
              )}
              key={skill.slug}
            >
              <Link className="group min-w-0" href={skill.href}>
                <div className="flex items-start gap-2.5">
                  <SkillIcon
                    className="mt-0.5 rounded-md"
                    iconUrl={skill.iconUrl}
                    size={28}
                    slug={skill.slug}
                  />
                  <div className="min-w-0 grid flex-1 gap-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <Tip
                        content={
                          freshness.tone === "fresh"
                            ? "Recently updated"
                            : freshness.tone === "stale"
                              ? "Hasn't changed recently"
                              : "Unknown freshness"
                        }
                        side="top"
                      >
                        <span className="inline-flex items-center">
                          <StatusDot tone={freshness.tone} />
                        </span>
                      </Tip>
                      <span className="truncate font-serif text-[0.94rem] font-medium text-ink group-hover:text-ink-soft">
                        {skill.title}
                      </span>
                      <Badge
                        color={getTagColorForCategory(skill.category)}
                        size="sm"
                      >
                        {formatTagLabel(skill.category)}
                      </Badge>
                      <Badge color="neutral" size="sm">
                        {skill.versionLabel}
                      </Badge>
                      {skill.visibility === "private" && (
                        <Badge color="neutral" size="sm">
                          Private
                        </Badge>
                      )}
                      {userSkillSlugs.has(skill.slug) && (
                        <Badge color="orange" size="sm">
                          Yours
                        </Badge>
                      )}
                    </div>
                    <p className="m-0 line-clamp-1 text-sm text-ink-soft">
                      {skill.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[0.6875rem] text-ink-faint">
                      <SkillAuthorBadge
                        author={skill.author}
                        compact
                        linked={false}
                        ownerName={skill.ownerName}
                        iconUrl={skill.iconUrl}
                      />
                      <SkillMetaBar freshness={freshness} skill={skill} />
                    </div>
                  </div>
                </div>
              </Link>

              <div className="flex items-center gap-1.5 max-sm:pl-4">
                {skill.automation?.enabled &&
                  automationBySkillSlug.has(skill.slug) && (
                    <Tip content="View automation settings" side="top">
                      <Button
                        onClick={() =>
                          setEditTarget(automationBySkillSlug.get(skill.slug)!)
                        }
                        size="icon-sm"
                        variant="ghost"
                      >
                        <AutomationIcon className="h-3.5 w-3.5" />
                      </Button>
                    </Tip>
                  )}
                <LinkButton
                  className="h-7 min-h-7 px-2.5"
                  href={skill.href}
                  prefetch
                  size="sm"
                  variant="ghost"
                >
                  Open
                  <ArrowRightIcon className="h-3 w-3" />
                </LinkButton>
                <DropdownMenu>
                  <Tip content="More actions" side="top">
                    <DropdownMenuTrigger asChild>
                      <Button size="icon-sm" variant="ghost" type="button">
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </Tip>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={() => {
                        const siteUrl = getSiteUrlString();
                        const rawUrl = `${siteUrl}/api/skills/${skill.slug}/raw`;
                        const prompt = `Use the skill at ${rawUrl}`;
                        navigator.clipboard.writeText(prompt);
                      }}
                    >
                      <Clipboard />
                      Use in agent
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleFork(skill.slug)}>
                      <GitForkIcon />
                      Fork
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        const target = automationBySkillSlug.get(skill.slug);
                        if (target) {
                          setEditTarget(target);
                        } else {
                          router.push(`/skills/${skill.slug}#automation`);
                        }
                      }}
                    >
                      <AutomationIcon />
                      View automation
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        const fullUrl = `${window.location.origin}/skills/${skill.slug}`;
                        navigator.clipboard.writeText(fullUrl);
                      }}
                    >
                      <CopyIcon />
                      Copy link
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() =>
                        router.push(`/sandbox?skill=${skill.slug}`)
                      }
                    >
                      <TerminalIcon />
                      Open in sandbox
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() =>
                        window.open(`/skills/${skill.slug}`, "_blank")
                      }
                    >
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
        <EmptyCard icon={<SearchIcon className="h-6 w-6" />}>
          No skills match your search.
        </EmptyCard>
      )}
      <Pagination
        currentPage={skillPage}
        onPageChange={handleSkillPageChange}
        pageSize={SKILLS_PER_PAGE}
        totalItems={filtered.length}
      />
    </div>
  );

  const mcpsList = (
    <div className="grid gap-0">
      {paginatedMcps.length > 0 ? (
        paginatedMcps.map((mcp) => {
          const isRunnable = supportsSandboxMcp(mcp);
          const sandboxHref = `/sandbox?mcp=${encodeURIComponent(mcp.slug ?? mcp.name)}`;
          const mcpHref = buildMcpVersionHref(mcp.name, mcp.version);
          return (
            <article
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-line py-3 first:border-t-0 first:pt-0 max-sm:grid-cols-1"
              key={mcp.id}
            >
              <Link className="group min-w-0" href={mcpHref}>
                <div className="flex items-start gap-2.5">
                  <McpIcon
                    className="mt-0.5"
                    homepageUrl={mcp.homepageUrl}
                    iconUrl={mcp.iconUrl}
                    name={mcp.name}
                    size={28}
                  />
                  <div className="min-w-0 grid flex-1 gap-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <Tip
                        content={
                          isRunnable ? "Executable in sandbox" : "Metadata only"
                        }
                        side="top"
                      >
                        <span className="inline-flex items-center">
                          <span
                            className={cn(
                              "inline-block h-2 w-2 shrink-0 rounded-full",
                              isRunnable ? "bg-emerald-500" : "bg-ink-faint/40"
                            )}
                          />
                        </span>
                      </Tip>
                      <span className="truncate font-serif text-[0.94rem] font-medium text-ink group-hover:text-ink-soft">
                        {mcp.name}
                      </span>
                      <Badge
                        color={getTagColorForTransport(mcp.transport)}
                        size="sm"
                      >
                        {mcp.transport.toUpperCase()}
                      </Badge>
                      <Badge color="neutral" size="sm">
                        {mcp.versionLabel}
                      </Badge>
                    </div>
                    <p className="m-0 line-clamp-1 text-sm text-ink-soft">
                      {mcp.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink-faint">
                      {mcp.envKeys.length > 0 && (
                        <span>
                          {mcp.envKeys.length} env key
                          {mcp.envKeys.length !== 1 ? "s" : ""}
                        </span>
                      )}
                      {mcp.envKeys.length > 0 && mcp.tags.length > 0 && (
                        <span>·</span>
                      )}
                      {mcp.tags.slice(0, 3).map((t) => (
                        <Badge color="neutral" key={t} size="sm">
                          {formatTagLabel(t)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>

              <div className="flex items-center gap-1.5 max-sm:pl-4">
                <LinkButton href={mcpHref} prefetch size="sm" variant="ghost">
                  Open
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </LinkButton>
                <DropdownMenu>
                  <Tip content="More actions" side="top">
                    <DropdownMenuTrigger asChild>
                      <Button size="icon-sm" variant="ghost" type="button">
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </Tip>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={() =>
                        navigator.clipboard.writeText(mcp.manifestUrl)
                      }
                    >
                      <CopyIcon />
                      Copy manifest URL
                    </DropdownMenuItem>
                    {mcp.homepageUrl && (
                      <DropdownMenuItem
                        onSelect={() => window.open(mcp.homepageUrl, "_blank")}
                      >
                        <ExternalLinkIcon />
                        Open homepage
                      </DropdownMenuItem>
                    )}
                    {isRunnable ? (
                      <DropdownMenuItem
                        onSelect={() => router.push(sandboxHref)}
                      >
                        <TerminalIcon />
                        Open in sandbox
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </article>
          );
        })
      ) : (
        <EmptyCard icon={<PlugIcon className="h-6 w-6" />}>
          No MCPs match your search.
        </EmptyCard>
      )}
      <Pagination
        currentPage={mcpPage}
        onPageChange={handleMcpPageChange}
        pageSize={SKILLS_PER_PAGE}
        totalItems={filteredMcps.length}
      />
    </div>
  );

  const yourSkillsSection =
    ownSkills.length > 0 ? (
      <section className="grid gap-2">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-serif text-base font-medium text-ink">
            <UserIcon className="h-4 w-4 text-ink-faint" />
            Your Skills
            <span className="text-[0.6875rem] font-normal tabular-nums text-ink-faint">
              {ownSkills.length}
            </span>
          </h2>
          <Button
            className="h-7 min-h-7 gap-1.5 px-2.5 text-xs"
            onClick={handleNewSkill}
            size="sm"
            variant="ghost"
          >
            <PlusIcon className="h-3 w-3" />
            New
          </Button>
        </div>
        <div className="grid gap-0 rounded border border-line/60 bg-paper-2/40 px-3 dark:bg-paper-1/30">
          {ownSkills.map((skill) => {
            const auto = skill.automation;
            const hasAutomation = auto?.enabled && auto.status === "active";
            const nextRun =
              hasAutomation && auto.cadence !== "manual"
                ? formatNextRun(
                    auto.cadence,
                    auto.preferredHour ?? 9,
                    auto.preferredDay
                  )
                : null;
            return (
              <article
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-line/40 py-2.5 first:border-t-0 max-sm:grid-cols-1"
                key={`own-${skill.slug}`}
              >
                <Link className="group min-w-0" href={skill.href}>
                  <div className="flex items-start gap-2.5">
                    <SkillIcon
                      className="mt-0.5 rounded-md"
                      iconUrl={skill.iconUrl}
                      size={24}
                      slug={skill.slug}
                    />
                    <div className="min-w-0 grid flex-1 gap-0.5">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="truncate font-serif text-[0.875rem] font-medium text-ink group-hover:text-ink-soft">
                          {skill.title}
                        </span>
                        <Badge
                          color={getTagColorForCategory(skill.category)}
                          size="sm"
                        >
                          {formatTagLabel(skill.category)}
                        </Badge>
                        <Badge color="neutral" size="sm">
                          {skill.versionLabel}
                        </Badge>
                        {skill.visibility === "private" && (
                          <Badge color="neutral" size="sm">
                            Private
                          </Badge>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                        <p className="m-0 line-clamp-1 text-xs text-ink-soft">
                          {skill.description}
                        </p>
                        {hasAutomation && nextRun ? (
                          <span className="inline-flex shrink-0 items-center gap-1 text-[0.6875rem] text-ink-faint">
                            <AutomationIcon className="h-3 w-3" />
                            Next {nextRun}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-1.5 max-sm:pl-4">
                  {hasAutomation && automationBySkillSlug.has(skill.slug) && (
                    <Tip content="View automation settings" side="top">
                      <Button
                        onClick={() =>
                          setEditTarget(automationBySkillSlug.get(skill.slug)!)
                        }
                        size="icon-sm"
                        variant="ghost"
                      >
                        <AutomationIcon className="h-3.5 w-3.5" />
                      </Button>
                    </Tip>
                  )}
                  <LinkButton
                    className="h-6 min-h-6 px-2 text-xs"
                    href={skill.href}
                    prefetch
                    size="sm"
                    variant="ghost"
                  >
                    Open
                    <ArrowRightIcon className="h-3 w-3" />
                  </LinkButton>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    ) : null;

  const skillsFilters = (
    <div ref={listAnchorRef} className="grid gap-3">
      <label className="relative block">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
        <input
          className={textFieldSearch}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search skills..."
          value={query}
        />
      </label>

      <div
        className="flex flex-wrap gap-1"
        role="tablist"
        aria-label="Filter by category"
      >
        <FilterChip
          active={categoryFilter === "all"}
          onClick={() => setCategoryFilter("all")}
          type="button"
        >
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
            <span className="text-[0.65rem] opacity-60">
              {categoryCounts.get(cat.slug) ?? 0}
            </span>
          </FilterChip>
        ))}
      </div>

      <div className="text-[0.6875rem] font-medium tabular-nums tracking-wide text-ink-faint">
        {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        {filtered.length > SKILLS_PER_PAGE && (
          <span className="ml-1 text-ink-faint/60">
            · page {skillPage} of {Math.ceil(filtered.length / SKILLS_PER_PAGE)}
          </span>
        )}
      </div>

      {skillsList}
    </div>
  );

  const mcpsFilters = (
    <div className="grid gap-3">
      <label className="relative block">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
        <input
          className={textFieldSearch}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search MCPs..."
          value={query}
        />
      </label>

      <div
        className="flex flex-wrap gap-1"
        role="tablist"
        aria-label="Filter by tag"
      >
        {MCP_TAG_GROUPS.map((tag) => (
          <FilterChip
            active={mcpTagFilter === tag}
            key={tag}
            onClick={() => setMcpTagFilter(tag)}
            type="button"
          >
            {tag === "all"
              ? "All"
              : tag.charAt(0).toUpperCase() + tag.slice(1).replaceAll("-", " ")}
            {tag !== "all" && (
              <span className="text-[0.65rem] opacity-60">
                {mcpTagCounts.get(tag) ?? 0}
              </span>
            )}
          </FilterChip>
        ))}
      </div>

      <div className="text-[0.6875rem] font-medium tabular-nums tracking-wide text-ink-faint">
        {filteredMcps.length} result{filteredMcps.length !== 1 ? "s" : ""}
        {filteredMcps.length > SKILLS_PER_PAGE && (
          <span className="ml-1 text-ink-faint/60">
            · page {mcpPage} of{" "}
            {Math.ceil(filteredMcps.length / SKILLS_PER_PAGE)}
          </span>
        )}
      </div>

      {mcpsList}
    </div>
  );

  const executableMcpCount = mcps.filter((mcp) =>
    supportsSandboxMcp(mcp)
  ).length;

  const pageTitle = (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <h1 className="m-0 flex items-baseline gap-4 font-serif text-2xl font-medium tracking-[-0.03em]">
          <button
            className={cn(
              "transition-colors",
              tab === "skills"
                ? "text-ink"
                : "text-ink-faint hover:text-ink-soft"
            )}
            onClick={() => switchTab("skills")}
            type="button"
          >
            Skills
          </button>
          <button
            className={cn(
              "transition-colors",
              tab === "mcps" ? "text-ink" : "text-ink-faint hover:text-ink-soft"
            )}
            onClick={() => switchTab("mcps")}
            type="button"
          >
            MCPs
          </button>
        </h1>
        <Tip content="Raw JSON catalog for AI agents" side="bottom">
          <Link
            href="/api/skills/raw/all"
            target="_blank"
            rel="noreferrer"
            className="flex shrink-0 items-center gap-1.5 border border-line bg-paper-3 px-2.5 py-1.5 text-[0.6875rem] font-medium text-ink-soft transition-colors hover:border-accent/30 hover:text-ink dark:bg-paper-2"
          >
            <TerminalIcon className="h-3 w-3" />
            Agent catalog
          </Link>
        </Tip>
      </div>
      <p className={pageHeaderSub}>
        {tab === "skills" ? (
          <>
            <span className="tabular-nums">{skills.length}</span> in catalog ·{" "}
            <span className="tabular-nums">{trackedCount}</span> tracked
          </>
        ) : (
          <>
            <span className="tabular-nums">{mcps.length}</span> server
            {mcps.length !== 1 ? "s" : ""}
            {executableMcpCount > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400">
                {" "}
                · {executableMcpCount} executable
              </span>
            )}
          </>
        )}
      </p>
    </div>
  );

  const activeFilters = tab === "skills" ? skillsFilters : mcpsFilters;

  const hasOwnSkills = ownSkills.length > 0;
  const hasActiveAutomation = automations.some((a) => a.status === "ACTIVE");
  const showGettingStarted = !hasOwnSkills || !hasActiveAutomation;

  const gettingStartedCard = showGettingStarted ? (
    <section className="grid gap-0 overflow-hidden border border-line bg-paper-3/92">
      <div className="dither-gradient-orange px-4 pb-3 pt-4">
        <h2 className="m-0 text-base font-semibold tracking-tight text-ink">
          Get started with Loop
        </h2>
        <p className="m-0 mt-1 text-[0.8125rem] leading-relaxed text-ink-soft">
          Create a skill, then set up an automation to keep it current.
        </p>
      </div>
      <div className="grid divide-y divide-line/60">
        <div className="flex items-center gap-3 px-4 py-3">
          <span
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center border text-[0.625rem]",
              hasOwnSkills
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-line bg-paper-2 font-semibold tabular-nums text-ink-faint"
            )}
          >
            {hasOwnSkills ? <CheckIcon className="h-3 w-3" /> : "1"}
          </span>
          <div className="min-w-0 flex-1">
            <strong
              className={cn(
                "text-sm font-medium",
                hasOwnSkills ? "text-ink-soft line-through" : "text-ink"
              )}
            >
              Create your first skill
            </strong>
          </div>
          {!hasOwnSkills && (
            <Button
              className="h-7 min-h-7 gap-1.5 px-2.5 text-xs"
              onClick={handleNewSkill}
              size="sm"
              type="button"
              variant="ghost"
            >
              <PlusIcon className="h-3 w-3" />
              New skill
            </Button>
          )}
        </div>
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3",
            !hasOwnSkills && "opacity-40"
          )}
        >
          <span
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center border text-[0.625rem]",
              hasOwnSkills && hasActiveAutomation
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-line bg-paper-2 font-semibold tabular-nums text-ink-faint"
            )}
          >
            {hasOwnSkills && hasActiveAutomation ? (
              <CheckIcon className="h-3 w-3" />
            ) : (
              "2"
            )}
          </span>
          <div className="min-w-0 flex-1">
            <strong
              className={cn(
                "text-sm font-medium",
                hasOwnSkills && hasActiveAutomation
                  ? "text-ink-soft line-through"
                  : "text-ink"
              )}
            >
              Set up your first automation
            </strong>
            {!(hasOwnSkills && hasActiveAutomation) && (
              <span className="ml-1.5 text-xs text-ink-faint">
                {hasOwnSkills
                  ? "from any skill page or the automation desk"
                  : "create a skill first"}
              </span>
            )}
          </div>
          {hasOwnSkills && !hasActiveAutomation && (
            <Button
              className="h-7 min-h-7 gap-1.5 px-2.5 text-xs"
              onClick={() =>
                window.dispatchEvent(new Event("loop:open-new-automation"))
              }
              size="sm"
              type="button"
              variant="ghost"
            >
              <AutomationIcon className="h-3 w-3" />
              New automation
            </Button>
          )}
        </div>
      </div>
    </section>
  ) : null;

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
                <header className="min-w-0">{pageTitle}</header>
                <ActiveOperationBanner />
                {gettingStartedCard}
                {tab === "skills" && yourSkillsSection}
                {activeFilters}
              </div>

              <aside
                aria-label="Activity insights"
                className={cn(
                  "flex min-h-0 w-full flex-col gap-4 overflow-y-auto border-t border-line lg:w-[min(360px,36vw)] lg:max-w-[360px] lg:min-w-[280px] lg:shrink-0 lg:border-t-0",
                  pageInsetPadX,
                  pageInsetPadY
                )}
              >
                <ActivityDashboard
                  automations={automations}
                  loopRuns={loopRuns}
                  overview={usageOverview}
                  recentImports={recentImports}
                  skillMap={skillMap}
                  userSkillSlugs={userSkillSlugs}
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
            <header className="min-w-0">{pageTitle}</header>
            <ActiveOperationBanner />
            {gettingStartedCard}
            {tab === "skills" && yourSkillsSection}
            <div className="grid min-w-0 gap-4">{activeFilters}</div>
          </div>
        )}
      </PageShell>

      {editTarget &&
        (() => {
          const linkedSkill = skills.find((s) =>
            editTarget.matchedSkillSlugs.includes(s.slug)
          );
          return (
            <AutomationEditModal
              automation={editTarget}
              initialPreferredHour={editTarget.preferredHour}
              onClose={() => setEditTarget(null)}
              open
              skillCategory={linkedSkill?.category}
              skillIconUrl={linkedSkill?.iconUrl}
              skillName={linkedSkill?.title}
              skillSlug={linkedSkill?.slug}
              sources={linkedSkill?.sources}
            />
          );
        })()}
    </AppGridShell>
  );
}
