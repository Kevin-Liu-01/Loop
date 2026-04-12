import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { AppGridShell } from "@/components/app-grid-shell";
import { BuySkillButton } from "@/components/buy-skill-button";
import { CopyButton } from "@/components/copy-button";
import { DeleteSkillButton } from "@/components/delete-skill-button";
import { DownloadSkillButton } from "@/components/download-skill-button";
import { ExpandableContent } from "@/components/expandable-content";
import { ForkSkillButton } from "@/components/fork-skill-button";
import { FileCodeIcon, GlobeIcon, PlayIcon } from "@/components/frontier-icons";
import { ShareButton } from "@/components/share-button";
import { SiteHeader } from "@/components/site-header";
import { SkillActivitySection } from "@/components/skill-activity-section";
import { SkillAgentDocsPanel } from "@/components/skill-agent-docs-panel";
import { SkillAuthorBadge } from "@/components/skill-author-badge";
import { SkillAuthorStudio } from "@/components/skill-author-studio";
import { SkillDetailSidebar } from "@/components/skill-detail-sidebar";
import { SkillResearchPanel } from "@/components/skill-research-panel";
import { SkillSectionNav } from "@/components/skill-section-nav";
import type { SectionTab } from "@/components/skill-section-nav";
import { SkillVisibilityToggle } from "@/components/skill-visibility-toggle";
import { TrackSkillButton } from "@/components/track-skill-button";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { SkillIcon } from "@/components/ui/skill-icon";
import { UsageBeacon } from "@/components/usage-beacon";
import { VersionSwitcher } from "@/components/version-switcher";
import { cn } from "@/lib/cn";
import { formatRelativeDate } from "@/lib/format";
import { getSiteUrlString } from "@/lib/seo";
import { buildSkillAutomationSummaries } from "@/lib/skill-automations";
import {
  formatTagLabel,
  getTagColorForCategory,
  getTagColorForOrigin,
} from "@/lib/tag-utils";
import { diffMultilineText } from "@/lib/text-diff";
import type { CategoryBrief, LoopRunRecord, SkillRecord } from "@/lib/types";
import { pageInsetPadX } from "@/lib/ui-layout";
import { buildUpdateDigest } from "@/lib/update-digest";
import type { SkillUsageSummary } from "@/lib/usage";

const SITE_URL = getSiteUrlString();

interface SkillDetailPageProps {
  skill: SkillRecord;
  brief?: CategoryBrief;
  previousSkill?: SkillRecord | null;
  latestRun?: LoopRunRecord | null;
  usage: SkillUsageSummary;
  purchased?: boolean;
  canEdit?: boolean;
  isSignedIn?: boolean;
  timeZone?: string;
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { currency, style: "currency" }).format(
    amount / 100
  );
}

