import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { BuySkillButton } from "@/components/buy-skill-button";
import { CopyButton } from "@/components/copy-button";
import { ExpandableContent } from "@/components/expandable-content";
import { FlowIcon, PlayIcon } from "@/components/frontier-icons";
import { ShareButton } from "@/components/share-button";
import { SiteHeader } from "@/components/site-header";
import { SkillDetailSidebar } from "@/components/skill-detail-sidebar";
import { SkillSetupForm } from "@/components/skill-setup-form";
import { SkillUpdateRunner } from "@/components/skill-update-runner";
import { TrackSkillButton } from "@/components/track-skill-button";
import { UsageBeacon } from "@/components/usage-beacon";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { PageShell } from "@/components/ui/page-shell";
import { Panel } from "@/components/ui/panel";
import { SimpleList, SimpleListBody, SimpleListItem } from "@/components/ui/simple-list";
import { formatAutomationSchedule, formatRelativeDate } from "@/lib/format";
import { diffMultilineText } from "@/lib/text-diff";
import { buildUpdateDigest } from "@/lib/update-digest";
import type { SkillUsageSummary } from "@/lib/usage";
import type { CategoryBrief, LoopRunRecord, SkillRecord } from "@/lib/types";

const sectionTitle = "m-0 text-lg font-semibold tracking-tight text-ink";

type SkillDetailPageProps = {
  skill: SkillRecord;
  brief?: CategoryBrief;
  previousSkill?: SkillRecord | null;
  latestRun?: LoopRunRecord | null;
  usage: SkillUsageSummary;
  purchased?: boolean;
};

function buildAttachedAutomations(skill: SkillRecord) {
  if (skill.origin === "user" && skill.automation) {
    return [
      {
        id: `built-in:${skill.slug}`,
        name: skill.automation.enabled ? `${skill.title} refresh` : "Manual refresh",
        schedule: skill.automation.enabled
          ? `${skill.automation.cadence} ${skill.automation.status}`
          : "manual"
      },
      ...skill.automations.map((a) => ({
        id: a.id,
        name: a.name,
        schedule: formatAutomationSchedule(a.schedule)
      }))
    ];
  }

  return skill.automations.map((a) => ({
    id: a.id,
    name: a.name,
    schedule: formatAutomationSchedule(a.schedule)
  }));
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount / 100);
}

