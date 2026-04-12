"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { buttonBase, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isLight = resolvedTheme === "light";

  return (
    <button
      aria-label={
        mounted
          ? isLight
            ? "Switch to dark mode"
            : "Switch to light mode"
          : "Toggle theme"
      }
      className={cn(
        buttonBase,
        buttonVariants.soft,
        "size-9 shrink-0 p-0",
        className
      )}
      onClick={() => setTheme(isLight ? "dark" : "light")}
      type="button"
    >
      {mounted ? (
        isLight ? (
          <Moon className="h-3.5 w-3.5" strokeWidth={1.7} />
        ) : (
          <Sun className="h-3.5 w-3.5" strokeWidth={1.7} />
        )
      ) : (
        <span className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
