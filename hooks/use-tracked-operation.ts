"use client";

import { useCallback, useRef } from "react";

import { useActiveOperations } from "@/components/active-operations-provider";
import type { ActiveOperationKind } from "@/lib/active-operations";

interface TrackedOperationOptions {
  kind: ActiveOperationKind;
  label: string;
  slug?: string;
  href?: string;
  trigger?: "manual" | "automation";
  totalSteps?: number;
}

interface OperationHandle {
  id: string;
  advance: (patch?: { message?: string; description?: string }) => void;
  complete: (message?: string) => void;
  fail: (errorMessage: string) => void;
}

export function useTrackedOperation() {
  const { addOperation, updateOperation } = useActiveOperations();
  const handleRef = useRef<OperationHandle | null>(null);

  const start = useCallback(
    (opts: TrackedOperationOptions): OperationHandle => {
      const id = addOperation(opts.kind, {
        href: opts.href,
        label: opts.label,
        slug: opts.slug,
        totalSteps: opts.totalSteps,
        trigger: opts.trigger ?? "manual",
      });

      updateOperation(id, { status: "running" });

      let completed = 0;
      const total = opts.totalSteps ?? 0;

      const handle: OperationHandle = {
        advance(patch) {
          completed += 1;
          const progress =
            total > 0
              ? Math.min(100, Math.round((completed / total) * 100))
              : 0;
          updateOperation(id, {
            completedSteps: completed,
            description: patch?.description,
            latestMessage: patch?.message,
            progress,
          });
        },
        complete(message) {
          updateOperation(id, {
            latestMessage: message ?? "Complete",
            progress: 100,
            status: "done",
          });
        },
        fail(errorMessage) {
          updateOperation(id, {
            errorMessage,
            latestMessage: errorMessage,
            status: "error",
          });
        },
        id,
      };

      handleRef.current = handle;
      return handle;
    },
    [addOperation, updateOperation]
  );

  return { current: handleRef, start };
}
