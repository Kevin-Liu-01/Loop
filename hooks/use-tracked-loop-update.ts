"use client";

import { useCallback, useRef } from "react";

import { useActiveOperations } from "@/components/active-operations-provider";
import { computeProgress } from "@/lib/active-operations";
import type { ActiveOperationKind } from "@/lib/active-operations";
import { streamLoopUpdate } from "@/lib/stream-loop-update";
import type { StreamLoopCallbacks } from "@/lib/stream-loop-update";
import type {
  AgentReasoningStep,
  LoopUpdateResult,
  LoopUpdateSourceLog,
  LoopUpdateTarget,
} from "@/lib/types";

interface TrackedUpdateCallbacks {
  onStart?: (loop: LoopUpdateTarget) => void;
  onSource?: (source: LoopUpdateSourceLog) => void;
  onMessage?: (message: string) => void;
  onReasoningStep?: (step: AgentReasoningStep) => void;
  onComplete?: (
    result: LoopUpdateResult,
    sources: LoopUpdateSourceLog[]
  ) => void;
  onError?: (message: string) => void;
}

interface TrackedUpdateOptions {
  slug: string;
  origin: string;
  label: string;
  href?: string;
  trigger?: "manual" | "automation";
  kind?: ActiveOperationKind;
  callbacks?: TrackedUpdateCallbacks;
}

export function useTrackedLoopUpdate() {
  const { addOperation, updateOperation } = useActiveOperations();
  const totalSourcesRef = useRef(0);
  const completedSourcesRef = useRef(0);

  const run = useCallback(
    async (opts: TrackedUpdateOptions): Promise<void> => {
      const kind = opts.kind ?? "skill-update";
      const id = addOperation(kind, {
        href: opts.href,
        label: opts.label,
        slug: opts.slug,
        trigger: opts.trigger ?? "manual",
      });
      totalSourcesRef.current = 0;
      completedSourcesRef.current = 0;

      const bridgedCallbacks: StreamLoopCallbacks = {
        onComplete(result: LoopUpdateResult, sources: LoopUpdateSourceLog[]) {
          updateOperation(id, {
            completedSteps: totalSourcesRef.current,
            latestMessage: result.changed
              ? `Updated to ${result.nextVersionLabel}`
              : "No material changes",
            progress: 100,
            status: "done",
          });
          opts.callbacks?.onComplete?.(result, sources);
        },

        onError(message: string) {
          updateOperation(id, {
            errorMessage: message,
            latestMessage: message,
            status: "error",
          });
          opts.callbacks?.onError?.(message);
        },

        onMessage(message: string) {
          updateOperation(id, { latestMessage: message });
          opts.callbacks?.onMessage?.(message);
        },

        onReasoningStep(step: AgentReasoningStep) {
          updateOperation(id, {
            latestMessage: step.reasoning.slice(0, 100),
            status: "completing",
          });
          opts.callbacks?.onReasoningStep?.(step);
        },

        onSource(source: LoopUpdateSourceLog) {
          if (source.status === "done" || source.status === "error") {
            completedSourcesRef.current += 1;
          }
          const progress = computeProgress(
            completedSourcesRef.current,
            totalSourcesRef.current
          );
          updateOperation(id, {
            completedSteps: completedSourcesRef.current,
            latestMessage: `${source.label}: ${source.note ?? source.status}`,
            progress,
          });
          opts.callbacks?.onSource?.(source);
        },

        onStart(loop: LoopUpdateTarget) {
          totalSourcesRef.current = loop.sources.length;
          updateOperation(id, {
            latestMessage: `Scanning ${loop.sources.length} sources...`,
            status: "running",
            totalSteps: loop.sources.length,
          });
          opts.callbacks?.onStart?.(loop);
        },
      };

      try {
        await streamLoopUpdate(opts.slug, opts.origin, bridgedCallbacks);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Update failed.";
        updateOperation(id, {
          errorMessage: message,
          latestMessage: message,
          status: "error",
        });
        throw error;
      }
    },
    [addOperation, updateOperation]
  );

  return { run };
}
