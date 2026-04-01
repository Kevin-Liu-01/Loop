"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { AutomationEditModal } from "@/components/automation-edit-modal";
import { AutomationIcon } from "@/components/frontier-icons";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/cn";
import { formatNextRun } from "@/lib/schedule";
import type { AutomationSummary, SkillRecord } from "@/lib/types";

const metaLabel = "text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-ink-faint";
const metaValue = "text-sm font-semibold tracking-[-0.03em]";

type SidebarAutomationsPanelProps = {
  automations: AutomationSummary[];
  skills?: SkillRecord[];
};

export function SidebarAutomationsPanel({ automations, skills = [] }: SidebarAutomationsPanelProps) {
  const [editTarget, setEditTarget] = useState<AutomationSummary | null>(null);
  const skillMap = useMemo(() => new Map(skills.map((s) => [s.slug, s])), [skills]);

  const editSkill = editTarget?.matchedSkillSlugs[0]
    ? skillMap.get(editTarget.matchedSkillSlugs[0])
    : undefined;

  const activeCount = automations.filter((a) => a.status === "ACTIVE").length;

  return (
    <>
      <section className="grid gap-0 overflow-hidden border border-line bg-paper-3 dark:bg-paper-2/60">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-3 pb-2 pt-3">
          <span className={cn(metaLabel, "flex items-center gap-1.5")}>
            <AutomationIcon className="h-3 w-3" />
            Automations
            <span className="tabular-nums">{automations.length}</span>
          </span>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <span className="flex items-center gap-1 text-[0.625rem] text-ink-faint">
                <StatusDot tone="fresh" pulse size="xs" />
                {activeCount} active
              </span>
            )}
            <Link
              className="text-[0.625rem] font-semibold text-ink-faint transition-colors hover:text-ink"
              href="/settings/automations"
            >
              Open desk →
            </Link>
          </div>
        </div>

        {/* Automation rows */}
        <div className="grid gap-0">
          {automations.map((auto) => {
            const isActive = auto.status === "ACTIVE";

            return (
              <button
                className={cn(
                  "grid gap-0 border-t border-line/60 text-left transition-colors dark:border-line/40",
                  isActive
                    ? "hover:bg-paper-2/40 dark:hover:bg-paper-3/40"
                    : "opacity-50 hover:opacity-70"
                )}
                key={auto.id}
                onClick={() => setEditTarget(auto)}
                type="button"
              >
                {/* Name + status */}
                <div className="flex items-center gap-2 px-3 pb-1 pt-2.5">
                  <span className="min-w-0 flex-1 truncate text-[0.6875rem] font-semibold text-ink">
                    {auto.name}
                  </span>
                  <span className={cn(
                    "flex items-center gap-1 text-[0.625rem]",
                    isActive ? "text-success" : "text-ink-faint"
                  )}>
                    <StatusDot
                      pulse={isActive}
                      size="xs"
                      tone={isActive ? "fresh" : "idle"}
                    />
                    {isActive ? "active" : "paused"}
                  </span>
                </div>

                {/* Schedule + Next */}
                <div className="grid grid-cols-2 gap-px bg-line/50 dark:bg-line/30">
                  <div className="grid gap-0.5 bg-paper-3 px-3 py-1.5 dark:bg-paper-2/60">
                    <small className={metaLabel}>schedule</small>
                    <span className="text-[0.6875rem] font-medium text-ink-soft">{auto.schedule}</span>
                  </div>
                  <div className="grid gap-0.5 bg-paper-3 px-3 py-1.5 dark:bg-paper-2/60">
                    <small className={metaLabel}>next</small>
                    <span className="text-[0.6875rem] font-medium tabular-nums text-ink-soft">
                      {formatNextRun(auto.cadence, auto.preferredHour ?? 12, auto.preferredDay)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {editTarget && (
        <AutomationEditModal
          automation={editTarget}
          initialPreferredHour={editTarget.preferredHour}
          onClose={() => setEditTarget(null)}
          open
          skillCategory={editSkill?.category}
          skillIconUrl={editSkill?.iconUrl}
          skillName={editSkill?.title}
          skillSlug={editSkill?.slug}
          sources={editSkill?.sources}
        />
      )}
    </>
  );
}
