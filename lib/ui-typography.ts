/**
 * Typography tokens. A single source of truth for text weight + size
 * rhythms used across the app.
 *
 * Before reaching for a hand-rolled `text-[0.6875rem] font-semibold ...`
 * string, see if one of these matches. If the rhythm you need isn't here,
 * add it to this file instead of coining a new one-off class in your
 * component.
 *
 * Scale:
 *   eyebrow    10.5px medium  uppercase · section / metric labels
 *   panelTitle 14px   medium  serif     · sidebar / card headers
 *   metric     14px   semibold          · the bold value under an eyebrow
 *   rowItem    14px   medium            · primary line in a list row
 *   bodySm     13px   normal            · description copy in a tight card
 *   body       14px   normal            · default paragraph / inline copy
 *   metaSm     11px   normal  tabular   · tiny timestamps / counts
 *   metaLink   11px   medium            · sibling actions next to metaSm
 */

import { cn } from "@/lib/cn";

// --- Labels (uppercase eyebrows above a value) -----------------------------
export const textEyebrow =
  "text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-ink-faint";
/** Inline eyebrow used inside a row; slightly stronger weight for contrast
 *  against adjacent body text. */
export const textEyebrowStrong =
  "text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-faint";

// --- Titles (card / sidebar section headers) -------------------------------
export const textPanelTitle =
  "m-0 font-serif text-sm font-medium tracking-tight text-ink";

// --- Value rhythms ---------------------------------------------------------
/** Bold value paired with an eyebrow label. `text-ink` applied by default
 *  so it always reads as primary; override when state color is needed. */
export const textMetric = "text-sm font-semibold tabular-nums text-ink";
/** Like `textMetric` but for sentence-case strings. No tabular-nums, no
 *  negative tracking (which was making sentence values feel cramped). */
export const textMetricText = "text-sm font-semibold text-ink";

/** Primary line in a list row (e.g. automation name, skill title in a
 *  compact sidebar). Medium weight so it reads as a scannable heading
 *  without out-shouting the metric values that follow. */
export const textRowItem = "text-sm font-medium text-ink";

// --- Body --------------------------------------------------------------------
export const textBody = "text-sm leading-relaxed text-ink-soft";
export const textBodySm = "text-[0.8125rem] leading-relaxed text-ink-soft";

// --- Meta (small, muted, usually alongside a label) ------------------------
export const textMetaSm = "text-[0.6875rem] tabular-nums text-ink-faint";
export const textMetaLink =
  "text-[0.6875rem] font-medium text-ink-faint transition-colors hover:text-ink";

/** Compose tokens with extra classes ergonomically. */
export function typography(token: string, extra?: string): string {
  return cn(token, extra);
}
