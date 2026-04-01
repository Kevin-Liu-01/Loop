/**
 * Shared UI tokens for the code sandbox (toolbar controls, surfaces, inspector).
 * All tokens follow the app-wide design system: rounded-none geometry,
 * border-line hairlines, paper-stack surfaces, serif headings.
 */

/** Uniform header height for sidebar, toolbar, and inspector. */
export const sandboxHeaderHeight = "h-12";

export const sandboxHeaderBase =
  "flex shrink-0 items-center border-b border-line px-4 sm:px-5";

export const sandboxToolbarControl =
  "rounded-none border border-line bg-paper-3 px-2.5 py-1 text-[0.7rem] tabular-nums text-ink outline-none transition-all duration-150 focus-visible:border-accent/40 focus-visible:ring-2 focus-visible:ring-accent/10 hover:border-line-strong hover:bg-paper-3 dark:bg-paper-2/80 dark:hover:bg-paper-3/50";

export const sandboxToolbarLabel =
  "text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-ink-faint";

/** Card for each skill/MCP item in the context panel grid. */
export const sandboxContextCard =
  "flex items-center gap-2 rounded-none border border-line bg-paper-3/80 px-2.5 py-1.5 text-left text-[0.68rem] font-medium leading-tight text-ink-soft transition-all duration-150 hover:border-line-strong hover:bg-paper-3 hover:text-ink dark:bg-paper-2/40 dark:hover:bg-paper-3/30";

/** Active (selected) state overlay for context cards. */
export const sandboxContextCardActive =
  "border-accent/40 bg-accent/[0.06] text-ink hover:border-accent/55 hover:bg-accent/[0.09] dark:bg-accent/[0.08] dark:hover:bg-accent/[0.12]";

export const sandboxInspectorPanel =
  "flex h-full min-h-0 w-[320px] shrink-0 flex-col overflow-hidden border-l border-line bg-paper-2/40 dark:bg-paper-2/25";

/** Eyebrow label used in inspector sections and sidebar headers. */
export const sandboxEyebrow =
  "text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-ink-faint";
