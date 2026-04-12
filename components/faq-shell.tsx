"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useCallback } from "react";

import { ChevronDownIcon } from "@/components/frontier-icons";
import { cn } from "@/lib/cn";
import type { FaqItem, FaqSection } from "@/lib/faq-data";

interface FaqDisclosureProps {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
}

function FaqDisclosure({ item, open, onToggle }: FaqDisclosureProps) {
  return (
    <div className="border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-0 py-4 text-left text-sm font-medium text-ink transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:text-[0.938rem]"
      >
        <span className="leading-snug">{item.question}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-ink-soft"
        >
          <ChevronDownIcon className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <p className="m-0 max-w-[64ch] pb-4 text-sm leading-relaxed text-ink-muted">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FaqSectionBlockProps {
  section: FaqSection;
}

function FaqSectionBlock({ section }: FaqSectionBlockProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <section className="grid gap-0">
      <h2 className="m-0 pb-2 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
        {section.title}
      </h2>
      <div className="rounded-none border-t border-line">
        {section.items.map((item, i) => (
          <FaqDisclosure
            key={item.question}
            item={item}
            open={openIndex === i}
            onToggle={() => handleToggle(i)}
          />
        ))}
      </div>
    </section>
  );
}

interface FaqShellProps {
  sections: FaqSection[];
}

export function FaqShell({ sections }: FaqShellProps) {
  return (
    <div className="grid gap-10">
      <nav aria-label="FAQ sections" className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={cn(
              "rounded-full border border-line bg-paper-2 px-3 py-1 text-xs font-medium text-ink-muted transition-colors",
              "hover:border-accent/30 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            )}
          >
            {s.title}
          </a>
        ))}
      </nav>

      <div className="grid gap-12">
        {sections.map((section) => (
          <div key={section.id} id={section.id} className="scroll-mt-28">
            <FaqSectionBlock section={section} />
          </div>
        ))}
      </div>
    </div>
  );
}
