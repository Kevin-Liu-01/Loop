export type CategorySlug =
  | "frontend"
  | "seo-geo"
  | "social"
  | "infra"
  | "containers"
  | "a2a"
  | "security"
  | "ops";

export type SourceKind =
  | "rss"
  | "atom"
  | "docs"
  | "blog"
  | "github"
  | "watchlist"
  | "sitemap"
  | "changelog"
  | "releases"
  | "docs-index"
  | "registry"
  | "github-search";
export type SourceMode = "track" | "discover" | "search";
export type SourceTrustTier = "official" | "vendor" | "standards" | "community";
export type SourceParser =
  | "feed"
  | "html-links"
  | "sitemap"
  | "release-feed"
  | "docs-index"
  | "manifest"
  | "manual";
export type SkillVisibility = "public" | "member" | "private";
export type CategoryStatus = "live" | "seeded";
export type SkillOrigin = "repo" | "codex" | "user" | "remote";
export type UserSkillCadence = "daily" | "weekly" | "manual";
export type UserSkillAutomationStatus = "active" | "paused";
export type AgentProviderKind = "gateway" | "openai" | "compatible";
export type ImportedMcpTransport = "stdio" | "http" | "sse" | "ws" | "unknown";
export type LoopUpdateTargetOrigin = "user" | "remote";
export type McpInstallStrategy =
  | "npx"
  | "uvx"
  | "binary"
  | "remote-http"
  | "manual";
export type McpAuthType =
  | "none"
  | "oauth"
  | "api-key"
  | "pat"
  | "session"
  | "mixed";
export type McpVerificationStatus =
  | "verified"
  | "partial"
  | "unverified"
  | "broken";

export interface VersionReference {
  version: number;
  label: string;
  updatedAt: string;
}

export interface SourceDefinition {
  id: string;
  label: string;
  url: string;
  kind: SourceKind;
  tags: string[];
  logoUrl?: string;
  mode?: SourceMode;
  trust?: SourceTrustTier;
  parser?: SourceParser;
  searchQueries?: string[];
  rationale?: string;
  signalHints?: string[];
}

export interface SkillResearchProfile {
  summary: string;
  process: {
    title: string;
    detail: string;
  }[];
  discoveryQueries?: string[];
  featuredReason?: string;
}

export interface TrustedSkillSourceRecord {
  id: string;
  slug: string;
  name: string;
  trustTier: SourceTrustTier;
  sourceType:
    | "official-docs"
    | "official-repo"
    | "vendor-docs"
    | "community-curated";
  homepageUrl: string;
  repoUrl?: string;
  logoUrl?: string;
  discoveryMode: SourceMode;
  searchQueries: string[];
  tags: string[];
}

export interface SkillUpstreamRecord {
  slug: string;
  title: string;
  description: string;
  category: CategorySlug;
  upstreamUrl: string;
  upstreamKind: "skill" | "docs-pack" | "plugin-skill" | "repo-skill";
  sourceId: string;
  logoUrl?: string;
  tags: string[];
  body: string;
}

export interface SkillAuthorRecord {
  id: string;
  slug: string;
  displayName: string;
  bio: string;
  logoUrl?: string;
  websiteUrl?: string;
  primaryEmail?: string;
  clerkUserId?: string;
  verified: boolean;
  isOfficial: boolean;
  badgeLabel: string;
}

export interface CategoryDefinition {
  slug: CategorySlug;
  title: string;
  strapline: string;
  description: string;
  hero: string;
  accent: string;
  icon?: string;
  status: CategoryStatus;
  keywords: string[];
  sources: SourceDefinition[];
}

export type AgentDocKey = "codex" | "cursor" | "claude" | "agents";

export type AgentDocs = Partial<Record<AgentDocKey, string>> &
  Record<string, string | undefined>;

export const AGENT_DOC_FILENAMES: Record<AgentDocKey, string> = {
  agents: "AGENTS.md",
  claude: "CLAUDE.md",
  codex: "CODEX.md",
  cursor: "CURSOR.md",
};

