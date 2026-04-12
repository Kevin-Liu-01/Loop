import { getServerSupabase } from "@/lib/db/client";
import type {
  BillingEventRecord,
  LoopRunRecord,
  RefreshRunRecord,
  StripeSubscriptionRecord,
  UsageEventRecord,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Loop runs
// ---------------------------------------------------------------------------

export async function recordLoopRun(entry: LoopRunRecord): Promise<void> {
  const db = getServerSupabase();
  const baseRow = {
    body_changed: entry.bodyChanged ?? null,
    changed_sections: entry.changedSections,
    diff_lines: entry.diffLines,
    editor_model: entry.editorModel ?? null,
    error_message: entry.errorMessage ?? null,
    finished_at: entry.finishedAt,
    href: entry.href ?? null,
    id: entry.id,
    messages: entry.messages,
    next_version_label: entry.nextVersionLabel ?? null,
    origin: entry.origin,
    previous_version_label: entry.previousVersionLabel ?? null,
    reasoning_steps: entry.reasoningSteps ?? null,
    signal_count: entry.signalCount,
    skill_slug: entry.slug,
    source_count: entry.sourceCount,
    sources: entry.sources,
    started_at: entry.startedAt,
    status: entry.status,
    summary: entry.summary ?? null,
    title: entry.title,
    trigger: entry.trigger,
    what_changed: entry.whatChanged ?? null,
  };

  const fullRow = {
    ...baseRow,
    added_sources: entry.addedSources ?? null,
    searches_used: entry.searchesUsed ?? null,
  };

  const { error } = await db
    .from("loop_runs")
    .upsert(fullRow as never, { onConflict: "id" });

  if (error) {
    if (
      error.message.includes("added_sources") ||
      error.message.includes("searches_used")
    ) {
      console.warn(
        "[db] loop_runs missing new columns – retrying without searches_used/added_sources (run migration 017)"
      );
      const { error: retryError } = await db
        .from("loop_runs")
        .upsert(baseRow as never, { onConflict: "id" });
      if (retryError) {
        throw new Error(`recordLoopRun failed: ${retryError.message}`);
      }
      return;
    }
    throw new Error(`recordLoopRun failed: ${error.message}`);
  }
}

export async function listLoopRuns(options?: {
  skillSlug?: string;
  limit?: number;
}): Promise<LoopRunRecord[]> {
  const db = getServerSupabase();
  let query = db
    .from("loop_runs")
    .select("*")
    .order("started_at", { ascending: false });

  if (options?.skillSlug) {
    query = query.eq("skill_slug", options.skillSlug);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`listLoopRuns failed: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const r = row as typeof row & {
      searches_used?: number | null;
      added_sources?: unknown;
    };
    return {
      addedSources: (r.added_sources ??
        undefined) as LoopRunRecord["addedSources"],
      bodyChanged: r.body_changed ?? undefined,
      changedSections: r.changed_sections,
      diffLines: r.diff_lines as LoopRunRecord["diffLines"],
      editorModel: r.editor_model ?? undefined,
      errorMessage: r.error_message ?? undefined,
      finishedAt: r.finished_at,
      href: r.href ?? undefined,
      id: r.id,
      messages: r.messages,
      nextVersionLabel: r.next_version_label ?? undefined,
      origin: r.origin as LoopRunRecord["origin"],
      previousVersionLabel: r.previous_version_label ?? undefined,
      reasoningSteps: (r.reasoning_steps ??
        undefined) as LoopRunRecord["reasoningSteps"],
      searchesUsed: r.searches_used ?? undefined,
      signalCount: r.signal_count,
      slug: r.skill_slug,
      sourceCount: r.source_count,
      sources: r.sources as LoopRunRecord["sources"],
      startedAt: r.started_at,
      status: r.status as LoopRunRecord["status"],
      summary: r.summary ?? undefined,
      title: r.title,
      trigger: r.trigger as LoopRunRecord["trigger"],
      whatChanged: r.what_changed ?? undefined,
    };
  });
}

// ---------------------------------------------------------------------------
// Refresh runs
// ---------------------------------------------------------------------------

export async function recordRefreshRun(entry: RefreshRunRecord): Promise<void> {
  const db = getServerSupabase();
  const { error } = await db.from("refresh_runs").upsert(
    {
      category_count: entry.categoryCount ?? null,
      daily_brief_count: entry.dailyBriefCount ?? null,
      error_message: entry.errorMessage ?? null,
      finished_at: entry.finishedAt,
      focus_imported_skill_slugs: entry.focusImportedSkillSlugs,
      focus_skill_slugs: entry.focusSkillSlugs,
      generated_at: entry.generatedAt ?? null,
      generated_from: entry.generatedFrom ?? null,
      id: entry.id,
      refresh_category_signals: entry.refreshCategorySignals,
      refresh_imported_skills: entry.refreshImportedSkills,
      refresh_user_skills: entry.refreshUserSkills,
      skill_count: entry.skillCount ?? null,
      started_at: entry.startedAt,
      status: entry.status,
      upload_blob: entry.uploadBlob,
      write_local: entry.writeLocal,
    } as never,
    { onConflict: "id" }
  );

  if (error) {
    throw new Error(`recordRefreshRun failed: ${error.message}`);
  }
}

export async function listRefreshRuns(limit = 40): Promise<RefreshRunRecord[]> {
  const db = getServerSupabase();
  const { data, error } = await db
    .from("refresh_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`listRefreshRuns failed: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    categoryCount: row.category_count ?? undefined,
    dailyBriefCount: row.daily_brief_count ?? undefined,
    errorMessage: row.error_message ?? undefined,
    finishedAt: row.finished_at,
    focusImportedSkillSlugs: row.focus_imported_skill_slugs,
    focusSkillSlugs: row.focus_skill_slugs,
    generatedAt: row.generated_at ?? undefined,
    generatedFrom: (row.generated_from ??
      undefined) as RefreshRunRecord["generatedFrom"],
    id: row.id,
    refreshCategorySignals: row.refresh_category_signals,
    refreshImportedSkills: row.refresh_imported_skills,
    refreshUserSkills: row.refresh_user_skills,
    skillCount: row.skill_count ?? undefined,
    startedAt: row.started_at,
    status: row.status as RefreshRunRecord["status"],
    uploadBlob: row.upload_blob,
    writeLocal: row.write_local,
  }));
}

