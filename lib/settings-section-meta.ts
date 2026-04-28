import type { SettingsNavId } from "@/lib/settings-nav";

export interface SettingsInfoBlock {
  title: string;
  body: string;
}

export interface SettingsSectionMeta {
  heading: string;
  lead: string;
  /** Context above the primary control panel */
  beforePrimary: SettingsInfoBlock[];
  /** Extra detail below the primary control panel */
  afterPrimary: SettingsInfoBlock[];
}

export const SETTINGS_SECTION_META: Record<SettingsNavId, SettingsSectionMeta> =
  {
    automations: {
      afterPrimary: [
        {
          body: "Paused automations keep their configuration but won’t dispatch. Use pause when iterating on prompts or when an external API quota is tight. Deletes are permanent–export or note prompts before removal.",
          title: "Pausing & safety",
        },
        {
          body: "Free accounts can run up to 3 active automations. Operator unlocks unlimited automations with model selection. Scheduled compute is metered per-run.",
          title: "Automation limits",
        },
      ],
      beforePrimary: [
        {
          body: "Schedules use RRULE semantics. Times follow the server’s automation pipeline–if something fires “at the wrong hour”, confirm your machine or deployment TZ and how cron interprets the rule.",
          title: "Cadence & time zones",
        },
        {
          body: "Each automation binds to one skill. Changing the skill’s body or agent prompt affects the next run–no need to recreate the automation unless you want a different skill or schedule.",
          title: "Skills & prompts",
        },
      ],
      heading: "Automations",
      lead: "Automations run your agent on a schedule against selected skills. Each automation stores its prompt, cadence (RRULE), and status in your workspace; Loop triggers runs and logs outcomes alongside skill activity.",
    },
    branding: {
      afterPrimary: [
        {
          body: "The OG image is generated dynamically at /og and accepts optional title, description, and category query parameters. The default version (no params) is used as the site-wide social preview. Right-click the preview to save a PNG snapshot.",
          title: "Open Graph image",
        },
        {
          body: "The accent orange (#E8650A) is the primary brand color and should be used sparingly for emphasis. The dark background (#0a0a09) and light foreground (#F5F5F5) form the core contrast pair. Avoid using the accent on light backgrounds without sufficient surrounding contrast.",
          title: "Brand colors",
        },
      ],
      beforePrimary: [
        {
          body: "Use the Loop mark and app icon as-is — don't recolor, rotate, distort, or add effects. Maintain clear space equal to at least the icon's inner padding on all sides. When placing the mark on a busy background, use the app icon variant with the dark container.",
          title: "Usage guidelines",
        },
      ],
      heading: "Logos & brand",
      lead: "Download Loop brand assets for integrations, presentations, and social previews. All marks are provided in SVG for crisp rendering at any size.",
    },
    connect: {
      afterPrimary: [
        {
          body: "After onboarding, Stripe sends you back to Loop with status query params. If you land on “refresh”, Stripe needs another pass–open Connect again from here. “Complete” means the return handshake fired; check Stripe if payouts are still paused.",
          title: "Return URLs",
        },
        {
          body: "Payout speed and holds are controlled by Stripe and your bank country. Loop doesn’t hold funds beyond what Stripe’s Connect rules require–see your Express dashboard for balance and payout schedule.",
          title: "Payout timing",
        },
      ],
      beforePrimary: [
        {
          body: "Subscriptions (Operator) pay Loop for product access. Connect is how you receive payouts from buyers. You need an active Operator subscription before Connect onboarding is available, so we know the workspace is paid and in good standing.",
          title: "Why Connect is separate",
        },
        {
          body: "We use Stripe Express: a lightweight connected account with a Stripe-hosted dashboard for taxes, payouts, and verification. You’ll be redirected to Stripe to finish or refresh onboarding whenever requirements change.",
          title: "Express accounts",
        },
      ],
      heading: "Stripe Connect & payouts",
      lead: "Connect lets Loop route skill revenue to your bank account. Onboarding runs on Stripe’s hosted flow: identity, bank details, and compliance are handled there; we only store your connected account id on your user profile.",
    },
    health: {
      afterPrimary: [
        {
          body: "A jump in API calls often correlates with automations, sandbox sessions, or refresh jobs. Cross-check the route list: repeated paths point to the feature to throttle or optimize first.",
          title: "Interpreting spikes",
        },
        {
          body: "We don’t surface raw request bodies here–only aggregates and labels safe for operators. If you need deeper traces, use your hosting provider’s logs or ask for an export under your data agreement.",
          title: "Privacy",
        },
      ],
      beforePrimary: [
        {
          body: "Events are recorded as you use Loop: navigation, skill actions, and API calls aggregate into the tiles and charts. Latency averages are sampled from recorded durations–expect jitter under load.",
          title: "How metrics are collected",
        },
        {
          body: "Rolling 24h totals help compare “right now” vs “yesterday same window” in other parts of the app. They reset continuously, not at calendar midnight, unless noted elsewhere in the UI.",
          title: "24h windows",
        },
      ],
      heading: "System health & usage",
      lead: "This view summarizes recent usage: page views, interactions, API traffic, route-level latency, and rolling windows. It’s meant for spotting spikes, regressions, or noisy endpoints–not for billing-grade metering.",
    },
    imports: {
      afterPrimary: [
        {
          body: "Run logs from `weekly_import_runs` will surface here once wired to the UI. Until then, use server logs or your database console if you need to audit a specific import window.",
          title: "Import history",
        },
        {
          body: "Adding a custom GitHub source is limited to Operator subscribers so extra registry scans stay tied to paid workspaces. Upgrade from Subscription settings, then return here to register org, repo, branch, and skills path.",
          title: "Custom sources (Operator)",
        },
      ],
      beforePrimary: [
        {
          body: "Imports run automatically every Monday (UTC). The next run time shown here is derived from that schedule–exact wall-clock time in your locale may differ from cron drift or maintenance windows.",
          title: "Weekly schedule",
        },
        {
          body: "Official sources are first-party or canonical upstreams we treat as high-signal. Community sources are curated lists or mirrors used for discovery; verify content before relying on them in production workflows.",
          title: "Trust tiers",
        },
      ],
      heading: "Skill imports",
      lead: "Loop pulls skill definitions from configured GitHub sources on a weekly cadence. Built-in registries stay aligned with upstream; Operator workspaces can register additional repos to scan.",
    },
    preferences: {
      afterPrimary: [
        {
          body: "Preferences are saved as browser cookies so they persist across sessions and are available to both client and server rendering. Clearing cookies resets preferences to their defaults.",
          title: "How preferences are stored",
        },
      ],
      beforePrimary: [
        {
          body: "All timestamps in the app — relative dates, activity logs, automation schedules — are displayed in your chosen time zone. By default Loop uses your browser's detected zone; change it here if you prefer a different one.",
          title: "Time zone",
        },
      ],
      heading: "Preferences",
      lead: "Configure how Loop displays information to you. These settings are stored locally in your browser and apply across all pages.",
    },
    "search-keys": {
      afterPrimary: [
        {
          body: "Your API key is stored in Clerk's encrypted private metadata — it's only accessible server-side and never exposed to the browser. Loop reads it when your skill automations or agent runs perform web searches.",
          title: "How keys are stored",
        },
        {
          body: "Serper and Jina are search-only providers that also offer scraping. Firecrawl handles both search and full JS-rendered scraping. When your provider doesn't support scraping, Loop falls back to a basic HTTP fetch.",
          title: "Provider capabilities",
        },
      ],
      beforePrimary: [
        {
          body: "By default, all search uses Brave Search, which is free and provided by the platform. You don't need to configure anything unless you want to use a different provider.",
          title: "Default provider",
        },
        {
          body: "If you prefer Google results (Serper), AI-optimized search (Tavily), Jina search + reader, or full JS-rendered scraping (Firecrawl), select that provider and enter your API key. Your key is used only for your searches.",
          title: "Bring your own key",
        },
      ],
      heading: "Search provider",
      lead: "Loop uses web search to keep skills fresh and power agent research. Brave Search is the free default — optionally bring your own API key for an alternative provider.",
    },
    refresh: {
      afterPrimary: [
        {
          body: "Large refreshes can be IO-heavy. If a run fails, read the error string in the panel–often it’s a missing env, blob permission, or transient network issue. Fix the cause and run again.",
          title: "Operational notes",
        },
        {
          body: "Automations execute on their own cadence; this button is manual and immediate. It doesn’t pause or reschedule automations–it only rebuilds the shared snapshot content layer they rely on.",
          title: "Automation vs manual refresh",
        },
      ],
      beforePrimary: [
        {
          body: "The job walks the refresh pipeline: re-reads configured sources, regenerates derived artifacts where applicable, and updates counters you see in the response. It’s safe to run repeatedly; the last run wins.",
          title: "What “full refresh” does",
        },
        {
          body: "After editing category registry, pulling new remote skills, or if the home catalog doesn’t match what you expect on disk. For single-skill issues, prefer the skill page or automation tools first.",
          title: "When to run it",
        },
      ],
      heading: "Content & snapshot refresh",
      lead: "Refresh rebuilds the local Loop snapshot: skills, briefs, and related generated content. Use it after imports, registry changes, or when the catalog looks stale–runs are server-side and may take a few seconds.",
    },
    skills: {
      afterPrimary: [
        {
          body: "Click any skill to open its detail page. Use the Studio tab to edit content, trigger refreshes, and tune automation. Use the Activity tab to inspect run traces and diffs.",
          title: "Managing skills",
        },
        {
          body: "This page shows skills you authored. Imported skills from external registries appear under Imports – they sync automatically and don't count toward your authoring limits.",
          title: "Imports vs authored",
        },
      ],
      beforePrimary: [
        {
          body: "Each skill starts as a draft. Once you add sources and enable automation, Loop refreshes it on schedule – fetching signals, running the editor agent, and minting new revisions automatically.",
          title: "Skill lifecycle",
        },
        {
          body: "The status column shows whether automation is active, paused, or disabled. Skills with consecutive failures are automatically paused until you intervene.",
          title: "Automation at a glance",
        },
      ],
      heading: "Your skills",
      lead: "All your authored skills in one place. See automation status, latest run outcomes, and jump into any skill to edit or trigger a refresh.",
    },
    subscription: {
      afterPrimary: [
        {
          body: "Use “Manage billing” in the panel (when available) to open Stripe’s customer portal: update cards, download invoices, or cancel at period end. If something fails, check that `STRIPE_PRICE_*` env vars match your Stripe dashboard.",
          title: "Managing your plan",
        },
        {
          body: "If a charge looks wrong or the portal won’t load, grab the Stripe customer id from your operator dashboard or email receipt and contact support with timestamps–we can trace webhook delivery on our side.",
          title: "Support",
        },
      ],
      beforePrimary: [
        {
          body: "AI-powered automations, model selection, custom import sources, marketplace pricing, and Stripe Connect payouts. All accounts can create up to 10 skills and browse the full catalog.",
          title: "What Operator unlocks",
        },
        {
          body: "When you upgrade, Stripe Checkout collects payment and attaches the subscription to your account. Confirmation emails and receipts come from Stripe–keep the same email as your Clerk sign-in for the least confusion.",
          title: "Checkout & receipts",
        },
      ],
      heading: "Subscription & billing",
      lead: "Your Loop workspace runs on the Operator plan when subscribed. Billing is handled securely by Stripe; you can open the customer portal any time to update payment methods, invoices, or cancel.",
    },
  };
