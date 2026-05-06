"use client";

import { MessageSquarePlusIcon, SendIcon, CheckIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

type Phase = "idle" | "open" | "sending" | "sent";

/** px gap to keep between the widget's bottom edge and the footer's top edge. */
const FOOTER_GAP = 16;
/** matches the `bottom-5` Tailwind class on the fixed wrapper. */
const FIXED_BOTTOM_OFFSET = 20;

export function FeedbackWidget() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");
  const [footerLift, setFooterLift] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let raf: number | null = null;
    let lastLift = 0;

    const measure = () => {
      raf = null;
      // Re-query each tick so client-side navigation between pages with
      // different footers (or pages with no footer at all) stays correct —
      // a captured ref would point at a detached node after route change.
      const footers = document.querySelectorAll("footer");
      const lastIndex = footers.length - 1;
      const footer = lastIndex >= 0 ? footers[lastIndex] : null;

      let lift = 0;
      if (footer) {
        const rect = footer.getBoundingClientRect();
        // Only treat as a real footer if it's actually rendered (detached
        // nodes report 0,0,0,0 rects, which would otherwise falsely lift
        // the widget by ~innerHeight and push it off-screen).
        if (rect.width > 0 || rect.height > 0) {
          const encroachment = Math.max(0, window.innerHeight - rect.top);
          lift = Math.max(0, encroachment - FIXED_BOTTOM_OFFSET + FOOTER_GAP);
        }
      }

      if (Math.abs(lift - lastLift) > 0.5) {
        lastLift = lift;
        setFooterLift(lift);
      }
    };

    const onScroll = () => {
      if (raf === null) {
        raf = requestAnimationFrame(measure);
      }
    };

    // Measure once on mount and after any route change. Wait one frame so
    // the new page's footer has a chance to mount before we read the rect.
    const initialRaf = requestAnimationFrame(measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // Re-measure whenever the document grows or shrinks. This is what
    // catches Suspense-fallback → real-content swaps (e.g. the dashboard
    // skeleton showing the footer in viewport, then the loaded skill list
    // pushing the footer way below the fold). Without this, the lift
    // stays stuck at its initial-skeleton value until the user scrolls.
    const bodyObserver = new ResizeObserver(onScroll);
    bodyObserver.observe(document.body);

    return () => {
      cancelAnimationFrame(initialRaf);
      if (raf !== null) {
        cancelAnimationFrame(raf);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      bodyObserver.disconnect();
    };
  }, [pathname]);

  const reset = useCallback(() => {
    setPhase("idle");
    setMessage("");
  }, []);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value),
    []
  );

  const handleOpen = useCallback(() => {
    setPhase("open");
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    setPhase("sending");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          pageUrl: window.location.href,
        }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      setPhase("sent");
      setTimeout(reset, 2200);
    } catch {
      setPhase("open");
    }
  }, [message, reset]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 transition-transform duration-150 ease-out will-change-transform"
      style={{ transform: `translateY(-${footerLift}px)` }}
    >
      <AnimatePresence mode="wait">
        {(phase === "open" || phase === "sending") && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-80 origin-bottom-right border border-line/80 bg-paper-3 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18),0_4px_12px_-4px_rgba(0,0,0,0.08)] ring-1 ring-ink/[0.04] dark:shadow-[0_16px_48px_-8px_rgba(0,0,0,0.55),0_4px_16px_-4px_rgba(0,0,0,0.35)] dark:ring-white/[0.06]"
          >
            <div className="border-b border-line/60 px-4 py-3">
              <p className="font-serif text-sm font-medium tracking-[-0.01em] text-ink">
                Send feedback
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">
                Bug, idea, or anything else.
              </p>
            </div>

            <div className="p-4">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="What's on your mind?"
                disabled={phase === "sending"}
                rows={4}
                maxLength={5000}
                className="w-full resize-none border border-line/60 bg-paper-2/80 px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:opacity-50 dark:bg-paper/60"
              />
            </div>

            <div className="flex items-center justify-between border-t border-line/60 px-4 py-3">
              <span className="text-[11px] text-ink-muted tabular-nums">
                {message.length > 0 ? `${message.length}/5000` : ""}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={reset}
                  disabled={phase === "sending"}
                  className="px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:text-ink disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={phase === "sending" || !message.trim()}
                  className="inline-flex items-center gap-1.5 border border-accent bg-accent px-3 py-1.5 text-xs font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] transition-[background-color,border-color,opacity] hover:border-accent-hover hover:bg-accent-hover disabled:opacity-50"
                >
                  <SendIcon className="h-3 w-3" />
                  {phase === "sending" ? "Sending\u2026" : "Send"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {phase === "sent" && (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex w-64 items-center gap-3 border border-line/80 bg-paper-3 px-4 py-3.5 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18)] ring-1 ring-ink/[0.04] dark:shadow-[0_16px_48px_-8px_rgba(0,0,0,0.55)] dark:ring-white/[0.06]"
          >
            <div className="grid h-7 w-7 shrink-0 place-items-center border border-emerald-500/30 bg-emerald-500/10">
              <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-ink">
              Thanks for the feedback!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "idle" && (
        <motion.button
          type="button"
          onClick={handleOpen}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="grid h-11 w-11 place-items-center border border-line/80 bg-paper-3 text-ink-soft shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)] ring-1 ring-ink/[0.04] transition-colors hover:border-accent/50 hover:text-accent dark:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.45)] dark:ring-white/[0.06]"
          aria-label="Send feedback"
        >
          <MessageSquarePlusIcon className="h-4.5 w-4.5 stroke-[1.5]" />
        </motion.button>
      )}
    </div>
  );
}
