"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/frontier-icons";
import { cn } from "@/lib/cn";
import type { SettingsNavId } from "@/lib/settings-nav";
import { SETTINGS_SECTION_META, type SettingsInfoBlock } from "@/lib/settings-section-meta";
import { pageHeaderSub } from "@/lib/ui-layout";

type SettingsSectionPageProps = {
  sectionId: SettingsNavId;
  children: React.ReactNode;
};

function InfoAccordion({ blocks }: { blocks: SettingsInfoBlock[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-line rounded-none border border-line">
      {blocks.map((block, i) => {
        const open = openIndex === i;
        return (
          <div key={block.title}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? null : i)}
              className={cn(
                "flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium tracking-tight text-ink transition-colors",
                "hover:bg-paper-2/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/35",
                open && "bg-paper-2/30"
              )}
            >
              <span>{block.title}</span>
              <ChevronDownIcon
                className={cn(
                  "h-3.5 w-3.5 shrink-0 text-ink-faint transition-transform duration-200",
                  open && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-200 ease-out",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                <p className="m-0 px-4 pt-0 pb-4 text-sm leading-relaxed text-ink-muted">
                  {block.body}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SettingsSectionPage({ sectionId, children }: SettingsSectionPageProps) {
  const meta = SETTINGS_SECTION_META[sectionId];
  const allInfo = [...meta.beforePrimary, ...meta.afterPrimary];

  return (
    <div className="grid gap-8">
      <header className="grid min-w-0 gap-3 border-b border-line pb-6">
        <h1 className="m-0 font-serif text-[clamp(1.75rem,3vw,2.25rem)] font-medium tracking-[-0.03em] text-balance text-ink">
          {meta.heading}
        </h1>
        <p className={cn(pageHeaderSub, "max-w-[min(100%,56ch)]")}>{meta.lead}</p>
      </header>

      {children}

      <section className="grid gap-3">
        <h2 className="m-0 text-xs font-medium uppercase tracking-[0.08em] text-ink-soft">
          Reference
        </h2>
        <InfoAccordion blocks={allInfo} />
      </section>
    </div>
  );
}
