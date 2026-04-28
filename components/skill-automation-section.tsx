"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AutomationEditModal } from "@/components/automation-edit-modal";
import {
  AutomationIcon,
  ClockIcon,
  RefreshIcon,
  SearchIcon,
  SettingsIcon,
  SparkIcon,
} from "@/components/frontier-icons";
import { InlineAutomationSetup } from "@/components/inline-automation-setup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Panel, PanelHead } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/cn";
import { formatRelativeDate } from "@/lib/format";
import { countMonthlyRuns, formatNextRun } from "@/lib/schedule";
import type {
  AutomationSummary,
  CategorySlug,
  LoopRunRecord,
  SkillOrigin,
  SourceDefinition,
} from "@/lib/types";

interface SkillAutomationSectionProps {
  slug: string;
  skillTitle: string;
  iconUrl?: string | null;
  category?: CategorySlug;
  origin: SkillOrigin;
  sourceCount: number;
  automation?: AutomationSummary;
  latestRun?: LoopRunRecord | null;
  canEdit?: boolean;
  sources?: SourceDefinition[];
}

export function SkillAutomationSection({
  slug,
  skillTitle,
  iconUrl,
  category,
  origin,
  sourceCount,
  automation,
  latestRun,
  canEdit = false,
  sources = [],
}: SkillAutomationSectionProps) {
  const [editOpen, setEditOpen] = useState(false);
  const isTracked = origin === "user";
  const isActive = automation?.status === "ACTIVE";
  const now = useMemo(() => new Date(), []);

  const monthlyRuns = automation
    ? countMonthlyRuns(
        automation.cadence,
        now.getFullYear(),
        now.getMonth(),
        automation.preferredDay
      )
    : 0;

  const nextRun = automation
    ? formatNextRun(
        automation.cadence,
        automation.preferredHour ?? 12,
        automation.preferredDay
      )
    : "On demand";

  const scheduleLabel = automation?.schedule?.trim() || "Manual only";

  const latestOutcomeLabel = latestRun
    ? latestRun.status === "error"
      ? "Needs attention"
      : latestRun.bodyChanged
        ? (latestRun.nextVersionLabel ?? "Updated")
        : "No material diff"
    : "No runs yet";

  if (!isTracked) {
    return (
      <section
        className="grid gap-5 border-t border-line pt-8"
        id="automations"
      >
        <SectionHeading icon={<AutomationIcon />} title="Automations" />
        <Panel>
          <PanelHead>
            <div className="grid gap-2">
              <Badge color="neutral">Track to unlock</Badge>
              <h3 className="m-0 text-lg font-semibold tracking-tight text-ink">
                Automations require tracking
              </h3>
              <p className="m-0 max-w-[55ch] text-sm leading-relaxed text-ink-soft">
                Track this skill to get your own editable copy with automation
                controls, scheduled refreshes, and run history.
              </p>
            </div>
          </PanelHead>
        </Panel>
      </section>
    );
  }

  if (!automation && canEdit) {
    return (
      <section
        className="grid gap-5 border-t border-line pt-8"
        id="automations"
      >
        <SectionHeading icon={<AutomationIcon />} title="Automations" />
        <InlineAutomationSetup
          skillTitle={skillTitle}
          slug={slug}
          sourceCount={sourceCount}
        />
      </section>
    );
  }

  if (!automation) {
    return (
      <section
        className="grid gap-5 border-t border-line pt-8"
        id="automations"
      >
        <SectionHeading icon={<AutomationIcon />} title="Automations" />
        <p className="m-0 text-sm text-ink-soft">
          No automation configured for this skill.
        </p>
      </section>
    );
  }

  return (
    <>
      <section
        className="grid gap-5 border-t border-line pt-8"
        id="automations"
      >
        <SectionHeading icon={<AutomationIcon />} title="Automations" />

        <Panel className="overflow-hidden">
          <PanelHead className="items-start">
            <div className="grid gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <StatusDot
                  pulse={isActive}
                  size="sm"
                  tone={isActive ? "fresh" : "idle"}
                />
                <span className="text-sm font-semibold text-ink">
                  {isActive ? "Active" : "Paused"}
                </span>
                <Badge color="neutral" size="sm">
                  {scheduleLabel}
                </Badge>
                <Badge color="neutral" size="sm">
                  {sourceCount} source{sourceCount === 1 ? "" : "s"}
                </Badge>
              </div>
              <p className="m-0 max-w-[55ch] text-sm leading-relaxed text-ink-soft">
                {canEdit
                  ? "Automation settings and schedule for this skill."
                  : "Automation is managed by the skill owner."}
              </p>
            </div>
            {canEdit && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setEditOpen(true)}
                  size="sm"
                  type="button"
                  variant="soft"
                >
                  <SettingsIcon className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <LinkButton
                  href="/settings/automations"
                  size="sm"
                  variant="soft"
                >
                  <AutomationIcon className="h-3.5 w-3.5" />
                  Desk
                </LinkButton>
              </div>
            )}
          </PanelHead>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCell
              icon={<ClockIcon className="h-3 w-3" />}
              label="Next run"
              value={nextRun}
              accent={isActive}
            />
            <MetricCell
              icon={<RefreshIcon className="h-3 w-3" />}
              label="Schedule"
              value={scheduleLabel}
            />
            <MetricCell
              icon={<SparkIcon className="h-3 w-3" />}
              label="Runs this month"
              value={`${monthlyRuns}`}
            />
            <MetricCell
              icon={<SearchIcon className="h-3 w-3" />}
              label="Latest outcome"
              value={latestOutcomeLabel}
            />
          </div>

          {latestRun && (
            <div className="grid grid-cols-2 gap-0 overflow-hidden border border-line sm:grid-cols-4">
              <div className="grid gap-0.5 border-r border-line bg-paper-3/60 px-3 py-2.5 last:border-r-0 dark:bg-paper-2/40">
                <small className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                  status
                </small>
                <span
                  className={cn(
                    "text-[0.8125rem] font-medium",
                    latestRun.status === "error" ? "text-danger" : "text-ink"
                  )}
                >
                  {latestRun.status}
                </span>
              </div>
              <div className="grid gap-0.5 border-r border-line bg-paper-3/60 px-3 py-2.5 last:border-r-0 dark:bg-paper-2/40">
                <small className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                  last run
                </small>
                <span className="text-[0.8125rem] font-medium tabular-nums text-ink">
                  {formatRelativeDate(latestRun.finishedAt)}
                </span>
              </div>
              <div className="grid gap-0.5 border-r border-line bg-paper-3/60 px-3 py-2.5 last:border-r-0 dark:bg-paper-2/40">
                <small className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                  trigger
                </small>
                <span className="text-[0.8125rem] font-medium text-ink">
                  {latestRun.trigger === "automation"
                    ? "Scheduled"
                    : latestRun.trigger === "manual"
                      ? "Manual"
                      : latestRun.trigger}
                </span>
              </div>
              <div className="grid gap-0.5 bg-paper-3/60 px-3 py-2.5 dark:bg-paper-2/40">
                <small className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                  editor
                </small>
                <span className="truncate text-[0.8125rem] font-medium text-ink">
                  {latestRun.editorModel ?? "–"}
                </span>
              </div>
            </div>
          )}

          {automation.prompt?.trim() && (
            <div className="border border-line bg-paper-3/60 px-4 py-3 dark:bg-paper-2/40">
              <small className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                Automation brief
              </small>
              <p className="m-0 mt-1.5 line-clamp-3 text-sm leading-relaxed text-ink-soft">
                {automation.prompt}
              </p>
            </div>
          )}
        </Panel>
      </section>

      {canEdit && (
        <AutomationEditModal
          automation={automation}
          canManage
          initialPreferredHour={automation.preferredHour}
          onClose={() => setEditOpen(false)}
          open={editOpen}
          skillCategory={category}
          skillIconUrl={iconUrl}
          skillName={skillTitle}
          skillSlug={slug}
          sources={sources}
        />
      )}
    </>
  );
}

function MetricCell({
  icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-1 border px-3.5 py-3",
        accent
          ? "border-accent/20 bg-accent/8"
          : "border-line bg-paper-3/60 dark:bg-paper-2/40"
      )}
    >
      <span className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-ink-soft">
        {icon}
        {label}
      </span>
      <strong className="text-sm font-semibold tracking-[-0.03em] text-ink">
        {value}
      </strong>
    </div>
  );
}
