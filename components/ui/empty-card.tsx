import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type EmptyCardProps = {
  className?: string;
  icon?: ReactNode;
  children: React.ReactNode;
};

export function EmptyCard({ className, icon, children }: EmptyCardProps) {
  return (
    <div
      className={cn(
        "grid min-h-30 place-items-center rounded-[18px] border border-dashed border-line-strong bg-transparent p-7 text-center text-ink-soft",
        className
      )}
    >
      {icon ? (
        <div className="grid place-items-center gap-2">
          <span className="text-ink-faint">{icon}</span>
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
