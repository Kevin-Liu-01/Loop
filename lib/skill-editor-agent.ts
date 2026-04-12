import { generateText, stepCountIs, tool } from "ai";
import type { LanguageModel } from "ai";
import { z } from "zod";

import { buildAddSourceTool } from "@/lib/agent-tools/add-source";
import type { AddedSourceCollector } from "@/lib/agent-tools/add-source";
import {
  DEFAULT_SEARCH_BUDGET,
  MIN_SEARCH_REQUIRED,
} from "@/lib/agent-tools/constants";
import { buildFetchPageTool } from "@/lib/agent-tools/fetch-page";
import type { SearchProvider } from "@/lib/agent-tools/search-providers";
import type { SearchBudget } from "@/lib/agent-tools/types";
import { buildWebSearchTool } from "@/lib/agent-tools/web-search";
import { diffMultilineText } from "@/lib/text-diff";
import type {
  AgentReasoningStep,
  DailySignal,
  DiffLine,
  LoopUpdateSourceLog,
  SkillUpdateEntry,
  SourceDefinition,
  UserSkillDocument,
} from "@/lib/types";

const MAX_REASONING_CHARS = 2000;
const MAX_TOOL_RESULT_CHARS = 2000;
const MAX_SEARCH_RESULT_CHARS = 4000;
const MAX_DIFF_LINES_PER_STEP = 80;
const REVISION_RESERVE_STEPS = 5;

const LARGE_OUTPUT_TOOLS = new Set(["web_search", "fetch_page"]);

function computeMaxSteps(sourceCount: number, searchBudget: number): number {
  const gatherSteps = sourceCount + 1;
  const researchSteps = searchBudget * 2;
  return gatherSteps + researchSteps + REVISION_RESERVE_STEPS;
}

export interface SkillRevisionDraft {
  update: SkillUpdateEntry;
  nextBody: string;
  nextDescription: string;
  bodyChanged: boolean;
  changedSections: string[];
  editorModel: string;
  addedSources: SourceDefinition[];
  searchesUsed: number;
}

type EditorAgentResult = SkillRevisionDraft & {
  reasoningSteps: AgentReasoningStep[];
};

interface MutableRevisionState {
  body: string;
  description: string;
  summary: string;
  whatChanged: string;
  experiments: string[];
  changedSections: string[];
  revised: boolean;
  finalized: boolean;
}

