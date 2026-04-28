"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { AutomationEditModal } from "@/components/automation-edit-modal";
import {
  AutomationIcon,
  ClockIcon,
  PlayIcon,
  RefreshIcon,
  SearchIcon,
  SettingsIcon,
  SparkIcon,
  StopIcon,
} from "@/components/frontier-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [isToggling, startToggle] = useTransition();

  const isActive = automation?.status === "ACTIVE";
  const hasAutomation = !!automation;

  function handleTogglePause() {
    if (!hasAutomation) {
      return;
    }
    startToggle(async () => {
      await fetch(`/api/automations/${automation.id}`, {
        body: JSON.stringify({
          status: isActive ? "PAUSED" : "ACTIVE",
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      });
      router.refresh();
    });
  }

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
          "flex items-center border-b",
          isActive
            ? "border-accent/20 bg-accent/4"
            : "border-line bg-paper-2/30 dark:bg-paper-2/15"
        )}
      >
        <div
          className={cn(
            "flex flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2",
            pageInsetPadX
          )}
        >
          {/* Left: label + status metrics */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-ink-faint">
              <AutomationIcon className="h-3 w-3" />
              Automation
            </span>

            <span className="flex items-center gap-1.5">
              <StatusDot
                pulse={isActive}
                size="sm"
                tone={isActive ? "fresh" : "idle"}
              />
              <span className="text-[0.8125rem] font-medium text-ink">
                {isActive ? "Active" : "Paused"}
              </span>
            </span>

            <Badge color="neutral" size="sm">
              {formatCadenceLabel(automation.cadence)}
            </Badge>

            {nextRun && (
              <span className="flex items-center gap-1 text-xs text-ink-faint">
                <ClockIcon className="h-3 w-3" />
                Next {nextRun}
              </span>
            )}

            <span className="flex items-center gap-1 text-xs text-ink-faint">
              <SearchIcon className="h-3 w-3" />
              {sourceCount} source{sourceCount === 1 ? "" : "s"}
            </span>

            <span className="flex items-center gap-1 text-xs tabular-nums text-ink-faint">
              <RefreshIcon className="h-3 w-3" />
              {latestRun ? formatRelativeDate(latestRun.finishedAt) : "No runs"}
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
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-1.5">
            {canEdit && sourceCount > 0 && (
              <Button
                className="h-7 min-h-7 gap-1 px-2.5 text-xs"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("loop:trigger-refresh"))
                }
                size="sm"
                type="button"
              >
                <RefreshIcon className="h-3 w-3" />
                Run now
              </Button>
            )}
            {canEdit && (
              <Button
                className="h-7 min-h-7 gap-1 px-2.5 text-xs"
                disabled={isToggling}
                onClick={handleTogglePause}
                size="sm"
                type="button"
                variant={isActive ? "soft" : "ghost"}
              >
                {isActive ? (
                  <>
                    <StopIcon className="h-3 w-3" />
                    {isToggling ? "Pausing..." : "Pause"}
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-3 w-3" />
                    {isToggling ? "Resuming..." : "Resume"}
                  </>
                )}
              </Button>
            )}
            <Button
              className="h-7 min-h-7 gap-1 px-2.5 text-xs"
              onClick={() =>
                document
                  .querySelector("#automations")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              size="sm"
              type="button"
              variant="soft"
            >
              <SparkIcon className="h-3 w-3" />
              Details
            </Button>
            {canEdit && (
              <Button
                className="h-7 min-h-7 gap-1 px-2.5 text-xs"
                onClick={() => setEditOpen(true)}
                size="sm"
                type="button"
                variant="soft"
              >
                <SettingsIcon className="h-3 w-3" />
                Edit
              </Button>
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