export interface SkillHeading {
  depth: number;
  title: string;
  anchor: string;
}

export interface ReferenceDoc {
  slug: string;
  title: string;
  path: string;
  excerpt: string;
}

export interface AgentPrompt {
  provider: string;
  displayName: string;
  shortDescription: string;
  defaultPrompt: string;
  path: string;
}

export interface AutomationSummary {
  id: string;
  name: string;
  prompt: string;
  schedule: string;
  cadence: UserSkillCadence;
  status: string;
  path: string;
  cwd: string[];
  matchedSkillSlugs: string[];
  matchedCategorySlugs: CategorySlug[];
  preferredModel?: string;
  preferredHour?: number;
  preferredDay?: number;
}

export interface SkillPrice {
  amount: number;
  currency: string;
}

export interface SkillRecord {
  slug: string;
  title: string;
  description: string;
  category: CategorySlug;
  accent: string;
  featured: boolean;
  visibility: SkillVisibility;
  origin: SkillOrigin;
  href: string;
  path: string;
  relativeDir: string;
  updatedAt: string;
  tags: string[];
  headings: SkillHeading[];
  body: string;
  excerpt: string;
  references: ReferenceDoc[];
  agents: AgentPrompt[];
  automations: AutomationSummary[];
  version: number;
  versionLabel: string;
  availableVersions: VersionReference[];
  ownerName?: string;
  authorId?: string;
  author?: SkillAuthorRecord;
  sources?: SourceDefinition[];
  automation?: SkillAutomationState;
  updates?: SkillUpdateEntry[];
  agentDocs?: AgentDocs;
  price?: SkillPrice | null;
  creatorClerkUserId?: string;
  iconUrl?: string;
  featuredRank?: number;
  qualityScore?: number;
  researchProfile?: SkillResearchProfile;
  syncEnabled?: boolean;
  upstreams?: SkillUpstreamRecord[];
  forkedFromSlug?: string;
}

export interface DailySignal {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
  tags: string[];
}

export interface SkillAutomationState {
  enabled: boolean;
  cadence: UserSkillCadence;
  status: UserSkillAutomationStatus;
  prompt: string;
  lastRunAt?: string;
  consecutiveFailures?: number;
  preferredModel?: string;
  preferredHour?: number;
  /** 0 = Sunday, 1 = Monday, … 6 = Saturday. Only used when cadence is "weekly". */
  preferredDay?: number;
  /** Max web searches the editor agent may perform per refresh (default 5). */
  searchBudget?: number;
}

export interface SkillUpdateEntry {
  generatedAt: string;
  summary: string;
  whatChanged: string;
  experiments: string[];
  items: DailySignal[];
  bodyChanged?: boolean;
  changedSections?: string[];
  editorModel?: string;
  /** Sources the editor agent discovered and auto-added during this refresh. */
  addedSources?: SourceDefinition[];
  /** Number of web searches the agent performed in this refresh. */
  searchesUsed?: number;
}

export interface LoopUpdateTarget {
  slug: string;
  title: string;
  category: CategorySlug;
  origin: LoopUpdateTargetOrigin;
  description: string;
  versionLabel: string;
  updatedAt: string;
  href: string;
  automationLabel: string;
  lastSummary?: string;
  lastWhatChanged?: string;
  lastGeneratedAt?: string;
  lastExperiments?: string[];
  lastSignals?: DailySignal[];
  lastChangedSections?: string[];
  lastBodyChanged?: boolean;
  lastEditorModel?: string;
  sources: {
    id: string;
    label: string;
    url: string;
    kind: SourceKind;
    logoUrl: string;
    mode?: SourceMode;
    trust?: SourceTrustTier;
    parser?: SourceParser;
    searchQueries?: string[];
  }[];
}

export interface DiffLine {
  type: "context" | "added" | "removed";
  value: string;
  leftNumber?: number;
  rightNumber?: number;
}