function buildSystemPrompt(
  skill: UserSkillDocument,
  sourceLogs: LoopUpdateSourceLog[],
  searchBudgetMax: number,
  maxSteps: number
): string {
  const sourceList = sourceLogs
    .map((s) => {
      const items = s.items
        .slice(0, 6)
        .map(
          (item, i) =>
            `  ${i + 1}. ${item.title} | ${item.source} | ${item.publishedAt}\n     ${item.summary || "No summary"}`
        )
        .join("\n");
      return `### ${s.label} (${s.itemCount} signals)\n${items || "  No signals."}`;
    })
    .join("\n\n");

  const today = new Date().toISOString().slice(0, 10);

  return [
    `# Skill editor agent — "${skill.title}"`,
    "",
    "You are a research-first autonomous editor. Your job: absorb tracked-source signals, actively research the web, then produce a precise revision of the skill body.",
    "",
    "## Mandatory research phase",
    "",
    `Budget: ${searchBudgetMax} web searches. You MUST use at least ${MIN_SEARCH_REQUIRED}.`,
    "Do NOT skip searching even when signals look complete — there is always more to learn.",
    "",
    "## Step budget",
    "",
    `You have ${maxSteps} total tool-call steps. Each tool call (analyze_signals, web_search, fetch_page, revise_skill, finalize) costs 1 step.`,
    `You MUST reserve at least ${REVISION_RESERVE_STEPS} steps for the revision phase (plan → revise_skill → finalize).`,
    "If you exhaust all steps without calling revise_skill, the ENTIRE run produces NO output — all research is wasted.",
    "Count your steps as you go. When you are within 5 steps of the limit, STOP researching and proceed to revision immediately.",
    "",
    "What to search for:",
    "- Breaking changes, new releases, or version bumps since the skill was last updated.",
    "- Corrections, deprecations, or revised best practices that invalidate current advice.",
    "- Adjacent techniques, libraries, or patterns the skill doesn't cover yet.",
    "- Authoritative primary sources (official docs, RFCs, changelogs) to replace or verify weaker references.",
    "",
    "Search tactics:",
    `- Start broad: "${skill.title} latest changes ${today.slice(0, 4)}". Narrow from there.`,
    "- Chain searches: first result → follow-up on specifics (version numbers, migration guides, benchmarks).",
    "- If a query returns thin results, rephrase with different keywords — do not accept one weak attempt.",
    "- Use fetch_page on the most promising URLs to get full context before citing them.",
    "",
    "## Workflow",
    "",
    "1. **Gather** — analyze_signals on each source, then read_current_skill.",
    "2. **Research** — web_search to fill gaps, fetch_page for depth. Do this BEFORE planning edits.",
    "3. **Discover** — if you find a high-value recurring source (official docs, release feed, maintained blog, GitHub repo), use add_source so future refreshes track it automatically.",
    "4. **Plan** — reason about what should change and why. Explain your thinking in your messages.",
    "5. **Revise** — revise_skill with the complete updated body.",
    "6. **Finalize** — finalize when satisfied.",
    "",
    "## Writing standards",
    "",
    "- Terse, operational, copy-pasteable by agents and developers.",
    "- Preserve existing structure and intent unless evidence justifies changing them.",
    "- Every added claim must trace to a search result or existing signal — never fabricate.",
    "- Do NOT add meta-sections about update history or observability (the product handles those).",
    "- Prefer concrete over vague: version numbers, dates, specific API names, code snippets.",
    "",
    `## Author instruction\n\n${skill.automation.prompt}`,
    "",
    `## Source signals (today: ${today})`,
    "",
    sourceList,
  ].join("\n");
}

function buildAnalyzeSignalsTool(sourceLogs: LoopUpdateSourceLog[]) {
  return tool({
    description:
      "Pull the full signal list from one tracked source. Returns each signal's title, URL, date, and summary so you can assess what's new and what gaps remain.",
    execute: async ({ sourceLabel }) => {
      const match = sourceLogs.find(
        (s) => s.label.toLowerCase() === sourceLabel.toLowerCase()
      );
      if (!match) {
        return {
          found: false,
          message: `Source "${sourceLabel}" not found. Available: ${sourceLogs.map((s) => s.label).join(", ")}`,
        };
      }
      return {
        found: true,
        itemCount: match.itemCount,
        items: match.items.map((item) => ({
          publishedAt: item.publishedAt,
          source: item.source,
          summary: item.summary,
          title: item.title,
          url: item.url,
        })),
        label: match.label,
        status: match.status,
      };
    },
    inputSchema: z.object({
      sourceLabel: z
        .string()
        .describe("Exact label of the source (case-insensitive)"),
    }),
  });
}

function buildReadCurrentSkillTool(skill: UserSkillDocument) {
  return tool({
    description:
      "Return the skill's full body text, title, description, and current version. Call this early so you can compare against incoming signals and identify stale or incomplete sections.",
    execute: async () => ({
      body: skill.body,
      description: skill.description,
      title: skill.title,
      version: skill.version,
      versionLabel: `v${skill.version}`,
    }),
    inputSchema: z.object({}),
  });
}

