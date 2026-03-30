"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ArrowRightIcon } from "@/components/frontier-icons";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/shadcn/command";

type PaletteItem = {
  label: string;
  href: string;
  section: string;
  hint?: string;
};

type CommandPaletteProps = {
  items: PaletteItem[];
};

const STORAGE_KEY = "loop.palette.query";

export function CommandPalette({ items }: CommandPaletteProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const savedQuery = window.localStorage.getItem(STORAGE_KEY);
    if (savedQuery) setQuery(savedQuery);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, query);
  }, [query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((v) => !v);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    function onOpenRequest() {
      setIsOpen(true);
    }

    window.addEventListener("loop:open-palette", onOpenRequest);
    return () => window.removeEventListener("loop:open-palette", onOpenRequest);
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, PaletteItem[]>();
    for (const item of items) {
      const existing = map.get(item.section);
      if (existing) existing.push(item);
      else map.set(item.section, [item]);
    }
    return map;
  }, [items]);

  const handleSelect = useCallback(
    (href: string) => {
      router.push(href);
      setIsOpen(false);
    },
    [router]
  );

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput
        placeholder="Jump to a skill, category, or brief..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Array.from(grouped, ([section, sectionItems]) => (
          <CommandGroup heading={section} key={section}>
            {sectionItems.map((item) => (
              <CommandItem
                key={`${item.section}-${item.href}`}
                value={`${item.label} ${item.section} ${item.hint ?? ""}`}
                onSelect={() => handleSelect(item.href)}
              >
                <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
                <span className="min-w-0 truncate">{item.label}</span>
                {item.hint ? (
                  <span className="ml-auto shrink-0 text-xs text-ink-faint">{item.hint}</span>
                ) : null}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
