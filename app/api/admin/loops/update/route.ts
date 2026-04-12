import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth, AuthError } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import { findSkillAuthorForSession } from "@/lib/db/skill-authors";
import { getSkillBySlug } from "@/lib/db/skills";
import {
  buildImportedSkillDraft,
  buildImportedSkillRecord,
  createNextImportedSkillVersion,
  fetchRemoteText,
  listImportedSkills,
  saveImportedSkills,
} from "@/lib/imports";
import {
  buildLoopUpdateSourceLog,
  buildLoopUpdateTarget,
} from "@/lib/loop-updates";
import { runTrackedUserSkillUpdate } from "@/lib/refresh";
import { canSessionEditSkill } from "@/lib/skill-authoring";
import {
  getManualUpdateCooldown,
  isAutomationImminent,
} from "@/lib/skill-limits";
import { recordLoopRun } from "@/lib/system-state";
import { diffMultilineText } from "@/lib/text-diff";
import type {
  DailySignal,
  ImportedSkillDocument,
  LoopRunRecord,
  LoopUpdateResult,
  LoopUpdateSourceLog,
  LoopUpdateStreamEvent,
  SourceDefinition,
} from "@/lib/types";
import { logUsageEvent, withApiUsage } from "@/lib/usage-server";
import {
  listUserSkillDocuments,
  saveUserSkillDocuments,
} from "@/lib/user-skills";

export const runtime = "nodejs";

const bodySchema = z.object({
  origin: z.enum(["user", "remote"]),
  slug: z.string().min(1),
});

function sendEvent(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  event: LoopUpdateStreamEvent
) {
  controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
}

function buildImportedNoopRefresh(
  skill: ImportedSkillDocument,
  lastSyncedAt?: string
): ImportedSkillDocument {
  const latestVersionNumber = Math.max(
    ...skill.versions.map((version) => version.version)
  );

  return {
    ...skill,
    lastSyncedAt,
    versions: skill.versions.map((version) =>
      version.version === latestVersionNumber
        ? {
            ...version,
            lastSyncedAt,
          }
        : version
    ),
  };
}

async function runUserLoopUpdate(
  slug: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder
): Promise<void> {
  const skills = await listUserSkillDocuments();
  const skill = skills.find((entry) => entry.slug === slug);

  if (!skill) {
    throw new Error("This loop could not be found in the local user store.");
  }

  if (skill.sources.length === 0) {
    throw new Error("This loop does not have any tracked sources yet.");
  }

  const cycle = await runTrackedUserSkillUpdate(skill, "manual", {
    onMessage(message) {
      sendEvent(controller, encoder, {
        message,
        type: "analysis",
      });
    },
    onReasoningStep(step) {
      sendEvent(controller, encoder, {
        step,
        type: "reasoning-step",
      });
    },
    onSource(source) {
      sendEvent(controller, encoder, {
        source,
        type: "source",
      });
    },
    onStart(loop) {
      sendEvent(controller, encoder, {
        loop,
        type: "start",
      });
    },
  });

  await saveUserSkillDocuments([cycle.nextSkill]);

  try {
    await recordLoopRun(cycle.loopRun);
  } catch (recordError) {
    console.error(
      `[loops/update] Failed to record loop run for "${slug}":`,
      recordError
    );
  }

  try {
    await logUsageEvent({
      categorySlug: cycle.nextSkill.category,
      details: cycle.result.changed ? cycle.result.nextVersionLabel : "No diff",
      kind: "skill_refresh",
      label: "Refreshed skill",
      path: cycle.result.href,
      skillSlug: cycle.result.slug,
      source: "api",
    });
  } catch (usageError) {
    console.error(
      `[loops/update] Failed to log usage event for "${slug}":`,
      usageError
    );
  }

  sendEvent(controller, encoder, {
    result: cycle.result,
    sources: cycle.sourceLogs,
    type: "complete",
  });
}

function importedSkillChanged(
  current: ImportedSkillDocument,
  incoming: ImportedSkillDocument
): boolean {
  const latest =
    current.versions.find((version) => version.version === current.version) ??
    current.versions[0];

  return (
    latest.title !== incoming.title ||
    latest.description !== incoming.description ||
    latest.category !== incoming.category ||
    latest.body !== incoming.body ||
    latest.canonicalUrl !== incoming.canonicalUrl ||
    latest.ownerName !== incoming.ownerName ||
    JSON.stringify(latest.tags) !== JSON.stringify(incoming.tags)
  );
}

function buildImportedSourceLog(
  source: SourceDefinition,
  items: DailySignal[],
  note: string
): LoopUpdateSourceLog {
  return {
    ...buildLoopUpdateSourceLog(source, "done"),
    itemCount: items.length,
    items,
    note,
  };
}