export function SkillDetailPage({
  skill,
  brief,
  previousSkill,
  latestRun,
  usage,
  purchased = false,
  canEdit = false,
  isSignedIn = false,
  timeZone,
}: SkillDetailPageProps) {
  const isPaid = skill.price && skill.price.amount > 0;
  const priceLabel = isPaid
    ? formatPrice(skill.price!.amount, skill.price!.currency)
    : null;
  const rawUrl = `${SITE_URL}/api/skills/${skill.slug}/raw`;
  const rawUrlVersioned =
    skill.version > 1 ? `${rawUrl}?v=${skill.version}` : rawUrl;
  const primaryAgentPrompt = `Use the skill at ${rawUrl}`;
  const downloadFilename = `${skill.slug}-v${skill.version}.md`;
  const trackedSources =
    skill.origin === "user" ? (skill.sources ?? []) : skill.references;
  const attachedAutomations = buildSkillAutomationSummaries(skill);
  const primaryAutomation = attachedAutomations[0];
  const latestUpdate = skill.updates?.[0];

  const sourceCount =
    skill.origin === "user"
      ? (skill.sources ?? []).length
      : skill.origin === "remote"
        ? (skill.sources ?? skill.references).length
        : 0;
  const visibleChangedSections =
    latestUpdate?.changedSections ?? latestRun?.changedSections ?? [];

  const updateDigestDiff =
    latestUpdate || previousSkill?.updates?.[0]
      ? diffMultilineText(
          buildUpdateDigest(previousSkill?.updates?.[0]),
          buildUpdateDigest(latestUpdate)
        )
      : [];
  const rawDiff =
    updateDigestDiff.length > 0
      ? updateDigestDiff
      : previousSkill
        ? diffMultilineText(previousSkill.body, skill.body)
        : [];
  const diffLines = rawDiff.length > 80 ? rawDiff.slice(0, 80) : rawDiff;

  const hasAgentDocs = Object.values(skill.agentDocs ?? {}).some(
    (content) => typeof content === "string" && content.trim().length > 0
  );
  const hasResearch =
    !!skill.researchProfile ||
    (skill.sources ?? []).length > 0 ||
    (skill.upstreams?.length ?? 0) > 0;

  const sectionTabs: SectionTab[] = [
    ...(canEdit ? [{ id: "author-studio", label: "Studio" }] : []),
    { id: "content", label: "Content" },
    ...(hasAgentDocs ? [{ id: "agent-docs", label: "Agent docs" }] : []),
    { id: "activity", label: "Activity" },
    ...(hasResearch ? [{ id: "research", label: "Research" }] : []),
    ...(trackedSources.length > 0 ? [{ id: "sources", label: "Sources" }] : []),
  ];

  return (
    <AppGridShell header={<SiteHeader />}>
      <UsageBeacon
        categorySlug={skill.category}
        dedupeKey={`page:${skill.href}`}
        kind="page_view"
        label="Opened skill detail"
        path={skill.href}
        skillSlug={skill.slug}
      />
      <PageShell inset className="flex min-h-0 flex-1 flex-col">
        {/* ── Header ── */}
        <div
          className={cn("shrink-0 border-b border-line py-4", pageInsetPadX)}
        >
          <header className="grid gap-4">
            <Link
              className="w-fit text-xs font-medium text-ink-faint transition-colors hover:text-ink"
              href="/"
            >
              &larr; Back to skills
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <Badge color={getTagColorForCategory(skill.category)}>
                {formatTagLabel(skill.category)}
              </Badge>
              <Badge color={getTagColorForOrigin(skill.origin)}>
                {formatTagLabel(skill.origin)}
              </Badge>
              <Badge color="neutral">{skill.versionLabel}</Badge>
              {priceLabel ? (
                <Badge color="green">{priceLabel}</Badge>
              ) : (
                <Badge color="neutral">Free</Badge>
              )}
              <SkillVisibilityToggle
                canEdit={canEdit}
                currentVisibility={skill.visibility}
                slug={skill.slug}
              />
              {skill.forkedFromSlug && (
                <Badge color="purple">Forked from {skill.forkedFromSlug}</Badge>
              )}
            </div>

            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <SkillIcon
                className="rounded-lg"
                iconUrl={skill.iconUrl}
                size={36}
                slug={skill.slug}
              />
              <h1 className="m-0 font-serif text-2xl font-medium tracking-[-0.03em] text-ink wrap-break-word">
                {skill.title}
              </h1>
              <ShareButton href={skill.href} />
              {skill.availableVersions.length > 1 && (
                <VersionSwitcher
                  className="ml-auto"
                  currentVersion={skill.version}
                  slug={skill.slug}
                  versions={skill.availableVersions}
                />
              )}
            </div>
            <p className="m-0 max-w-[min(100%,52ch)] text-pretty text-sm leading-relaxed text-ink-muted wrap-break-word">
              {skill.description}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <SkillAuthorBadge
                author={skill.author}
                ownerName={skill.ownerName}
                iconUrl={skill.iconUrl}
              />
              <span className="text-xs tabular-nums text-ink-faint">
                {trackedSources.length} sources · Updated{" "}
                {formatRelativeDate(skill.updatedAt, timeZone)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isPaid && priceLabel ? (
                <BuySkillButton
                  priceLabel={priceLabel}
                  purchased={purchased}
                  slug={skill.slug}
                />
              ) : null}
              <LinkButton
                grain
                href={`/sandbox?skill=${skill.slug}`}
                size="sm"
                variant="primary"
              >
                <PlayIcon className="h-3.5 w-3.5" />
                Run in sandbox
              </LinkButton>
              {skill.origin !== "user" ? (
                <TrackSkillButton
                  label="Track skill"
                  redirectTo="detail"
                  size="sm"
                  slug={skill.slug}
                  variant="soft"
                />
              ) : null}
              <CopyButton
                className="text-xs"
                iconSize="sm"
                label="Copy prompt"
                size="sm"
                usageEvent={{
                  categorySlug: skill.category,
                  kind: "copy_prompt",
                  label: "Copied prompt",
                  path: skill.href,
                  skillSlug: skill.slug,
                }}
                value={primaryAgentPrompt}
                variant="soft"
              />
              <CopyButton
                className="text-xs"
                iconType="link"
                iconSize="sm"
                label="Copy link"
                size="sm"
                usageEvent={{
                  categorySlug: skill.category,
                  kind: "copy_url",
                  label: "Copied raw skill link",
                  path: skill.href,
                  skillSlug: skill.slug,
                }}
                value={rawUrlVersioned}
                variant="soft"
              />
              <DownloadSkillButton
                body={skill.body}
                filename={downloadFilename}
              />
              {!canEdit && (
                <ForkSkillButton label="Fork to my skills" slug={skill.slug} />
              )}
              {canEdit && (
                <DeleteSkillButton skillTitle={skill.title} slug={skill.slug} />
              )}
            </div>
          </header>
        </div>

        {/* ── Two-column layout ── */}
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* Main column */}
          <div
            className="min-h-0 flex-1 border-line lg:border-r"
            id="skill-main-scroll"
          >
            <SkillSectionNav sections={sectionTabs} />
            <div className={cn("grid gap-8 py-5 pb-16 sm:py-6", pageInsetPadX)}>
              {canEdit ? (
                <section id="author-studio">
                  <SkillAuthorStudio skill={skill} />
                </section>
              ) : null}

              {/* Skill body */}
              <section
                aria-label="Skill content"
                className="grid gap-4"
                id="content"
              >
                <SectionHeading icon={<FileCodeIcon />} title="Content" />
                <div className="overflow-hidden rounded-none border border-line bg-paper-3/92">
                  <ExpandableContent maxHeight={600}>
                    <div className="markdown-shell p-5 sm:p-6">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {skill.body}
                      </ReactMarkdown>
                    </div>
                  </ExpandableContent>
                </div>
              </section>

              {/* Agent docs (tabs per platform) */}
              <SkillAgentDocsPanel
                agentDocs={skill.agentDocs}
                skillHref={skill.href}
                skillSlug={skill.slug}
              />

              <SkillActivitySection
                automation={primaryAutomation}
                canManage={canEdit}
                category={skill.category}
                iconUrl={skill.iconUrl}
                latestRun={latestRun}
                origin={skill.origin}
                skillTitle={skill.title}
                slug={skill.slug}
                sourceCount={sourceCount}
                sources={skill.sources}
              />

              <SkillResearchPanel skill={skill} />

              {/* Sources list */}
              {trackedSources.length > 0 ? (
                <section
                  className="grid gap-4 border-t border-line pt-8"
                  id="sources"
                >
                  <SectionHeading
                    icon={<GlobeIcon />}
                    title="Sources"
                    count={trackedSources.length}
                    countLabel="tracked"
                  />
                  <div className="grid gap-0 overflow-hidden border border-line">
                    {trackedSources.map((ref) =>
                      "url" in ref ? (
                        <a
                          className="group flex items-center justify-between gap-4 border-t border-line/60 bg-paper-3/92 px-4 py-3 transition-colors first:border-t-0 hover:bg-paper-2/50 dark:border-line/40 dark:bg-paper-2/40 dark:hover:bg-paper-3/40"
                          href={ref.url}
                          key={ref.url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <div className="min-w-0">
                            <p className="m-0 text-[0.8125rem] font-semibold text-ink group-hover:text-accent">
                              {ref.label}
                            </p>
                            <p className="m-0 mt-0.5 text-[0.6875rem] text-ink-faint">
                              {ref.tags.join(" · ") || ref.kind}
                            </p>
                          </div>
                          <span className="shrink-0 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-ink-faint opacity-0 transition-opacity group-hover:opacity-100">
                            Open ↗
                          </span>
                        </a>
                      ) : (
                        <div
                          className="border-t border-line/60 bg-paper-3/92 px-4 py-3 first:border-t-0 dark:border-line/40 dark:bg-paper-2/40"
                          key={ref.path}
                        >
                          <p className="m-0 text-[0.8125rem] font-semibold text-ink">
                            {ref.title}
                          </p>
                          <p className="m-0 mt-0.5 text-[0.6875rem] text-ink-faint">
                            {ref.excerpt}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </section>
              ) : null}
            </div>
          </div>

          {/* Sidebar */}
          <div
            className={cn(
              "min-h-0 w-full overflow-y-auto border-t border-line py-5 pb-16 sm:py-6 lg:w-96 lg:shrink-0 lg:border-t-0",
              pageInsetPadX
            )}
          >
            <SkillDetailSidebar
              agentDocs={skill.agentDocs}
              agentPrompt={primaryAgentPrompt}
              automations={attachedAutomations}
              body={skill.body}
              currentVersion={skill.version}
              diffLines={diffLines}
              downloadFilename={downloadFilename}
              latestRun={latestRun}
              latestUpdate={latestUpdate}
              rawDiffLength={rawDiff.length}
              rawUrl={rawUrl}
              skillHref={skill.href}
              skills={[skill]}
              slug={skill.slug}
              timeZone={timeZone}
              updates={skill.updates}
              usage={usage}
              versions={skill.availableVersions}
              visibleChangedSections={visibleChangedSections}
            />
          </div>
        </div>
      </PageShell>
    </AppGridShell>
  );
}
