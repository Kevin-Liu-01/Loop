"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { SandboxInspectResponse } from "@/lib/sandbox-inspect-types";

const POLL_INTERVAL_MS = 5000;

interface UseSandboxInspectorResult {
  data: SandboxInspectResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  browsePath: (path: string) => void;
  currentPath: string;
}

async function fetchInspect(
  sandboxId: string,
  runtime: string,
  path?: string
): Promise<SandboxInspectResponse> {
  const res = await fetch("/api/sandbox/inspect", {
    body: JSON.stringify({ path, runtime, sandboxId }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Inspect failed (${res.status})`);
  }
  return (await res.json()) as SandboxInspectResponse;
}

export function useSandboxInspector(
  sandboxId: string | null,
  runtime: string,
  enabled: boolean
): UseSandboxInspectorResult {
  const [data, setData] = useState<SandboxInspectResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState("/home");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const doFetch = useCallback(async () => {
    if (!sandboxId) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchInspect(sandboxId, runtime, currentPath);
      if (mountedRef.current) {
        setData(result);
      }
    } catch (error) {
      if (mountedRef.current) {
        setError(error instanceof Error ? error.message : "Inspect failed");
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [sandboxId, runtime, currentPath]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!enabled || !sandboxId) {
      return;
    }

    doFetch();
    intervalRef.current = setInterval(doFetch, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, sandboxId, doFetch]);

  const refresh = useCallback(() => {
    doFetch();
  }, [doFetch]);

  const browsePath = useCallback((path: string) => {
    setCurrentPath(path);
  }, []);

  return { browsePath, currentPath, data, error, isLoading, refresh };
}
