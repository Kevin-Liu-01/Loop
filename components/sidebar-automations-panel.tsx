"use client";

import { useState } from "react";

import { AutomationEditModal } from "@/components/automation-edit-modal";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { SimpleList, SimpleListBody, SimpleListItem, SimpleListRow } from "@/components/ui/simple-list";
import { formatAutomationSchedule } from "@/lib/format";
import type { AutomationSummary } from "@/lib/types";

type SidebarAutomationsPanelProps = {
  automations: AutomationSummary[];
};

export function SidebarAutomationsPanel({ automations }: SidebarAutomationsPanelProps) {
  const [editTarget, setEditTarget] = useState<AutomationSummary | null>(null);

  return (
    <>
      <Panel compact square>
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-sm font-semibold tracking-tight text-ink">Automations</h3>
          <Badge>{automations.length}</Badge>
        </div>
        <SimpleList tight>
          {automations.map((auto) => (
            <SimpleListItem className="grid-cols-1" key={auto.id}>
              <button
                className="w-full text-left transition-colors hover:bg-paper-2/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent rounded-sm -mx-1 px-1 py-0.5"
                onClick={() => setEditTarget(auto)}
                type="button"
              >
                <SimpleListBody>
                  <SimpleListRow>
                    <strong className="text-ink text-sm">{auto.name}</strong>
                    <span className="text-xs text-ink-soft">
                      {formatAutomationSchedule(auto.schedule)}
                    </span>
                  </SimpleListRow>
                </SimpleListBody>
              </button>
            </SimpleListItem>
          ))}
        </SimpleList>
      </Panel>

      {editTarget && (
        <AutomationEditModal
          automation={editTarget}
          onClose={() => setEditTarget(null)}
          open
        />
      )}
    </>
  );
}
