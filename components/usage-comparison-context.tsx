"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { isUsageComparisonMode, type UsageComparisonMode } from "@/lib/usage-comparison-modes";

const STORAGE_KEY = "loop.usageComparisonMode";

type Ctx = {
  mode: UsageComparisonMode;
  setMode: (m: UsageComparisonMode) => void;
};

const UsageComparisonContext = createContext<Ctx | null>(null);

export function UsageComparisonProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<UsageComparisonMode>("yesterday_same_time");

  useEffect(() => {
    const s = window.localStorage.getItem(STORAGE_KEY);
    if (s && isUsageComparisonMode(s)) setModeState(s);
  }, []);

  const setMode = useCallback((m: UsageComparisonMode) => {
    setModeState(m);
    window.localStorage.setItem(STORAGE_KEY, m);
  }, []);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return (
    <UsageComparisonContext.Provider value={value}>{children}</UsageComparisonContext.Provider>
  );
}

export function useUsageComparisonMode(): UsageComparisonMode {
  const ctx = useContext(UsageComparisonContext);
  return ctx?.mode ?? "yesterday_same_time";
}

export function useUsageComparisonOptional(): Ctx | null {
  return useContext(UsageComparisonContext);
}