// ---------------------------------------------------------------------------
// Usage events
// ---------------------------------------------------------------------------

export async function recordUsageEvent(entry: UsageEventRecord): Promise<void> {
  const db = getServerSupabase();
  const { error } = await db.from("usage_events").insert({
    at: entry.at,
    category_slug: entry.categorySlug ?? null,
    details: entry.details ?? null,
    duration_ms: entry.durationMs ?? null,
    id: entry.id,
    kind: entry.kind,
    label: entry.label,
    method: entry.method ?? null,
    ok: entry.ok ?? null,
    path: entry.path ?? null,
    route: entry.route ?? null,
    skill_slug: entry.skillSlug ?? null,
    source: entry.source,
    status: entry.status ?? null,
  } as never);

  if (error) {
    throw new Error(`recordUsageEvent failed: ${error.message}`);
  }
}

function mapUsageEventRow(row: Record<string, unknown>): UsageEventRecord {
  return {
    at: row.at as string,
    categorySlug: (row.category_slug ??
      undefined) as UsageEventRecord["categorySlug"],
    details: (row.details ?? undefined) as string | undefined,
    durationMs: (row.duration_ms ?? undefined) as number | undefined,
    id: row.id as string,
    kind: row.kind as UsageEventRecord["kind"],
    label: row.label as string,
    method: (row.method ?? undefined) as string | undefined,
    ok: (row.ok ?? undefined) as boolean | undefined,
    path: (row.path ?? undefined) as string | undefined,
    route: (row.route ?? undefined) as string | undefined,
    skillSlug: (row.skill_slug ?? undefined) as string | undefined,
    source: row.source as UsageEventRecord["source"],
    status: (row.status ?? undefined) as number | undefined,
  };
}

export async function listUsageEvents(
  limit = 100
): Promise<UsageEventRecord[]> {
  const db = getServerSupabase();
  const { data, error } = await db
    .from("usage_events")
    .select("*")
    .order("at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`listUsageEvents failed: ${error.message}`);
  }

  return (data ?? []).map((row) =>
    mapUsageEventRow(row as Record<string, unknown>)
  );
}

/** Events with `at >= sinceIso`, newest first (for calendar-bounded overview windows). */
export async function listUsageEventsSince(
  sinceIso: string,
  limit: number
): Promise<UsageEventRecord[]> {
  const db = getServerSupabase();
  const { data, error } = await db
    .from("usage_events")
    .select("*")
    .gte("at", sinceIso)
    .order("at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`listUsageEventsSince failed: ${error.message}`);
  }

  return (data ?? []).map((row) =>
    mapUsageEventRow(row as Record<string, unknown>)
  );
}

// ---------------------------------------------------------------------------
// Billing events
// ---------------------------------------------------------------------------

export async function recordBillingEvent(
  entry: BillingEventRecord
): Promise<void> {
  const db = getServerSupabase();
  const { error } = await db.from("billing_events").upsert(
    {
      amount: entry.amount ?? null,
      created_at: entry.createdAt,
      currency: entry.currency ?? null,
      customer_email: entry.customerEmail ?? null,
      customer_id: entry.customerId ?? null,
      id: entry.id,
      livemode: entry.livemode,
      plan_slug: entry.planSlug ?? null,
      status: entry.status ?? null,
      subscription_id: entry.subscriptionId ?? null,
      type: entry.type,
    } as never,
    { onConflict: "id" }
  );

  if (error) {
    throw new Error(`recordBillingEvent failed: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------

export async function upsertSubscription(
  entry: StripeSubscriptionRecord
): Promise<void> {
  const db = getServerSupabase();
  const { error } = await db.from("subscriptions").upsert(
    {
      cancel_at_period_end: entry.cancelAtPeriodEnd,
      checkout_completed_at: entry.checkoutCompletedAt ?? null,
      clerk_user_id: entry.clerkUserId ?? null,
      current_period_end: entry.currentPeriodEnd ?? null,
      customer_email: entry.customerEmail ?? null,
      customer_id: entry.customerId,
      id: entry.id,
      latest_invoice_id: entry.latestInvoiceId ?? null,
      plan_slug: entry.planSlug ?? null,
      status: entry.status,
      updated_at: entry.updatedAt,
    } as never,
    { onConflict: "id" }
  );

  if (error) {
    throw new Error(`upsertSubscription failed: ${error.message}`);
  }
}

export async function listSubscriptions(): Promise<StripeSubscriptionRecord[]> {
  const db = getServerSupabase();
  const { data, error } = await db
    .from("subscriptions")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`listSubscriptions failed: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    cancelAtPeriodEnd: row.cancel_at_period_end,
    checkoutCompletedAt: row.checkout_completed_at ?? undefined,
    clerkUserId: row.clerk_user_id ?? undefined,
    currentPeriodEnd: row.current_period_end ?? undefined,
    customerEmail: row.customer_email ?? undefined,
    customerId: row.customer_id,
    id: row.id,
    latestInvoiceId: row.latest_invoice_id ?? undefined,
    planSlug: row.plan_slug ?? undefined,
    status: row.status,
    updatedAt: row.updated_at,
  }));
}
