import { AreaChart } from "@/components/charts/area-chart";
import { BarList } from "@/components/charts/bar-list";
import { StatTile } from "@/components/charts/stat-tile";
import { PulseIcon, TimelineIcon } from "@/components/frontier-icons";
import { EmptyCard } from "@/components/ui/empty-card";
import {
  SimpleList,
  SimpleListBody,
  SimpleListIcon,
  SimpleListItem,
  SimpleListMeta,
  SimpleListRow,
} from "@/components/ui/simple-list";
import { cn } from "@/lib/cn";
import { formatDateTime, formatRelativeDate } from "@/lib/format";
import { formatUsageEvent } from "@/lib/usage";
import type { SkillUsageSummary, UsageOverview } from "@/lib/usage";

interface SystemObservabilityPanelProps {
  overview: UsageOverview;
  timeZone?: string;
}

interface SkillObservabilityPanelProps {
  usage: SkillUsageSummary;
  timeZone?: string;
}

function formatEventDetail(details?: string) {
  if (!details) {
    return null;
  }
  return details.length > 96 ? `${details.slice(0, 93)}...` : details;
}

function SubCard({
  title,
  legend,
  children,
}: {
  title: string;
  legend?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article className="grid gap-3.5 rounded-none border border-line bg-paper-3/90 p-4 dark:bg-paper-2/40">
      <div className="flex items-end justify-between gap-3">
        <h3 className="m-0 text-sm font-semibold tracking-tight text-ink">
          {title}
        </h3>
        {legend ?? null}
      </div>
      {children}
    </article>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[0.65rem] text-ink-faint">
      <span
        className="inline-block h-0.5 w-3 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

export function SystemObservabilityPanel({
  overview,
  timeZone,
}: SystemObservabilityPanelProps) {
  const viewsSpark = overview.timeSeries.map((b) => b.views);
  const interactionsSpark = overview.timeSeries.map((b) => b.interactions);
  const apiSpark = overview.timeSeries.map((b) => b.api);
  const latencySpark = overview.latencySeries.map((b) => b.avgMs);

  const areaData = overview.timeSeries.map((b) => ({
    label: b.label,
    secondary: b.api,
    value: b.total,
  }));

  const routeItems = overview.routeUsage.map((entry) => ({
    label: entry.route,
    secondary:
      entry.errorCount > 0
        ? `${entry.avgDurationMs}ms · ${entry.errorCount} err`
        : `${entry.avgDurationMs}ms avg`,
    value: entry.count,
  }));

  const activityItems = overview.activityCounts.map((entry) => ({
    label: entry.label,
    value: entry.count,
  }));

  return (
    <div className="grid gap-5">
      <div className="grid gap-0 rounded-none border border-line bg-paper-3/92">
        <div className="flex items-center gap-3 border-b border-line p-5 sm:p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-none border border-line bg-paper-2 shadow-[0_1px_0_0_rgba(0,0,0,0.04)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)]">
            <PulseIcon className="h-4.5 w-4.5 text-ink-soft" />
          </span>
          <div>
            <p className="m-0 text-sm font-semibold tracking-tight text-ink">
              Usage overview
            </p>
            <p className="m-0 text-xs text-ink-faint">Rolling 24-hour window</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-0 border-b border-line sm:grid-cols-4">
          <StatTile
            label="views"
            value={overview.totalsRolling24h.pageViews}
            sparkData={viewsSpark}
          />
          <StatTile
            label="interactions"
            value={overview.totalsRolling24h.interactions}
            sparkData={interactionsSpark}
          />
          <StatTile
            label="api calls"
            value={overview.totalsRolling24h.apiCalls}
            sparkData={apiSpark}
          />
          <StatTile
            label="avg api ms"
            value={overview.totalsRolling24h.avgApiDurationMs || "0"}
            sparkData={latencySpark}
          />
        </div>

        <div className="p-5 sm:p-6">
          <SubCard
            title="Event volume – 24h"
            legend={
              <div className="flex items-center gap-3">
                <LegendDot color="var(--color-accent)" label="total" />
                <LegendDot
                  color="color-mix(in oklch, var(--color-ink-faint) 50%, transparent)"
                  label="api"
                />
              </div>
            }
          >
            <AreaChart id="sys-events" data={areaData} />
          </SubCard>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SubCard title="Top route usage">
          {routeItems.length > 0 ? (
            <BarList items={routeItems} />
          ) : (
            <EmptyCard>No route data yet.</EmptyCard>
          )}
        </SubCard>

        <SubCard title="Activity breakdown">
          {activityItems.length > 0 ? (
            <BarList items={activityItems} />
          ) : (
            <EmptyCard>No activity yet.</EmptyCard>
          )}
        </SubCard>
      </div>

      <SubCard title="Recent activity">
        <SimpleList tight>
          {overview.recentEvents.length > 0 ? (
            overview.recentEvents.map((event) => (
              <SimpleListItem key={event.id}>
                <SimpleListIcon>
                  <TimelineIcon />
                </SimpleListIcon>
                <SimpleListBody>
                  <SimpleListRow>
                    <strong>{formatUsageEvent(event)}</strong>
                    <span>{formatDateTime(event.at, timeZone)}</span>
                  </SimpleListRow>
                  <SimpleListMeta>
                    <span>{event.kind}</span>
                    {event.status ? <span>{event.status}</span> : null}
                    {typeof event.durationMs === "number" ? (
                      <span>{event.durationMs} ms</span>
                    ) : null}
                    {event.skillSlug ? <span>{event.skillSlug}</span> : null}
                  </SimpleListMeta>
                  {formatEventDetail(event.details) ? (
                    <p>{formatEventDetail(event.details)}</p>
                  ) : null}
                </SimpleListBody>
              </SimpleListItem>
            ))
          ) : (
            <EmptyCard>No events yet.</EmptyCard>
          )}
        </SimpleList>
      </SubCard>
    </div>
  );
}

const metaLabel =
  "text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-ink-faint";
const metaValue = "text-sm font-semibold tracking-[-0.03em]";

export function SkillObservabilityPanel({
  usage,
  timeZone,
}: SkillObservabilityPanelProps) {
  const hasAnyActivity =
    usage.pageViews +
      usage.copies +
      usage.saves +
      usage.refreshes +
      usage.apiCalls >
    0;
  const hasEvents = usage.recentEvents.length > 0;

  return (
    <section className="grid gap-0 overflow-hidden border border-line bg-paper-3 dark:bg-paper-2/60">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 pb-2 pt-3">
        <span className={cn(metaLabel, "flex items-center gap-1.5")}>
          <PulseIcon className="h-3 w-3" />
          Usage
        </span>
        {usage.lastSeenAt && (
          <span className="text-[0.625rem] tabular-nums text-ink-faint">
            {formatRelativeDate(usage.lastSeenAt, timeZone)}
          </span>
        )}
      </div>

      {/* Stats */}
      {hasAnyActivity ? (
        <div className="grid grid-cols-2 gap-px border-t border-line/60 bg-line/50 dark:border-line/40 dark:bg-line/30">
          <SidebarMetaCell label="views" value={usage.pageViews} />
          <SidebarMetaCell label="copies" value={usage.copies} />
          <SidebarMetaCell label="refreshes" value={usage.refreshes} />
          <SidebarMetaCell label="saves" value={usage.saves} />
          <SidebarMetaCell
            className="col-span-2"
            label="api calls"
            value={usage.apiCalls}
          />
        </div>
      ) : (
        <div className="border-t border-line/60 px-3 py-3 text-center text-[0.6875rem] text-ink-faint dark:border-line/40">
          No usage recorded yet
        </div>
      )}

      {/* Recent events */}
      {hasEvents && (
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 border-t border-line/60 px-3 py-2 transition-colors hover:bg-paper-2/40 dark:border-line/40 dark:hover:bg-paper-3/40 [&::-webkit-details-marker]:hidden">
            <span className={metaLabel}>Recent activity</span>
            <span className="text-[0.5rem] text-ink-faint transition-transform group-open:rotate-90">
              ▶
            </span>
          </summary>
          <div className="grid gap-0 border-t border-line/40 dark:border-line/30">
            {usage.recentEvents.map((event) => (
              <div
                className="flex items-center justify-between gap-2 px-3 py-1.5 text-[0.6875rem]"
                key={event.id}
              >
                <span className="min-w-0 truncate text-ink-soft">
                  {formatUsageEvent(event)}
                </span>
                <span className="shrink-0 tabular-nums text-ink-faint">
                  {formatRelativeDate(event.at, timeZone)}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}

function SidebarMetaCell({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-0.5 bg-paper-3 px-3 py-2 dark:bg-paper-2/60",
        className
      )}
    >
      <small className={metaLabel}>{label}</small>
      <strong className={metaValue}>{value}</strong>
    </div>
  );
}