async function assertManualUpdateAccess(
  session: SessionUser,
  slug: string,
  origin: "user" | "remote"
): Promise<void> {
  const sessionAuthor = await findSkillAuthorForSession(session);

  if (origin === "user") {
    const skill = await getSkillBySlug(slug);
    if (!skill) {
      throw new Error("This loop could not be found in the local user store.");
    }

    if (!canSessionEditSkill(skill, session, sessionAuthor)) {
      throw new AuthError(
        "Only the skill owner can trigger manual refreshes.",
        403
      );
    }

    return;
  }

  if (
    !canSessionEditSkill(
      { authorId: undefined, creatorClerkUserId: undefined },
      session,
      null
    )
  ) {
    throw new AuthError(
      "Track the skill or use the owner account before triggering manual refreshes.",
      403
    );
  }
}

async function runImportedLoopUpdate(
  slug: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder
): Promise<void> {
  const startedAt = new Date().toISOString();
  const importedSkills = await listImportedSkills();
  const skill = importedSkills.find((entry) => entry.slug === slug);

  if (!skill) {
    throw new Error("This imported loop could not be found.");
  }

  const beforeRecord = buildImportedSkillRecord(skill);
  const target = buildLoopUpdateTarget(beforeRecord);
  const canonicalSource = beforeRecord.sources?.[0];

  if (!canonicalSource) {
    throw new Error("This imported loop does not expose a canonical source.");
  }

  sendEvent(controller, encoder, {
    loop: target,
    type: "start",
  });

  const running = {
    ...buildLoopUpdateSourceLog(canonicalSource, "running"),
    note: "Fetching remote source.",
  } satisfies LoopUpdateSourceLog;
  sendEvent(controller, encoder, {
    source: running,
    type: "source",
  });

  const { raw, normalizedUrl } = await fetchRemoteText(skill.canonicalUrl);
  const refreshed = buildImportedSkillDraft(raw, normalizedUrl, new Date());
  const logItems: DailySignal[] = [
    {
      publishedAt: refreshed.updatedAt,
      source: canonicalSource.label,
      summary: refreshed.description,
      tags: refreshed.tags,
      title: refreshed.title,
      url: refreshed.canonicalUrl,
    },
  ];
  const fetchedSourceLog = buildImportedSourceLog(
    canonicalSource,
    logItems,
    `Fetched ${raw.length.toLocaleString()} bytes from the canonical source.`
  );
  sendEvent(controller, encoder, {
    source: fetchedSourceLog,
    type: "source",
  });

  sendEvent(controller, encoder, {
    message:
      "Comparing the fetched source against the current imported loop revision.",
    type: "analysis",
  });

  const changed = importedSkillChanged(skill, refreshed);
  const nextSkill = changed
    ? createNextImportedSkillVersion(
        skill,
        {
          body: refreshed.body,
          canonicalUrl: refreshed.canonicalUrl,
          category: refreshed.category,
          description: refreshed.description,
          lastSyncedAt: refreshed.lastSyncedAt,
          ownerName: refreshed.ownerName,
          sourceUrl: refreshed.sourceUrl,
          syncEnabled: refreshed.syncEnabled,
          tags: refreshed.tags,
          title: refreshed.title,
          visibility: refreshed.visibility,
        },
        refreshed.updatedAt
      )
    : buildImportedNoopRefresh(skill, refreshed.lastSyncedAt);

  await saveImportedSkills([nextSkill]);

  const afterRecord = buildImportedSkillRecord(nextSkill);
  const result: LoopUpdateResult = {
    changed,
    diffLines: diffMultilineText(beforeRecord.body, afterRecord.body),
    href: afterRecord.href,
    items: logItems,
    nextVersionLabel: afterRecord.versionLabel,
    origin: "remote",
    previousVersionLabel: beforeRecord.versionLabel,
    slug,
    summary: changed
      ? `A fresh imported revision landed from ${canonicalSource.label}.`
      : `No structural diff landed from ${canonicalSource.label}.`,
    title: afterRecord.title,
    updatedAt: afterRecord.updatedAt,
    whatChanged: changed
      ? `The imported loop content changed and a new version was minted.`
      : `The source was fetched successfully, but the imported loop body stayed materially the same.`,
  };

  const loopRun: LoopRunRecord = {
    bodyChanged: changed,
    changedSections: changed ? ["Canonical import"] : [],
    diffLines: result.diffLines.slice(0, 120),
    editorModel: "canonical-import",
    finishedAt: new Date().toISOString(),
    href: afterRecord.href,
    id: randomUUID(),
    messages: [
      "Fetched the canonical source.",
      changed
        ? "Detected a structural diff against the current imported revision."
        : "No structural diff detected.",
      changed
        ? `Saved ${afterRecord.versionLabel}.`
        : `Kept ${afterRecord.versionLabel}.`,
    ],
    nextVersionLabel: afterRecord.versionLabel,
    origin: "remote",
    previousVersionLabel: beforeRecord.versionLabel,
    signalCount: logItems.length,
    slug,
    sourceCount: 1,
    sources: [fetchedSourceLog],
    startedAt,
    status: "success",
    summary: result.summary,
    title: afterRecord.title,
    trigger: "manual",
    whatChanged: result.whatChanged,
  };

  try {
    await recordLoopRun(loopRun);
  } catch (recordError) {
    console.error(
      `[loops/update] Failed to record imported loop run for "${slug}":`,
      recordError
    );
  }

  try {
    await logUsageEvent({
      categorySlug: afterRecord.category,
      details: changed ? afterRecord.versionLabel : "No diff",
      kind: "skill_refresh",
      label: "Refreshed imported skill",
      path: afterRecord.href,
      skillSlug: afterRecord.slug,
      source: "api",
    });
  } catch (usageError) {
    console.error(
      `[loops/update] Failed to log usage event for imported "${slug}":`,
      usageError
    );
  }

  sendEvent(controller, encoder, {
    result,
    sources: [fetchedSourceLog],
    type: "complete",
  });
}