function buildReviseSkillTool(
  skill: UserSkillDocument,
  state: MutableRevisionState
) {
  return tool({
    description:
      "Submit a revised version of the skill. You must provide the COMPLETE body (not a diff) plus metadata about what changed. Only call this after your research phase is complete and you have a clear plan.",
    execute: async ({
      revisedBody,
      revisedDescription,
      summary,
      whatChanged,
      changedSections,
      experiments,
    }) => {
      state.body = revisedBody.trim();
      state.description = revisedDescription.trim();
      state.summary = summary;
      state.whatChanged = whatChanged;
      state.changedSections = [
        ...new Set(changedSections.map((s) => s.trim()).filter(Boolean)),
      ].slice(0, 6);
      state.experiments = experiments;
      state.revised = true;

      const bodyChanged = state.body !== skill.body.trim();
      return {
        applied: true,
        bodyChanged,
        bodyLengthAfter: state.body.length,
        bodyLengthBefore: skill.body.length,
        changedSections: state.changedSections,
      };
    },
    inputSchema: z.object({
      changedSections: z
        .array(z.string())
        .min(1)
        .max(6)
        .describe("Names of the sections you touched"),
      experiments: z
        .array(z.string())
        .min(2)
        .max(3)
        .describe(
          "2-3 follow-up experiments or areas to investigate in future refreshes"
        ),
      revisedBody: z
        .string()
        .min(40)
        .describe(
          "The complete revised skill body — include ALL sections, not just changed ones"
        ),
      revisedDescription: z
        .string()
        .min(16)
        .max(220)
        .describe(
          "Updated one-line skill description reflecting current scope"
        ),
      summary: z
        .string()
        .describe(
          "One-paragraph summary of what this update accomplishes and why"
        ),
      whatChanged: z
        .string()
        .describe(
          "Bullet-style list of concrete changes: what was added, removed, or rewritten"
        ),
    }),
  });
}

function buildFinalizeTool(state: MutableRevisionState) {
  return tool({
    description:
      "Mark the revision as complete. Call this once — and only after — you have called revise_skill and are satisfied with the result. If you have not revised the skill (no meaningful changes needed), still call this to end the run cleanly.",
    execute: async ({ finalNote }) => {
      state.finalized = true;
      return { finalized: true, note: finalNote ?? "Revision finalized." };
    },
    inputSchema: z.object({
      finalNote: z
        .string()
        .optional()
        .describe(
          "Brief closing note: confidence level, anything deferred to the next refresh, or why no changes were made"
        ),
    }),
  });
}

function omitVerboseArgs(
  args: Record<string, unknown>,
  keys: string[]
): Record<string, unknown> {
  const filtered = { ...args };
  for (const key of keys) {
    if (key in filtered && typeof filtered[key] === "string") {
      filtered[key] = `[${(filtered[key] as string).length} chars omitted]`;
    }
  }
  return filtered;
}

function extractStepsFromResponse(
  response: { steps: any[] },
  skill: UserSkillDocument
): AgentReasoningStep[] {
  const steps: AgentReasoningStep[] = [];
  let stepIndex = 0;
  let previousBody = skill.body;

  for (const step of response.steps) {
    const reasoning = step.text?.slice(0, MAX_REASONING_CHARS) ?? "";
    const toolCalls = step.toolCalls ?? [];
    const toolResults = step.toolResults ?? [];

    if (reasoning.trim()) {
      steps.push({
        index: stepIndex++,
        reasoning,
        timestamp: new Date().toISOString(),
      });
    }

    for (let i = 0; i < toolCalls.length; i++) {
      const tc = toolCalls[i];
      const tr = toolResults[i];
      let diffLines: DiffLine[] | undefined;
      const toolInput = tc.input as Record<string, unknown>;

      if (tc.toolName === "revise_skill") {
        const newBody =
          (toolInput.revisedBody as string | undefined)?.trim() ?? previousBody;
        diffLines = diffMultilineText(previousBody, newBody).slice(
          0,
          MAX_DIFF_LINES_PER_STEP
        );
        previousBody = newBody;
      }

      const toolOutput = tr?.output;
      const maxChars = LARGE_OUTPUT_TOOLS.has(tc.toolName)
        ? MAX_SEARCH_RESULT_CHARS
        : MAX_TOOL_RESULT_CHARS;
      const resultStr = toolOutput
        ? typeof toolOutput === "string"
          ? toolOutput.slice(0, maxChars)
          : JSON.stringify(toolOutput).slice(0, maxChars)
        : undefined;

      const logArgs =
        tc.toolName === "revise_skill"
          ? omitVerboseArgs(toolInput, ["revisedBody"])
          : tc.toolName === "fetch_page"
            ? toolInput
            : toolInput;

      steps.push({
        diffLines,
        index: stepIndex++,
        reasoning:
          reasoning && !steps.some((s) => s.reasoning === reasoning)
            ? reasoning
            : "",
        timestamp: new Date().toISOString(),
        toolCall: {
          args: logArgs,
          name: tc.toolName,
        },
        toolResult: resultStr,
      });
    }
  }

  return steps;
}