export interface AgentReasoningStep {
  index: number;
  reasoning: string;
  toolCall?: { name: string; args: Record<string, unknown> };
  toolResult?: string;
  diffLines?: DiffLine[];
  timestamp: string;
}

export interface LoopUpdateSourceLog {
  id: string;
  label: string;
  url: string;
  kind: SourceKind;
  logoUrl: string;
  mode?: SourceMode;
  trust?: SourceTrustTier;
  parser?: SourceParser;
  searchQueries?: string[];
  status: "pending" | "running" | "done" | "error";
  itemCount: number;
  items: DailySignal[];
  note?: string;
  reasoning?: string;
  discoveredCount?: number;
}

export interface LoopUpdateResult {
  slug: string;
  title: string;
  origin: LoopUpdateTargetOrigin;
  changed: boolean;
  previousVersionLabel: string;
  nextVersionLabel: string;
  updatedAt: string;
  href: string;
  diffLines: DiffLine[];
  summary?: string;
  whatChanged?: string;
  experiments?: string[];
  items?: DailySignal[];
  changedSections?: string[];
  bodyChanged?: boolean;
  editorModel?: string;
  reasoningSteps?: AgentReasoningStep[];
  searchesUsed?: number;
  addedSources?: SourceDefinition[];
}

export interface LoopRunRecord {
  id: string;
  slug: string;
  title: string;
  origin: LoopUpdateTargetOrigin;
  trigger: "manual" | "automation" | "import-sync";
  status: "success" | "error";
  startedAt: string;
  finishedAt: string;
  previousVersionLabel?: string;
  nextVersionLabel?: string;
  href?: string;
  summary?: string;
  whatChanged?: string;
  bodyChanged?: boolean;
  changedSections: string[];
  editorModel?: string;
  sourceCount: number;
  signalCount: number;
  messages: string[];
  sources: LoopUpdateSourceLog[];
  diffLines: DiffLine[];
  reasoningSteps?: AgentReasoningStep[];
  errorMessage?: string;
  /** Number of web searches the agent performed in this loop run. */
  searchesUsed?: number;
  /** Sources the agent discovered and auto-added during this loop run. */
  addedSources?: SourceDefinition[];
}

/** Lean loop run projection used for dashboards, freshness dots, and
 *  cooldown checks. Excludes heavy JSONB columns (`messages`, `sources`,
 *  `diffLines`, `reasoningSteps`, `addedSources`) so list queries fit
 *  within Postgres statement timeouts as the `loop_runs` table grows. */
export type LoopRunSummary = Omit<
  LoopRunRecord,
  "messages" | "sources" | "diffLines" | "reasoningSteps" | "addedSources"
>;

export type LoopUpdateStreamEvent =
  | {
      type: "start";
      loop: LoopUpdateTarget;
    }
  | {
      type: "source";
      source: LoopUpdateSourceLog;
    }
  | {
      type: "analysis";
      message: string;
    }
  | {
      type: "complete";
      result: LoopUpdateResult;
      sources: LoopUpdateSourceLog[];
    }
  | {
      type: "reasoning-step";
      step: AgentReasoningStep;
    }
  | {
      type: "error";
      message: string;
    };

export interface UserSkillDocument {
  slug: string;
  title: string;
  description: string;
  category: CategorySlug;
  body: string;
  ownerName?: string;
  tags: string[];
  visibility: SkillVisibility;
  createdAt: string;
  updatedAt: string;
  sources: SourceDefinition[];
  automation: SkillAutomationState;
  updates: SkillUpdateEntry[];
  version: number;
  versions: UserSkillVersion[];
  agentDocs?: AgentDocs;
  price?: SkillPrice | null;
  creatorClerkUserId?: string;
}

export interface UserSkillStore {
  version: 2;
  skills: UserSkillDocument[];
}