export async function POST(request: Request) {
  return withApiUsage(
    {
      label: "Manual loop update",
      method: "POST",
      route: "/api/admin/loops/update",
    },
    async () => {
      let session: SessionUser;
      try {
        session = await requireAuth();
      } catch (error) {
        if (error instanceof AuthError) {
          return NextResponse.json(
            { error: error.message },
            { status: error.status }
          );
        }
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const payload = bodySchema.safeParse(await request.json());
      if (!payload.success) {
        return NextResponse.json(
          { error: "Invalid update payload." },
          { status: 400 }
        );
      }

      try {
        await assertManualUpdateAccess(
          session,
          payload.data.slug,
          payload.data.origin
        );
      } catch (error) {
        if (error instanceof AuthError) {
          return NextResponse.json(
            { error: error.message },
            { status: error.status }
          );
        }
        if (error instanceof Error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const cooldown = await getManualUpdateCooldown(payload.data.slug);
      if (!cooldown.allowed) {
        const minutesLeft = Math.ceil(cooldown.remainingMs / 60_000);
        return NextResponse.json(
          {
            error: `Manual updates are rate-limited. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.`,
          },
          { status: 429 }
        );
      }

      const skill =
        payload.data.origin === "user"
          ? await getSkillBySlug(payload.data.slug)
          : null;
      const automationWarning = skill?.automation
        ? isAutomationImminent(skill.automation)
        : { imminent: false, nextRunAt: null };

      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          const startedAt = new Date().toISOString();
          try {
            if (automationWarning.imminent) {
              sendEvent(controller, encoder, {
                message: `Heads up: a scheduled automation is due ${automationWarning.nextRunAt ? "at " + new Date(automationWarning.nextRunAt).toLocaleString() : "soon"}. This manual run will take its place.`,
                type: "analysis",
              });
            }
            if (payload.data.origin === "user") {
              await runUserLoopUpdate(payload.data.slug, controller, encoder);
            } else {
              await runImportedLoopUpdate(
                payload.data.slug,
                controller,
                encoder
              );
            }
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : "Manual loop update failed.";
            const elapsedMs = Date.now() - new Date(startedAt).getTime();
            console.error(
              `[loops/update] Manual update FAILED for "${payload.data.slug}" after ${(elapsedMs / 1000).toFixed(1)}s: ${message}`,
              error instanceof Error ? error.stack : ""
            );
            try {
              await recordLoopRun({
                changedSections: [],
                diffLines: [],
                errorMessage: message,
                finishedAt: new Date().toISOString(),
                id: randomUUID(),
                messages: [message],
                origin: payload.data.origin,
                signalCount: 0,
                slug: payload.data.slug,
                sourceCount: 0,
                sources: [],
                startedAt,
                status: "error",
                title: payload.data.slug,
                trigger: "manual",
              });
            } catch (recordError) {
              console.error(
                `[loops/update] Failed to record error loop run for "${payload.data.slug}":`,
                recordError
              );
            }
            sendEvent(controller, encoder, {
              message,
              type: "error",
            });
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "cache-control": "no-store",
          "content-type": "application/x-ndjson; charset=utf-8",
        },
      });
    }
  );
}
