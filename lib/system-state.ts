import {
  recordLoopRun as dbRecordLoopRun,
  listLoopRuns as dbListLoopRuns,
  recordRefreshRun as dbRecordRefreshRun,
  listRefreshRuns as dbListRefreshRuns,
  recordUsageEvent as dbRecordUsageEvent,
  listUsageEvents as dbListUsageEvents,
  listUsageEventsSince as dbListUsageEventsSince,
  recordBillingEvent as dbRecordBillingEvent,
  upsertSubscription as dbUpsertSubscription,
  listSubscriptions as dbListSubscriptions,
} from "@/lib/db/system-state";
import type {
  BillingEventRecord,
  LoopRunRecord,
  RefreshRunRecord,
  StripeSubscriptionRecord,
  UsageEventRecord,
} from "@/lib/types";
import { USAGE_OVERVIEW_EVENTS_LIMIT } from "@/lib/usage-constants";
import { usageEventsSinceIsoForOverview } from "@/lib/usage-day-bounds";

export async function recordRefreshRun(entry: RefreshRunRecord): Promise<void> {
  await dbRecordRefreshRun(entry);
}

export async function recordLoopRun(entry: LoopRunRecord): Promise<void> {
  await dbRecordLoopRun(entry);
}

export async function recordBillingEvent(
  entry: BillingEventRecord
): Promise<void> {
  await dbRecordBillingEvent(entry);
}

export async function upsertSubscription(
  entry: StripeSubscriptionRecord
): Promise<void> {
  await dbUpsertSubscription(entry);
}

export async function recordUsageEvent(entry: UsageEventRecord): Promise<void> {
  await dbRecordUsageEvent(entry);
}

export async function listLoopRuns(options?: {
  skillSlug?: string;
  limit?: number;
}): Promise<LoopRunRecord[]> {
  return dbListLoopRuns(options);
}

export async function listRefreshRuns(
  limit?: number
): Promise<RefreshRunRecord[]> {
  return dbListRefreshRuns(limit);
}

export async function listUsageEvents(
  limit?: number
): Promise<UsageEventRecord[]> {
  return dbListUsageEvents(limit);
}

/** Enough history for calendar “today vs yesterday” + rolling 24h charts. */
export async function listUsageEventsForOverview(
  timeZone = "UTC"
): Promise<UsageEventRecord[]> {
  return dbListUsageEventsSince(
    usageEventsSinceIsoForOverview(new Date(), timeZone),
    USAGE_OVERVIEW_EVENTS_LIMIT
  );
}

export async function listSubscriptions(): Promise<StripeSubscriptionRecord[]> {
  return dbListSubscriptions();
}