export interface UserSkillVersion {
  version: number;
  updatedAt: string;
  title: string;
  description: string;
  category: CategorySlug;
  body: string;
  ownerName?: string;
  tags: string[];
  visibility: SkillVisibility;
  sources: SourceDefinition[];
  automation: SkillAutomationState;
  updates: SkillUpdateEntry[];
  agentDocs?: AgentDocs;
  price?: SkillPrice | null;
}

export interface ImportedSkillDocument {
  slug: string;
  title: string;
  description: string;
  category: CategorySlug;
  body: string;
  sourceUrl: string;
  canonicalUrl: string;
  ownerName?: string;
  authorId?: string;
  tags: string[];
  visibility: SkillVisibility;
  createdAt: string;
  updatedAt: string;
  syncEnabled: boolean;
  lastSyncedAt?: string;
  version: number;
  versions: ImportedSkillVersion[];
  agentDocs?: AgentDocs;
}

export interface ImportedMcpDocument {
  id: string;
  name: string;
  description: string;
  manifestUrl: string;
  homepageUrl?: string;
  docsUrl?: string;
  transport: ImportedMcpTransport;
  url?: string;
  command?: string;
  args: string[];
  envKeys: string[];
  headers?: Record<string, string>;
  tags: string[];
  raw: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  versionLabel: string;
  versions: ImportedMcpVersion[];
  iconUrl?: string;
  slug?: string;
  packageName?: string;
  packageRegistry?: string;
  installStrategy?: McpInstallStrategy;
  authType?: McpAuthType;
  verificationStatus?: McpVerificationStatus;
  sandboxSupported?: boolean;
  sandboxNotes?: string;
  normalizedConfig?: Record<string, unknown>;
}

export interface ImportedResourceStore {
  version: 2;
  skills: ImportedSkillDocument[];
  mcps: ImportedMcpDocument[];
}

export interface ImportedSkillVersion {
  version: number;
  updatedAt: string;
  title: string;
  description: string;
  category: CategorySlug;
  body: string;
  sourceUrl: string;
  canonicalUrl: string;
  ownerName?: string;
  authorId?: string;
  tags: string[];
  visibility: SkillVisibility;
  syncEnabled: boolean;
  lastSyncedAt?: string;
  agentDocs?: AgentDocs;
}

export interface ImportedMcpVersion {
  version: number;
  updatedAt: string;
  description: string;
  manifestUrl: string;
  homepageUrl?: string;
  docsUrl?: string;
  transport: ImportedMcpTransport;
  url?: string;
  command?: string;
  args: string[];
  envKeys: string[];
  headers?: Record<string, string>;
  tags: string[];
  raw: string;
  packageName?: string;
  packageRegistry?: string;
  installStrategy?: McpInstallStrategy;
  authType?: McpAuthType;
  verificationStatus?: McpVerificationStatus;
  sandboxSupported?: boolean;
  sandboxNotes?: string;
  normalizedConfig?: Record<string, unknown>;
}

export interface AgentProviderPreset {
  id: string;
  label: string;
  kind: AgentProviderKind;
  baseURL?: string;
  apiKeyEnvVar?: string;
  docsUrl?: string;
  supportsModelListing?: boolean;
  defaultModel: string;
}

export interface CategoryBrief {
  slug: CategorySlug;
  title: string;
  summary: string;
  whatChanged: string;
  experiments: string[];
  items: DailySignal[];
  generatedAt: string;
}

export interface MembershipPlan {
  slug: string;
  title: string;
  priceLabel: string;
  interval: string;
  ctaLabel: string;
  description: string;
  features: string[];
}

export type SearchDocumentKind = "skill" | "category" | "brief" | "mcp";

export interface SearchDocument {
  id: string;
  kind: SearchDocumentKind;
  title: string;
  description: string;
  href: string;
  category?: CategorySlug;
  tags: string[];
  updatedAt: string;
  origin?: SkillOrigin | "system";
  versionLabel?: string;
}

export type SearchHit = SearchDocument & {
  score: number;
};

export interface SearchIndex {
  version: 1;
  generatedAt: string;
  documents: SearchDocument[];
  tokens: Record<string, { id: string; score: number }[]>;
}

