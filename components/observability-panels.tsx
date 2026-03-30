import { PulseIcon, TimelineIcon } from "@/components/frontier-icons";
import { AreaChart } from "@/components/charts/area-chart";
import { BarList } from "@/components/charts/bar-list";
import { StatTile } from "@/components/charts/stat-tile";
import { EmptyCard } from "@/components/ui/empty-card";
import { Panel, PanelHead } from "@/components/ui/panel";
import {
  SimpleList,
  SimpleListBody,
  SimpleListIcon,
  SimpleListItem,
  SimpleListMeta,
  SimpleListRow
} from "@/components/ui/simple-list";
import { formatDateTime, formatRelativeDate } from "@/lib/format";
import { formatUsageEvent, type SkillUsageSummary, type UsageOverview } from "@/lib/usage";

type SystemObservabilityPanelProps = {
  overview: UsageOverview;
};

type SkillObservabilityPanelProps = {
  usage: SkillUsageSummary;
};

const sectionKicker = "inline-block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft";

function formatEventDetail(details?: string) {
  if (!details) return null;
  return details.length > 96 ? `${details.slice(0, 93)}...` : details;
}

export function SystemObservabilityPanel({ overview }: SystemObservabilityPanelProps) {
  const viewsSpark = overview.timeSeries.map((b) => b.views);
  const interactionsSpark = overview.timeSeries.map((b) => b.interactions);
  const apiSpark = overview.timeSeries.map((b) => b.api);
  const latencySpark = overview.latencySeries.map((b) => b.avgMs);

  const areaData = overview.timeSeries.map((b) => ({
    label: b.label,
    value: b.total,
    secondary: b.api,
  }));

  const routeItems = overview.routeUsage.map((entry) => ({
    label: entry.route,
    value: entry.count,
    secondary:
      entry.errorCount > 0
        ? `${entry.avgDurationMs}ms · ${entry.errorCount} err`
        : `${entry.avgDurationMs}ms avg`,
  }));

  const activityItems = overview.activityCounts.map((entry) => ({
    label: entry.label,
    value: entry.count,
  }));

  return (
    <Panel className="gap-[18px]">
      <PanelHead>
        <div>
          <span className={sectionKicker}>Observability</span>
          <h2 className="m-0 text-lg font-semibold tracking-[-0.03em]">Usage and route calls</h2>
        </div>
      </PanelHead>

      <div className="grid max-lg:grid-cols-2 grid-cols-4 gap-3">
        <StatTile label="views" value={overview.totals.pageViews} sparkData={viewsSpark} />
        <StatTile label="interactions" value={overview.totals.interactions} sparkData={interactionsSpark} />
        <StatTile label="api calls" value={overview.totals.apiCalls} sparkData={apiSpark} />
        <StatTile label="avg api ms" value={overview.totals.avgApiDurationMs || "0"} sparkData={latencySpark} />
      </div>

      <article className="grid gap-3.5 rounded-2xl border border-line bg-paper-3 p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <span className={sectionKicker}>Timeline</span>
            <h3 className="m-0 text-base font-semibold tracking-[-0.03em]">Event volume — 24h</h3>
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
        <AreaChart id="sys-events" data={areaData} />
      </article>

      <div className="grid max-lg:grid-cols-1 grid-cols-2 gap-4">
        <article className="grid gap-3.5 rounded-2xl border border-line bg-paper-3 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <span className={sectionKicker}>Routes</span>
              <h3 className="m-0 text-base font-semibold tracking-[-0.03em]">Top route usage</h3>
            </div>
          </div>
          {routeItems.length > 0 ? (
            <BarList items={routeItems} />
          ) : (
            <EmptyCard>No route data yet.</EmptyCard>
          )}
        </article>

        <article className="grid gap-3.5 rounded-2xl border border-line bg-paper-3 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <span className={sectionKicker}>Activity</span>
              <h3 className="m-0 text-base font-semibold tracking-[-0.03em]">What people do</h3>
            </div>
          </div>
          {activityItems.length > 0 ? (
            <BarList items={activityItems} />
          ) : (
            <EmptyCard>No activity yet.</EmptyCard>
          )}
        </article>
      </div>

      <article className="grid gap-3.5 rounded-2xl border border-line bg-paper-3 p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <span className={sectionKicker}>Recent</span>
            <h3 className="m-0 text-base font-semibold tracking-[-0.03em]">Recent activity</h3>
          </div>
        </div>
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
                    <span>{formatDateTime(event.at)}</span>
                  </SimpleListRow>
                  <SimpleListMeta>
                    <span>{event.kind}</span>
                    {event.status ? <span>{event.status}</span> : null}
                    {typeof event.durationMs === "number" ? <span>{event.durationMs} ms</span> : null}
                    {event.skillSlug ? <span>{event.skillSlug}</span> : null}
                  </SimpleListMeta>
                  {formatEventDetail(event.details) ? <p>{formatEventDetail(event.details)}</p> : null}
                </SimpleListBody>
              </SimpleListItem>
            ))
          ) : (
            <EmptyCard>No events yet.</EmptyCard>
          )}
        </SimpleList>
      </article>
    </Panel>
  );
}

export function SkillObservabilityPanel({ usage }: SkillObservabilityPanelProps) {
  const hasAnyActivity =
    usage.pageViews + usage.copies + usage.saves + usage.refreshes + usage.apiCalls > 0;

  const statsItems = [
    { label: "views", value: usage.pageViews },
    { label: "copies", value: usage.copies },
    { label: "saves", value: usage.saves },
    { label: "refreshes", value: usage.refreshes },
    { label: "api calls", value: usage.apiCalls },
  ];

  return (
    <Panel compact className="grid gap-[18px]">
      <div className="grid gap-0.5">
        <span className={sectionKicker}>Observability</span>
        <h2 className="m-0 text-lg font-semibold tracking-[-0.03em]">Usage stats</h2>
      </div>

      {usage.lastSeenAt && (
        <div className="flex items-center gap-2 text-xs text-ink-faint">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          Active {formatRelativeDate(usage.lastSeenAt)}
        </div>
      )}

      {hasAnyActivity ? (
        <BarList items={statsItems} compact />
      ) : (
        <div className="rounded-xl border border-line/60 px-4 py-5 text-center text-xs text-ink-faint">
          No usage recorded yet
        </div>
      )}

      {usage.recentEvents.length > 0 && (
        <article className="grid gap-3 rounded-2xl border border-line bg-paper-3 p-4">
          <h3 className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
            Latest usage
          </h3>
          <SimpleList tight>
            {usage.recentEvents.map((event) => (
              <SimpleListItem key={event.id}>
                <SimpleListIcon>
                  <PulseIcon />
                </SimpleListIcon>
                <SimpleListBody>
                  <SimpleListRow>
                    <strong>{formatUsageEvent(event)}</strong>
                    <span>{formatRelativeDate(event.at)}</span>
                  </SimpleListRow>
                  <SimpleListMeta>
                    <span>{event.kind}</span>
                    {event.status ? <span>{event.status}</span> : null}
                    {typeof event.durationMs === "number" ? <span>{event.durationMs} ms</span> : null}
                  </SimpleListMeta>
                </SimpleListBody>
              </SimpleListItem>
            ))}
          </SimpleList>
        </article>
      )}
    </Panel>
  );
}
