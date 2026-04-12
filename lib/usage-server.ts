import { randomUUID } from "node:crypto";

import { recordUsageEvent } from "@/lib/system-state";
import type {
  CategorySlug,
  UsageEventKind,
  UsageEventRecord,
  UsageEventSource,
} from "@/lib/types";

interface UsageEventInput {
  at?: string;
  kind: UsageEventKind;
  source: UsageEventSource;
  label: string;
  path?: string;
  route?: string;
  method?: string;
  status?: number;
  durationMs?: number;
  ok?: boolean;
  skillSlug?: string;
  categorySlug?: CategorySlug;
  details?: string;
}

interface ApiUsageContext {
  route: string;
  method: string;
  label?: string;
  skillSlug?: string;
  categorySlug?: CategorySlug;
  details?: string;
}

export async function logUsageEvent(input: UsageEventInput): Promise<void> {
  try {
    const entry: UsageEventRecord = {
      at: input.at ?? new Date().toISOString(),
      categorySlug: input.categorySlug,
      details: input.details,
      durationMs: input.durationMs,
      id: randomUUID(),
      kind: input.kind,
      label: input.label,
      method: input.method,
      ok: input.ok,
      path: input.path,
      route: input.route,
      skillSlug: input.skillSlug,
      source: input.source,
      status: input.status,
    };

    await recordUsageEvent(entry);
  } catch (error) {
    console.error("[usage] Failed to record usage event:", error);
  }
}

export async function withApiUsage(
  context: ApiUsageContext,
  handler: () => Promise<Response>
): Promise<Response> {
  const startedAt = Date.now();

  try {
    const response = await handler();
    await logUsageEvent({
      categorySlug: context.categorySlug,
      details: context.details,
      durationMs: Date.now() - startedAt,
      kind: "api_call",
      label: context.label ?? context.route,
      method: context.method,
      ok: response.ok,
      route: context.route,
      skillSlug: context.skillSlug,
      source: "api",
      status: response.status,
    });
    return response;
  } catch (error) {
    await logUsageEvent({
      categorySlug: context.categorySlug,
      details: error instanceof Error ? error.message : "Unknown error",
      durationMs: Date.now() - startedAt,
      kind: "api_call",
      label: context.label ?? context.route,
      method: context.method,
      ok: false,
      route: context.route,
      skillSlug: context.skillSlug,
      source: "api",
      status: 500,
    });
    throw error;
  }
}
