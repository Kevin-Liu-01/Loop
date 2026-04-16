"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AutomationEditModal } from "@/components/automation-edit-modal";
import { AutomationIcon } from "@/components/frontier-icons";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/cn";
import { formatNextRun } from "@/lib/schedule";
import type { AutomationSummary, SkillRecord } from "@/lib/types";
import {
  textEyebrow,
  textMetaLink,
  textMetaSm,
  textRowItem,
} from "@/lib/ui-typography";

interface SidebarAutomationsPanelProps {
  automations: AutomationSummary[];
  skills?: SkillRecord[];
}

export function SidebarAutomationsPanel({
  automations,
  skills = [],
}: SidebarAutomationsPanelProps) {
  const [editTarget, setEditTarget] = useState<AutomationSummary | null>(null);
  const skillMap = useMemo(
    () => new Map(skills.map((s) => [s.slug, s])),
    [skills]
  );

  const editSkill = editTarget?.matchedSkillSlugs[0]
    ? skillMap.get(editTarget.matchedSkillSlugs[0])
    : undefined;

  const activeCount = automations.filter((a) => a.status === "ACTIVE").length;

  return (
    <>
      <section className="grid gap-0 overflow-hidden border border-line bg-paper-3 dark:bg-paper-2/60">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-3 pb-2 pt-3">
          <span className={cn(textEyebrow, "flex items-center gap-1.5")}>
            <AutomationIcon className="h-3 w-3" />
            Automations
            <span className="tabular-nums">{automations.length}</span>
          </span>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <span className={cn(textMetaSm, "flex items-center gap-1")}>
                <StatusDot tone="fresh" pulse size="xs" />
                {activeCount} active
              </span>
            )}
            <Link className={textMetaLink} href="/settings/automations">
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
                  <span className={cn(textRowItem, "min-w-0 flex-1 truncate")}>
                    {auto.name}
                  </span>
                  <span
                    className={cn(
                      textMetaSm,
                      "flex items-center gap-1",
                      isActive ? "text-success" : "text-ink-faint"
                    )}
                  >
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
                    <small className={textEyebrow}>schedule</small>
                    <span className={cn(textMetaSm, "text-ink-soft")}>
                      {auto.schedule}
                    </span>
                  </div>
                  <div className="grid gap-0.5 bg-paper-3 px-3 py-1.5 dark:bg-paper-2/60">
                    <small className={textEyebrow}>next</small>
                    <span className={cn(textMetaSm, "text-ink-soft")}>
                      {formatNextRun(
                        auto.cadence,
                        auto.preferredHour ?? 12,
                        auto.preferredDay
                      )}
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
