"use client";

import { AutomationCalendar } from "@/components/automation-calendar";
import { AreaChart } from "@/components/charts/area-chart";
import { StatTile } from "@/components/charts/stat-tile";
import { EmptyCard } from "@/components/ui/empty-card";
import { Panel } from "@/components/ui/panel";
import { StatusDot } from "@/components/ui/status-dot";
import type { AutomationSummary } from "@/lib/types";
import type { UsageOverview } from "@/lib/usage";

type ActivityDashboardProps = {
  overview: UsageOverview;
  automations: AutomationSummary[];
};

const sectionKicker =
  "inline-block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft";

export function ActivityDashboard({ overview, automations }: ActivityDashboardProps) {
  const viewsSpark = overview.timeSeries.map((b) => b.views);
  const interactionsSpark = overview.timeSeries.map((b) => b.interactions);
  const apiSpark = overview.timeSeries.map((b) => b.api);
  const latencySpark = overview.latencySeries.map((b) => b.avgMs);

  const areaData = overview.timeSeries.map((b) => ({
    label: b.label,
    value: b.total,
    secondary: b.api,
  }));

  const activeAutomations = automations.filter((a) => a.status === "ACTIVE");
  const hasEvents =
    overview.totals.pageViews +
      overview.totals.interactions +
      overview.totals.apiCalls >
    0;

  if (!hasEvents && automations.length === 0) return null;

  return (
    <Panel className="gap-5">
      <span className={sectionKicker}>Activity</span>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="views" value={overview.totals.pageViews} sparkData={viewsSpark} />
        <StatTile label="interactions" value={overview.totals.interactions} sparkData={interactionsSpark} />
        <StatTile label="api calls" value={overview.totals.apiCalls} sparkData={apiSpark} />
        <StatTile label="avg api ms" value={overview.totals.avgApiDurationMs || "0"} sparkData={latencySpark} />
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="grid gap-3.5 rounded-2xl border border-line bg-paper-3 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <span className={sectionKicker}>Timeline</span>
              <h3 className="m-0 text-base font-semibold tracking-[-0.03em]">
                Event volume — 24h
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[0.65rem] text-ink-faint">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-3 rounded-full bg-accent" />
                total
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-0.5 w-3 rounded-full"
                  style={{ background: "var(--color-ink-faint)", opacity: 0.5 }}
                />
                api
              </span>
            </div>
          </div>
          {hasEvents ? (
            <AreaChart id="home-events" data={areaData} />
          ) : (
            <EmptyCard>No events in the last 24 hours.</EmptyCard>
          )}
        </article>

        {automations.length > 0 ? (
          <article className="grid gap-3.5 rounded-2xl border border-line bg-paper-3 p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <span className={sectionKicker}>Schedule</span>
                <h3 className="m-0 text-base font-semibold tracking-[-0.03em]">
                  Automations
                </h3>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-ink-faint">
                <StatusDot
                  tone={activeAutomations.length > 0 ? "fresh" : "idle"}
                  pulse={activeAutomations.length > 0}
                />
                {activeAutomations.length} active
              </span>
            </div>
            <AutomationCalendar automations={automations} />
          </article>
        ) : null}
      </div>
    </Panel>
  );
}