export interface RefreshRunRecord {
  id: string;
  status: "success" | "error";
  startedAt: string;
  finishedAt: string;
  generatedAt?: string;
  generatedFrom?: "local-scan" | "remote-refresh";
  writeLocal: boolean;
  uploadBlob: boolean;
  refreshCategorySignals: boolean;
  refreshUserSkills: boolean;
  refreshImportedSkills: boolean;
  focusSkillSlugs: string[];
  focusImportedSkillSlugs: string[];
  skillCount?: number;
  categoryCount?: number;
  dailyBriefCount?: number;
  dispatchedSkillCount?: number;
  errorMessage?: string;
}

export interface BillingEventRecord {
  id: string;
  type: string;
  createdAt: string;
  livemode: boolean;
  customerId?: string;
  customerEmail?: string;
  subscriptionId?: string;
  planSlug?: string;
  status?: string;
  amount?: number;
  currency?: string;
}

export interface StripeSubscriptionRecord {
  id: string;
  customerId: string;
  clerkUserId?: string;
  customerEmail?: string;
  planSlug?: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd?: string;
  checkoutCompletedAt?: string;
  updatedAt: string;
  latestInvoiceId?: string;
}

export type UsageEventKind =
  | "page_view"
  | "copy_prompt"
  | "copy_url"
  | "copy_agent_doc"
  | "search"
  | "skill_create"
  | "skill_import"
  | "skill_track"
  | "skill_save"
  | "skill_delete"
  | "skill_refresh"
  | "automation_create"
  | "agent_run"
  | "api_call";

export type UsageEventSource = "ui" | "api";

export interface UsageEventRecord {
  id: string;
  at: string;
  kind: UsageEventKind;
  source: UsageEventSource;
  label: string;
  path?: string;
  route?: string;
  method?: string;
  status?: number;
  durationMs?: number;
  ok?: boolean;
  skillSlug?: string;
  categorySlug?: CategorySlug;
  details?: string;
}

export interface SystemStateStore {
  version: 3;
  refreshRuns: RefreshRunRecord[];
  loopRuns: LoopRunRecord[];
  billingEvents: BillingEventRecord[];
  subscriptions: StripeSubscriptionRecord[];
  usageEvents: UsageEventRecord[];
}

export interface LoopSnapshot {
  generatedAt: string;
  generatedFrom: "local-scan" | "remote-refresh";
  categories: CategoryDefinition[];
  skills: SkillRecord[];
  mcps: ImportedMcpDocument[];
  automations: AutomationSummary[];
  dailyBriefs: CategoryBrief[];
  plans: MembershipPlan[];
  remoteSnapshotUrl?: string;
}

export interface SkillPurchaseRecord {
  id: string;
  clerkUserId: string;
  skillSlug: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  purchasedAt: string;
}

export type ConversationChannel = "copilot" | "agent-studio" | "sandbox";

export interface SkillAttachment {
  slug: string;
  title: string;
  versionLabel: string;
  iconUrl?: string;
}

export interface McpAttachment {
  id: string;
  name: string;
  transport: ImportedMcpTransport;
  iconUrl?: string;
  sandboxSupported?: boolean;
}

export interface ConversationMessageMetadata {
  attachments?: {
    skills: SkillAttachment[];
    mcps: McpAttachment[];
  };
}

export type ConversationMessagePart =
  | { type: "text"; text: string }
  | {
      type: "tool-invocation";
      toolInvocation: {
        toolName: string;
        args: Record<string, unknown>;
        result?: Record<string, unknown>;
        state: string;
      };
    };

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  parts?: ConversationMessagePart[];
  createdAt: string;
  metadata?: ConversationMessageMetadata;
}

export interface ConversationRecord {
  id: string;
  clerkUserId: string;
  channel: ConversationChannel;
  title: string;
  messages: ConversationMessage[];
  model?: string;
  providerId?: string;
  createdAt: string;
  updatedAt: string;
}
