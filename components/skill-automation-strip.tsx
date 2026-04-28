"use client";

import { useState } from "react";

import { AutomationEditModal } from "@/components/automation-edit-modal";
import {
  AutomationIcon,
  ClockIcon,
  RefreshIcon,
  SearchIcon,
  SettingsIcon,
  SparkIcon,
} from "@/components/frontier-icons";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/cn";
import { formatRelativeDate } from "@/lib/format";
import { formatNextRun } from "@/lib/schedule";
import type {
  AutomationSummary,
  CategorySlug,
  LoopRunRecord,
  SourceDefinition,
} from "@/lib/types";
import { pageInsetPadX } from "@/lib/ui-layout";

interface SkillAutomationStripProps {
  automation?: AutomationSummary;
  latestRun?: LoopRunRecord | null;
  canEdit: boolean;
  slug: string;
  skillTitle: string;
  category?: CategorySlug;
  iconUrl?: string | null;
  sourceCount: number;
  sources?: SourceDefinition[];
}

function formatCadenceLabel(cadence: string): string {
  switch (cadence) {
    case "daily": {
      return "Daily";
    }
    case "weekly": {
      return "Weekly";
    }
    default: {
      return "Manual";
    }
  }
}

function formatOutcome(run: LoopRunRecord): string {
  if (run.status === "error") {
    return "Error";
  }
  if (run.bodyChanged) {
    return run.nextVersionLabel ?? "Updated";
  }
  return "No changes";
}

export function SkillAutomationStrip({
  automation,
  latestRun,
  canEdit,
  slug,
  skillTitle,
  category,
  iconUrl,
  sourceCount,
  sources,
}: SkillAutomationStripProps) {
  const [editOpen, setEditOpen] = useState(false);

  const isActive = automation?.status === "ACTIVE";
  const hasAutomation = !!automation;

  if (!hasAutomation && !canEdit) {
    return null;
  }

  if (!hasAutomation) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 border-b border-dashed border-line bg-paper-2/30 py-2.5 dark:bg-paper-2/15",
          pageInsetPadX
        )}
      >
        <AutomationIcon className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
        <span className="text-[0.8125rem] text-ink-soft">
          No automation configured
        </span>
        <a
          className="text-[0.8125rem] font-medium text-accent transition-colors hover:text-accent-hover"
          href="#automations"
        >
          Set up
        </a>
      </div>
    );
  }

  const nextRun =
    automation.cadence !== "manual"
      ? formatNextRun(
          automation.cadence,
          automation.preferredHour ?? 12,
          automation.preferredDay
        )
      : null;

  return (
    <>
      <div
        className={cn(
          "flex items-center border-b py-0",
          isActive
            ? "border-accent/20 bg-accent/4"
            : "border-line bg-paper-2/30 dark:bg-paper-2/15"
        )}
      >
        <div
          className={cn(
            "flex flex-1 flex-wrap items-center gap-x-5 gap-y-1 py-2.5",
            pageInsetPadX
          )}
        >
          <div className="flex items-center gap-2">
            <AutomationIcon className="h-3.5 w-3.5 text-ink-faint" />
            <StatusDot
              pulse={isActive}
              size="sm"
              tone={isActive ? "fresh" : "idle"}
            />
            <span className="text-[0.8125rem] font-semibold text-ink">
              {isActive ? "Active" : "Paused"}
            </span>
            <Badge color="neutral" size="sm">
              {formatCadenceLabel(automation.cadence)}
            </Badge>
          </div>

          {nextRun && (
            <span className="flex items-center gap-1.5 text-xs text-ink-faint">
              <ClockIcon className="h-3 w-3" />
              Next {nextRun}
            </span>
          )}

          <span className="flex items-center gap-1.5 text-xs text-ink-faint">
            <SearchIcon className="h-3 w-3" />
            {sourceCount} source{sourceCount === 1 ? "" : "s"}
          </span>

          <span className="flex items-center gap-1.5 text-xs tabular-nums text-ink-faint">
            <RefreshIcon className="h-3 w-3" />
            {latestRun
              ? formatRelativeDate(latestRun.finishedAt)
              : "No runs yet"}
            {latestRun && (
              <>
                {" · "}
                <span
                  className={cn(
                    "font-medium",
                    latestRun.status === "error"
                      ? "text-danger"
                      : latestRun.bodyChanged
                        ? "text-ink"
                        : ""
                  )}
                >
                  {formatOutcome(latestRun)}
                </span>
              </>
            )}
          </span>

          <div className="flex items-center gap-3 sm:ml-auto">
            <a
              className="flex items-center gap-1 text-xs font-medium text-ink-soft transition-colors hover:text-ink"
              href="#automations"
            >
              <SparkIcon className="h-3 w-3" />
              Details
            </a>
            {canEdit && (
              <button
                className="flex items-center gap-1 text-xs font-medium text-ink-soft transition-colors hover:text-ink"
                onClick={() => setEditOpen(true)}
                type="button"
              >
                <SettingsIcon className="h-3 w-3" />
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

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
