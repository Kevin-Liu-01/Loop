"use client";

import { useMemo } from "react";

import { AutomationIcon } from "@/components/frontier-icons";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/shadcn/dialog";
import { SkillIcon } from "@/components/ui/skill-icon";
import { StatusDot } from "@/components/ui/status-dot";
import { useAppTimezone } from "@/hooks/use-app-timezone";
import { cn } from "@/lib/cn";
import { formatFullDate } from "@/lib/format";
import { formatNextRun } from "@/lib/schedule";
import { formatTagLabel, getTagColorForCategory } from "@/lib/tag-utils";
import type {
  AutomationSummary,
  LoopRunSummary,
  SkillRecord,
} from "@/lib/types";

export interface DayAutomationEntry {
  automation: AutomationSummary;
  color: { bg: string; ring: string; border: string };
}

interface AutomationDayModalProps {
  open: boolean;
  onClose: () => void;
  date: Date | null;
  entries: DayAutomationEntry[];
  loopRuns?: LoopRunSummary[];
  onEditAutomation?: (automation: AutomationSummary) => void;
  skillMap?: Map<string, SkillRecord>;
}

function AutomationRunIcon({
  skillSlug,
  skill,
  color,
}: {
  skillSlug?: string;
  skill?: SkillRecord;
  color: { bg: string; ring: string; border: string };
}) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border",
        skill || skillSlug
          ? color.border
          : "border-line bg-paper-2 dark:bg-paper-2/60"
      )}
    >
      {skill ? (
        <SkillIcon flush iconUrl={skill.iconUrl} size={40} slug={skill.slug} />
      ) : skillSlug ? (
        <SkillIcon flush size={40} slug={skillSlug} />
      ) : (
        <AutomationIcon className="h-4 w-4 text-ink-faint" />
      )}
      <span
        aria-hidden
        className={cn(
          "absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-paper-3",
          color.bg
        )}
      />
    </div>
  );
}

function formatTimeAgo(iso: string): string {
  const ms = Date.now() - Date.parse(iso);
  if (Number.isNaN(ms) || ms < 0) {
    return "just now";
  }
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function AutomationDayModal({
  open,
  onClose,
  date,
  entries,
  loopRuns = [],
  onEditAutomation,
  skillMap,
}: AutomationDayModalProps) {
  const { timeZone } = useAppTimezone();
  const title = date ? formatFullDate(date, timeZone) : "";
  const isClickable = typeof onEditAutomation === "function";
  const activeCount = entries.filter(
    ({ automation }) => automation.status === "ACTIVE"
  ).length;

  const latestRunBySlug = useMemo(() => {
    const map = new Map<string, LoopRunSummary>();
    for (const run of loopRuns) {
      const existing = map.get(run.slug);
      if (!existing || run.startedAt > existing.startedAt) {
        map.set(run.slug, run);
      }
    }
    return map;
  }, [loopRuns]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          onClose();
        }
      }}
    >
      <DialogContent className="gap-0 overflow-hidden p-0" maxWidth="lg">
        <DialogHeader className="gap-1 space-y-0">
          <DialogTitle>Scheduled runs</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span>{title}</span>
            {entries.length > 0 && (
              <Badge color="blue" size="sm">
                {activeCount} active
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center gap-3 border border-dashed border-line bg-paper-2/40 px-4 py-10 text-center dark:bg-black/20">
              <AutomationIcon className="h-5 w-5 text-ink-faint" />
              <p className="m-0 text-sm text-ink-soft">
                No automations on this day.
              </p>
            </div>
          ) : (
            <ul className="m-0 grid list-none gap-2 p-0">
              {entries.map(({ automation, color }) => {
                const skillSlug = automation.matchedSkillSlugs[0];
                const linkedSkill = skillSlug
                  ? skillMap?.get(skillSlug)
                  : undefined;
                const lastRun = skillSlug
                  ? latestRunBySlug.get(skillSlug)
                  : undefined;
                const isActive = automation.status === "ACTIVE";
                const { schedule } = automation;
                const nextRun = formatNextRun(
                  automation.cadence,
                  automation.preferredHour ?? 12,
                  automation.preferredDay
                );

                const inner = (
                  <div className="flex items-start gap-3.5">
                    <AutomationRunIcon
                      color={color}
                      skill={linkedSkill}
                      skillSlug={skillSlug}
                    />

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium leading-tight text-ink">
                          {automation.name}
                        </span>
                        <Badge color={isActive ? "green" : "neutral"} size="sm">
                          <StatusDot
                            className="mr-1"
                            pulse={isActive}
                            tone={isActive ? "fresh" : "idle"}
                          />
                          {isActive ? "active" : "paused"}
                        </Badge>
                      </div>

                      {linkedSkill && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-ink-soft">
                            {linkedSkill.title}
                          </span>
                          <Badge
                            color={getTagColorForCategory(linkedSkill.category)}
                            size="sm"
                          >
                            {formatTagLabel(linkedSkill.category)}
                          </Badge>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[0.6875rem] text-ink-faint">
                        <span className="flex items-center gap-1">
                          <AutomationIcon className="h-3 w-3" />
                          {schedule}
                        </span>
                        <span className="tabular-nums">
                          Next: <span className="text-ink-soft">{nextRun}</span>
                        </span>
                      </div>

                      {lastRun && (
                        <div
                          className={cn(
                            "mt-1 flex items-start gap-2 rounded border px-2.5 py-1.5 text-[0.6875rem]",
                            lastRun.status === "success"
                              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
                              : "border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-400"
                          )}
                        >
                          <StatusDot
                            className="mt-0.5 shrink-0"
                            tone={
                              lastRun.status === "success" ? "fresh" : "stale"
                            }
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {lastRun.status === "success"
                                  ? "Last run succeeded"
                                  : "Last run failed"}
                              </span>
                              <span className="tabular-nums text-ink-faint">
                                {formatTimeAgo(lastRun.finishedAt)}
                              </span>
                            </div>
                            {lastRun.summary && (
                              <p className="m-0 mt-0.5 line-clamp-2 text-ink-soft">
                                {lastRun.summary}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );

                return isClickable ? (
                  <li key={automation.id}>
                    <button
                      className={cn(
                        "w-full border border-line/60 bg-transparent p-4 text-left transition-colors",
                        "hover:border-accent/25 hover:bg-paper-2/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      )}
                      onClick={() => onEditAutomation(automation)}
                      type="button"
                    >
                      {inner}
                    </button>
                  </li>
                ) : (
                  <li
                    className="border border-line/60 bg-transparent p-4"
                    key={automation.id}
                  >
                    {inner}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DialogFooter>
          <LinkButton href="/settings/automations" size="sm" variant="soft">
            Manage automations
          </LinkButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
