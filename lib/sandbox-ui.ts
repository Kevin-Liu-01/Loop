/**
 * Shared UI tokens for the code sandbox (toolbar controls, surfaces, inspector).
 */

export const sandboxToolbarControl =
  "rounded-xl border border-line bg-paper-3 px-3 py-1.5 text-xs tabular-nums text-ink outline-none transition-[border-color,box-shadow] focus-visible:border-accent/40 focus-visible:ring-2 focus-visible:ring-accent/15 dark:bg-paper-2";

export const sandboxToolbarLabel =
  "text-[0.65rem] font-medium uppercase tracking-[0.1em] text-ink-soft";

/** Card for each skill/MCP item in the context panel grid. */
export const sandboxContextCard =
  "flex items-center gap-2.5 rounded-lg border border-line/70 bg-paper-3/60 px-3 py-2.5 text-left text-[0.75rem] font-medium leading-tight text-ink-soft transition-[border-color,background-color,color,box-shadow] duration-150 hover:border-line-strong hover:bg-paper-3 hover:text-ink dark:bg-paper-2/50 dark:hover:bg-paper-3/40";

/** Active (selected) state overlay for context cards. */
export const sandboxContextCardActive =
  "border-accent/40 bg-accent/[0.06] text-ink shadow-[inset_0_0_0_1px_rgba(232,101,10,0.1)] hover:border-accent/50 hover:bg-accent/[0.09] dark:bg-accent/[0.08] dark:hover:bg-accent/[0.12]";

export const sandboxInspectorPanel =
  "flex h-full min-h-0 w-[320px] shrink-0 flex-col overflow-hidden border-l border-line/80 bg-paper-2/35 backdrop-blur-sm dark:bg-paper-2/25";
