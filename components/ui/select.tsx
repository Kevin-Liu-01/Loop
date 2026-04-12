"use client";

import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  badge?: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  placeholder?: string;
}

export function Select({
  options,
  value,
  onChange,
  disabled = false,
  className,
  contentClassName,
  placeholder = "Select\u2026",
}: SelectProps) {
  const selected = options.find((opt) => opt.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          className={cn(
            "flex w-full items-center justify-between gap-2 text-left text-sm outline-none",
            "min-h-9 rounded-none border border-line bg-paper-3 px-3 py-2 text-ink transition-[border-color,box-shadow] duration-150",
            "hover:border-ink-faint/35 focus:border-accent/40 focus:shadow-[0_0_0_3px_rgba(232,101,10,0.06)]",
            "dark:bg-paper-2/60",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          type="button"
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            {selected?.icon}
            {selected?.label ?? placeholder}
          </span>
          <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-faint" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn(
          "max-h-[min(50vh,320px)] min-w-[var(--radix-dropdown-menu-trigger-width)] w-max max-w-[min(90vw,400px)] overflow-y-auto",
          contentClassName
        )}
      >
        <DropdownMenuRadioGroup onValueChange={onChange} value={value}>
          {options.map((option) => (
            <DropdownMenuRadioItem
              disabled={option.disabled}
              key={option.value}
              value={option.value}
              className={cn(option.disabled && "opacity-50")}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  {option.icon}
                  {option.label}
                </span>
                {option.badge && (
                  <span className="shrink-0 rounded-full bg-paper-3 px-2 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-wider text-ink-faint">
                    {option.badge}
                  </span>
                )}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