export function SkillDetailPage({
  skill,
  brief,
  previousSkill,
  latestRun,
  usage,
  purchased = false
}: SkillDetailPageProps) {
  const isPaid = skill.price && skill.price.amount > 0;
  const priceLabel = isPaid ? formatPrice(skill.price!.amount, skill.price!.currency) : null;
  const primaryAgentPrompt =
    skill.agents[0]?.defaultPrompt ?? `Use $${skill.slug} for this task.`;
  const trackedSources =
    skill.origin === "user" ? skill.sources ?? [] : skill.references;
  const attachedAutomations = buildAttachedAutomations(skill);
  const latestUpdate = skill.updates?.[0];
  const isUpdateable = skill.origin === "user" || skill.origin === "remote";
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

  return (
    <>
      <UsageBeacon
        categorySlug={skill.category}
        dedupeKey={`page:${skill.href}`}
        kind="page_view"
        label="Opened skill detail"
        path={skill.href}
        skillSlug={skill.slug}
      />
      <SiteHeader />

      <PageShell className="grid gap-8 pt-8 pb-16">
        {/* ── Header (full width) ── */}
        <header className="grid gap-3">
          <Link
            className="text-sm text-ink-soft hover:text-ink"
            href="/"
          >
            &larr; Back to skills
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Badge>{skill.category}</Badge>
            <Badge muted>{skill.origin}</Badge>
            <Badge muted>{skill.versionLabel}</Badge>
            {priceLabel ? <Badge>{priceLabel}</Badge> : <Badge muted>Free</Badge>}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="m-0 text-2xl font-semibold tracking-tight text-ink wrap-break-word">
              {skill.title}
            </h1>
            <ShareButton href={skill.href} />
          </div>
          <p className="m-0 text-sm text-ink-soft wrap-break-word">{skill.description}</p>
          <p className="m-0 text-xs text-ink-muted">
            {trackedSources.length} sources · Updated {formatRelativeDate(skill.updatedAt)}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {isPaid && priceLabel ? (
              <BuySkillButton
                priceLabel={priceLabel}
                purchased={purchased}
                slug={skill.slug}
              />
            ) : null}
            <LinkButton
              href={`/sandbox?skill=${skill.slug}`}
              size="sm"
            >
              <PlayIcon className="h-3.5 w-3.5" />
              Run in sandbox
            </LinkButton>
            {skill.origin !== "user" ? (
              <TrackSkillButton
                label="Track skill"
                redirectTo="detail"
                slug={skill.slug}
              />
            ) : null}
            <CopyButton
              label="Copy prompt"
              usageEvent={{
                kind: "copy_prompt",
                label: "Copied prompt",
                path: skill.href,
                skillSlug: skill.slug,
                categorySlug: skill.category
              }}
              value={primaryAgentPrompt}
            />
            <CopyButton
              label="Copy link"
              usageEvent={{
                kind: "copy_url",
                label: "Copied skill link",
                path: skill.href,
                skillSlug: skill.slug,
                categorySlug: skill.category
              }}
              value={skill.href}
            />
          </div>
        </header>

        {/* ── Two-column layout: Main + Sidebar ── */}
        <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-8 max-lg:grid-cols-1">
          {/* ── Main column ── */}
          <div className="grid gap-8">
            {/* Content */}
            <section id="content" className="grid gap-5">
              <h2 className={sectionTitle}>Content</h2>

              <div className="rounded-2xl border border-line bg-paper-3 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-ink-soft">
                    Agent prompt
                  </span>
                  <CopyButton
                    label="Copy"
                    usageEvent={{
                      kind: "copy_prompt",
                      label: "Copied prompt",
                      path: skill.href,
                      skillSlug: skill.slug,
                      categorySlug: skill.category
                    }}
                    value={primaryAgentPrompt}
                  />
                </div>
                <code className="block whitespace-pre-wrap wrap-break-word font-mono text-sm text-ink">
                  {primaryAgentPrompt}
                </code>
              </div>

              <ExpandableContent maxHeight={400}>
                <div className="markdown-shell">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {skill.body}
                  </ReactMarkdown>
                </div>
              </ExpandableContent>
            </section>

            <hr className="border-line" />

            {/* Sources & Config */}
            <section id="sources" className="grid gap-5">
              <h2 className={sectionTitle}>Sources &amp; Config</h2>

              {skill.origin === "user" ? (
                <SkillSetupForm
                  automation={skill.automation}
                  body={skill.body}
                  category={skill.category}
                  description={skill.description}
                  ownerName={skill.ownerName}
                  slug={skill.slug}
                  sources={skill.sources ?? []}
                  tags={skill.tags}
                  title={skill.title}
                  updatedAt={skill.updatedAt}
                  versionLabel={skill.versionLabel}
                />
              ) : (
                <Panel>
                  <h3 className={sectionTitle}>Track this skill</h3>
                  <p className="text-ink-soft">
                    Create an editable copy to add sources, configure refresh, and
                    keep it updated.
                  </p>
                  <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-2xl border border-line bg-paper-3 p-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper-3 text-ink-soft">
                      <FlowIcon />
                    </span>
                    <div>
                      <strong className="text-ink">What happens</strong>
                      <p className="mt-1 text-sm text-ink-soft">
                        Loop copies this skill into your tracked set. You can then
                        edit sources and run refreshes.
                      </p>
                    </div>
                  </div>
                  <TrackSkillButton
                    label="Create editable copy"
                    redirectTo="detail"
                    slug={skill.slug}
                  />
                </Panel>
              )}

              {trackedSources.length > 0 ? (
                <Panel compact>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
                      <h3 className={sectionTitle}>Tracked sources</h3>
                      <Badge>{trackedSources.length}</Badge>
                      <span className="ml-auto text-xs text-ink-muted transition-transform group-open:rotate-90">▶</span>
                    </summary>
                    <SimpleList tight className="mt-3">
                      {trackedSources.map((ref) =>
                        "url" in ref ? (
                          <a
                            className="grid grid-cols-1 border-t border-line bg-transparent py-3 first:border-t-0 first:pt-0 transition-colors hover:bg-transparent"
                            href={ref.url}
                            key={ref.url}
                            rel="noreferrer"
                            target="_blank"
                          >
                            <SimpleListBody>
                              <strong className="text-ink">{ref.label}</strong>
                              <p className="m-0 text-sm text-ink-soft">
                                {ref.tags.join(" · ") || ref.kind}
                              </p>
                            </SimpleListBody>
                          </a>
                        ) : (
                          <SimpleListItem className="grid-cols-1" key={ref.path}>
                            <SimpleListBody>
                              <strong className="text-ink">{ref.title}</strong>
                              <p className="m-0 text-sm text-ink-soft">
                                {ref.excerpt}
                              </p>
                            </SimpleListBody>
                          </SimpleListItem>
                        )
                      )}
                    </SimpleList>
                  </details>
                </Panel>
              ) : null}
            </section>

            {isUpdateable ? (
              <>
                <hr className="border-line" />
                <section id="run-log">
                  <SkillUpdateRunner
                    latestRun={latestRun}
                    origin={skill.origin === "user" ? "user" : "remote"}
                    slug={skill.slug}
                    sourceCount={sourceCount}
                  />
                </section>
              </>
            ) : null}
          </div>

          {/* ── Sidebar (sticky) ── */}
          <div className="sticky top-22 max-h-[calc(100dvh-5.5rem)] overflow-y-auto max-lg:static max-lg:max-h-none max-lg:overflow-visible">
            <SkillDetailSidebar
              agentDocs={skill.agentDocs}
              agentPrompt={primaryAgentPrompt}
              automations={attachedAutomations}
              currentVersion={skill.version}
              diffLines={diffLines}
              latestRun={latestRun}
              latestUpdate={latestUpdate}
              rawDiffLength={rawDiff.length}
              skillHref={skill.href}
              slug={skill.slug}
              updates={skill.updates}
              usage={usage}
              versionLabel={skill.versionLabel}
              versions={skill.availableVersions}
              visibleChangedSections={visibleChangedSections}
            />
          </div>
        </div>
      </PageShell>
    </>
  );
}