export async function runSkillEditorAgent(
  skill: UserSkillDocument,
  signals: DailySignal[],
  sourceLogs: LoopUpdateSourceLog[],
  model: LanguageModel,
  modelLabel: string,
  onStep?: (step: AgentReasoningStep) => void,
  searchProvider?: SearchProvider
): Promise<EditorAgentResult> {
  const generatedAt = new Date().toISOString();
  const agentStartMs = Date.now();

  const searchBudgetMax =
    skill.automation.searchBudget ?? DEFAULT_SEARCH_BUDGET;
  const searchBudget: SearchBudget = { max: searchBudgetMax, used: 0 };
  const sourceCollector: AddedSourceCollector = { sources: [] };

  const revisionState: MutableRevisionState = {
    body: skill.body,
    changedSections: [],
    description: skill.description,
    experiments: [],
    finalized: false,
    revised: false,
    summary: "",
    whatChanged: "",
  };

  const maxSteps = computeMaxSteps(sourceLogs.length, searchBudgetMax);

  console.info(
    `[agent] BEGIN "${skill.title}" – model: ${modelLabel}, ` +
      `signals: ${signals.length}, sources: ${sourceLogs.length}, ` +
      `searchBudget: ${searchBudgetMax}, maxSteps: ${maxSteps}`
  );

  const tools = {
    add_source: buildAddSourceTool(
      skill.sources,
      skill.category,
      sourceCollector
    ),
    analyze_signals: buildAnalyzeSignalsTool(sourceLogs),
    fetch_page: buildFetchPageTool(searchProvider),
    finalize: buildFinalizeTool(revisionState),
    read_current_skill: buildReadCurrentSkillTool(skill),
    revise_skill: buildReviseSkillTool(skill, revisionState),
    web_search: buildWebSearchTool(searchBudget, searchProvider),
  };

  console.info(`[agent] Calling generateText for "${skill.title}"…`);
  const generateStartMs = Date.now();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let response: { steps: any[] } | null = null;
  let agentError: string | null = null;

  try {
    response = await generateText({
      model,
      prompt: [
        `${sourceLogs.length} tracked sources delivered ${signals.length} signal(s).`,
        `Web search budget: ${searchBudgetMax} (minimum ${MIN_SEARCH_REQUIRED}). Step limit: ${maxSteps}.`,
        "",
        "Execute the workflow: gather → research → discover → plan → revise → finalize.",
        `Start by calling analyze_signals for each source, then read_current_skill, then begin your research phase with at least ${MIN_SEARCH_REQUIRED} web searches before deciding any edits.`,
        `CRITICAL: You MUST call revise_skill and finalize before running out of steps. Reserve at least ${REVISION_RESERVE_STEPS} steps for this.`,
      ].join("\n"),
      stopWhen: stepCountIs(maxSteps),
      system: buildSystemPrompt(skill, sourceLogs, searchBudgetMax, maxSteps),
      tools,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const elapsedMs = Date.now() - generateStartMs;
    agentError = msg;
    console.error(
      `[agent] generateText CRASHED for "${skill.title}" after ${(elapsedMs / 1000).toFixed(1)}s: ${msg}\n` +
        `  state at crash: revised=${revisionState.revised}, searches=${searchBudget.used}, addedSources=${sourceCollector.sources.length}`
    );
  }

  const generateElapsedMs = Date.now() - generateStartMs;

  if (response) {
    const toolCallSummary = response.steps
      .flatMap((s) => s.toolCalls ?? [])
      .reduce<Record<string, number>>((acc, tc) => {
        acc[tc.toolName] = (acc[tc.toolName] ?? 0) + 1;
        return acc;
      }, {});

    console.info(
      `[agent] generateText complete for "${skill.title}" in ${(generateElapsedMs / 1000).toFixed(1)}s – ` +
        `steps: ${response.steps.length}, toolCalls: ${JSON.stringify(toolCallSummary)}, ` +
        `searches: ${searchBudget.used}/${searchBudgetMax}, ` +
        `revised: ${revisionState.revised}, finalized: ${revisionState.finalized}`
    );
  }

  const reasoningSteps = response
    ? extractStepsFromResponse(response, skill)
    : [];

  if (onStep) {
    for (const step of reasoningSteps) {
      onStep(step);
    }
  }

  const topItems = signals.slice(0, 4);
  const addedSources = sourceCollector.sources;
  const searchesUsed = searchBudget.used;
  const errorSuffix = agentError
    ? ` (agent error: ${agentError.slice(0, 200)})`
    : "";

  if (!revisionState.revised) {
    const totalElapsedMs = Date.now() - agentStartMs;
    console.warn(
      `[agent] NO REVISION for "${skill.title}" after ${(totalElapsedMs / 1000).toFixed(1)}s – ` +
        `agent did not call revise_skill. searches: ${searchesUsed}, ` +
        `finalized: ${revisionState.finalized}, steps: ${reasoningSteps.length}` +
        (agentError ? `, error: ${agentError.slice(0, 120)}` : "")
    );
    return {
      addedSources,
      bodyChanged: false,
      changedSections: [],
      editorModel: modelLabel,
      nextBody: skill.body,
      nextDescription: skill.description,
      reasoningSteps,
      searchesUsed,
      update: {
        addedSources: addedSources.length > 0 ? addedSources : undefined,
        bodyChanged: false,
        changedSections: [],
        editorModel: modelLabel,
        experiments: [
          "Re-run after the issue is resolved.",
          "Add a higher-signal source.",
          "Check gateway credits or rate limits.",
        ],
        generatedAt,
        items: topItems,
        searchesUsed: searchesUsed > 0 ? searchesUsed : undefined,
        summary: agentError
          ? `${skill.title} agent run was interrupted: ${agentError.slice(0, 180)}`
          : `${skill.title} was reviewed by the editor agent but no revision was applied.`,
        whatChanged: agentError
          ? `Agent crashed mid-run after ${searchesUsed} search(es).${errorSuffix}`
          : "The agent analyzed signals but did not call revise_skill.",
      },
    };
  }

  const bodyChanged = revisionState.body.trim() !== skill.body.trim();
  const totalElapsedMs = Date.now() - agentStartMs;
  console.info(
    `[agent] DONE "${skill.title}" in ${(totalElapsedMs / 1000).toFixed(1)}s – ` +
      `bodyChanged: ${bodyChanged}, changedSections: [${revisionState.changedSections.join(", ")}], ` +
      `bodyDelta: ${revisionState.body.length - skill.body.length} chars, ` +
      `searches: ${searchesUsed}, addedSources: ${addedSources.length}`
  );

  return {
    addedSources,
    bodyChanged,
    changedSections: revisionState.changedSections,
    editorModel: modelLabel,
    nextBody: revisionState.body,
    nextDescription: revisionState.description,
    reasoningSteps,
    searchesUsed,
    update: {
      addedSources: addedSources.length > 0 ? addedSources : undefined,
      bodyChanged,
      changedSections: revisionState.changedSections,
      editorModel: modelLabel,
      experiments:
        revisionState.experiments.length > 0
          ? revisionState.experiments
          : [
              "Review the skill body for stale sections.",
              "Add a higher-signal source.",
              "Re-run after new signals arrive.",
            ],
      generatedAt,
      items: topItems,
      searchesUsed: searchesUsed > 0 ? searchesUsed : undefined,
      summary:
        (revisionState.summary ||
          `${skill.title} was reviewed by the editor agent.`) + errorSuffix,
      whatChanged:
        revisionState.whatChanged ||
        "The agent applied a revision with no detailed changelog.",
    },
  };
}
