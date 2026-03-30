import type { CreateSkillInput } from "@/lib/db/skills";

type SeedSkill = Omit<CreateSkillInput, "origin"> & {
  origin?: CreateSkillInput["origin"];
};

// ---------------------------------------------------------------------------
// Frontend (10)
// ---------------------------------------------------------------------------

const frontend: SeedSkill[] = [
  {
    slug: "frontend-frontier",
    title: "Frontend Frontier",
    description:
      "Art direction, motion systems, design-engineering references, and tokenized design systems that avoid generic AI-generated UI.",
    category: "frontend",
    accent: "signal-red",
    featured: true,
    visibility: "public",
    tags: ["featured", "editorial-ui", "motion", "design-system", "art-direction"],
    body: `# Frontend Frontier

Use this skill when the job is not "make a page" but "make a page that actually has a point of view."

## What it covers

- Unique landing pages and marketing sites
- AI, devtools, and B2B SaaS frontends that need stronger taste
- Animation systems, scroll choreography, parallax, 3D, shaders, and hero scenes
- Design-system authoring, tokens, and consistency guardrails
- Turning loose inspiration into implementation-ready direction

## Default stance

- Pick one art-direction thesis, one motion thesis, and one depth thesis before writing UI.
- Build tokens before polishing components.
- Treat motion as a system, not garnish.
- CSS is substrate, not strategy. Use it for tokens, layout, fallbacks, and trivial states.
- Default to a frontier stack: Tailwind v4 \`@theme\`, Motion, GSAP, Lenis, React Three Fiber, shaders.
- Preserve performance, readability, and \`prefers-reduced-motion\`.

## Art direction modes

Choose one primary mode before implementation:

| Mode | When to use |
|------|-------------|
| Editorial technical | Dense information hierarchy with strong type and restrained color |
| Cinematic 3D | Hero-driven pages where depth or camera movement is the hook |
| Architectural blueprint | Technical products that benefit from grid precision and diagrammatic clarity |
| Neo-brutalist | Products that want raw, high-contrast, anti-polish energy |
| Experimental lab | Research tools, creative platforms, anything that rewards novelty |
| Premium AI SaaS | Enterprise AI products competing on trust, not flash |

## Motion layers

Motion is a system with three layers:

1. **Ambient** — slow loops, shader drift, environmental life
2. **Interaction** — hover, press, open, focus
3. **Narrative** — scroll and route choreography

One strong hero move beats many small distractions. If a page has a heavy 3D or shader hero, quiet the rest of the UI.

## Token checklist

Before building components, define: color tokens, spacing scale, radii, shadows, border weights, type scale, z-index, blur tokens, and motion tokens.`,
    agentDocs: {
      codex: `# Codex — Frontend Frontier

When this skill is active:
- Always ask for art direction before writing UI code
- Default to Tailwind v4 @theme tokens, not arbitrary values
- Use Motion for component animation, GSAP for scroll choreography
- Profile animation cost before shipping blur, shadow, or shader effects
- Degrade aggressively under prefers-reduced-motion`,
      cursor: `# Cursor — Frontend Frontier

Rules for this skill in Cursor:
- Read the art direction mode from the skill body before generating UI
- Never default to Inter, Roboto, or stock shadcn styles
- Use OKLCH for custom color authoring
- Animate transform and opacity first; filter and shadow only after profiling
- Keep text readable above the fold while motion runs`,
      agents: `# AGENTS.md — Frontend Frontier

## Review checklist
- Does the page have a single clear art direction thesis?
- Are tokens defined before component-level styling?
- Is motion used as a system or sprinkled randomly?
- Does the hero focal point earn attention without competing elements?
- Are blur/shadow animations profiled for performance?`
    }
  },
  {
    slug: "motion-framer",
    title: "Motion (Framer Motion)",
    description:
      "React animation with motion components, variants, gestures, layout animations, AnimatePresence, spring physics, and scroll effects.",
    category: "frontend",
    accent: "signal-red",
    tags: ["animation", "react", "motion", "framer-motion", "gestures"],
    body: `# Motion (Framer Motion)

Production-ready animation library for React. Use for component-level motion, layout transitions, gesture responses, and exit animations.

## Core concepts

- **motion components** — \`<motion.div>\` wraps any HTML or SVG element with animation superpowers
- **variants** — named animation states that propagate through component trees
- **layout animations** — automatic interpolation when elements change position or size
- **AnimatePresence** — animate components as they mount and unmount
- **gestures** — \`whileHover\`, \`whileTap\`, \`whileDrag\`, \`whileFocus\`

## When to use

| Scenario | Motion? |
|----------|---------|
| Component enter/exit | Yes — AnimatePresence |
| Layout shifts (reorder, resize) | Yes — layout prop |
| Hover/press micro-interactions | Yes — gesture props |
| Scroll-driven pinning or scrubbing | No — use GSAP ScrollTrigger |
| Page route transitions | Yes — with view transitions or AnimatePresence |
| Complex multi-surface orchestration | No — use GSAP timelines |

## Best practices

- Use \`spring\` for interactive motion; \`tween\` for staged sequences
- Keep exit animations subtler than enter animations
- Split enter animations into semantic chunks and stagger lightly
- Animate contextual icon swaps with opacity + scale + blur instead of hard replacing
- Use \`useReducedMotion()\` to respect accessibility preferences
- Prefer \`layoutId\` for shared layout animations across routes`,
    agentDocs: {
      codex: `# Codex — Motion

- Import from "motion/react" (v11+), not "framer-motion"
- Use spring physics for interactive states, tween for one-shot sequences
- Always wrap exit animations in <AnimatePresence>
- Use layoutId for cross-route shared element transitions
- Check useReducedMotion() and provide static fallbacks`,
      cursor: `# Cursor — Motion

- Prefer motion components over CSS keyframes for React UI
- Use variants for reusable animation states across component trees
- Stagger children with transition.staggerChildren
- AnimatePresence needs mode="wait" for sequential transitions
- Use layout="position" when only position should animate, not size`,
      agents: `# AGENTS.md — Motion

Review any motion implementation for:
- Reduced-motion fallback present?
- Exit animations subtler than enter?
- No competing animations on the same element?
- Spring configs tuned (not default)?`
    }
  },
  {
    slug: "gsap-scrolltrigger",
    title: "GSAP + ScrollTrigger",
    description:
      "Animation timelines, scroll-driven experiences, pinning, scrubbing, parallax, and cross-surface choreography with GSAP.",
    category: "frontend",
    accent: "signal-red",
    tags: ["animation", "gsap", "scroll", "parallax", "timeline"],
    body: `# GSAP + ScrollTrigger

The industry-standard animation platform for complex timelines, scroll-driven narratives, and cross-surface choreography.

## When to reach for GSAP over Motion

- Scroll-triggered pinning or scrubbing sections
- Multi-element orchestrated sequences with precise timing
- Mixed-surface animations (DOM + Canvas + WebGL)
- Complex SVG or path animations
- Anything that needs frame-perfect control across heterogeneous targets

## Core API

- **gsap.to / gsap.from / gsap.fromTo** — single tweens
- **gsap.timeline()** — sequenced animation chains
- **ScrollTrigger** — ties animation progress to scroll position
- **scrub** — maps scroll position directly to tween progress
- **pin** — holds an element fixed while the user scrolls through a section

## ScrollTrigger patterns

\`\`\`
ScrollTrigger.create({
  trigger: ".section",
  start: "top center",
  end: "bottom center",
  scrub: true,
  pin: true,
})
\`\`\`

## Rules

- Every pinned or scrubbed section must explain something — no scroll-jacking for the sake of it
- Test touch devices before committing to choreography-heavy storytelling
- Pair with Lenis when synchronized smooth scroll is part of the concept
- Do not drop Lenis into dense docs or dashboards
- Kill ScrollTrigger instances on component unmount in React
- Use \`gsap.context()\` for React cleanup`,
    agentDocs: {
      codex: `# Codex — GSAP ScrollTrigger

- Register ScrollTrigger plugin before use: gsap.registerPlugin(ScrollTrigger)
- Always use gsap.context() in React useEffect for cleanup
- Pin sections only when the scroll pause teaches the user something
- Pair with Lenis for smooth scroll sync; skip Lenis on content-heavy pages
- Test touch/mobile scroll behavior before shipping`,
      cursor: `# Cursor — GSAP ScrollTrigger

- GSAP is for orchestration and scroll; Motion is for component states
- Use scrub: true for direct scroll-to-progress mapping
- Timeline labels help readability: tl.addLabel("sectionTwo")
- ScrollTrigger.matchMedia() for responsive breakpoints
- Kill triggers on cleanup: ctx.revert() in useEffect return`,
      agents: `# AGENTS.md — GSAP ScrollTrigger

Review:
- Are ScrollTrigger instances cleaned up on unmount?
- Does every pinned section justify the scroll pause?
- Is touch/mobile tested?
- Is Lenis used appropriately (not on dense content)?`
    }
  },
  {
    slug: "react-three-fiber",
    title: "React Three Fiber",
    description:
      "Declarative 3D scenes in React using R3F, drei helpers, and the Three.js ecosystem for product configurators, portfolios, and immersive experiences.",
    category: "frontend",
    accent: "signal-red",
    tags: ["3d", "react", "threejs", "webgl", "r3f"],
    body: `# React Three Fiber

Build declarative 3D scenes with React. R3F is a React renderer for Three.js — every Three.js object becomes a JSX element.

## When to use

- Product configurators and 3D showcases
- Interactive portfolio pieces
- Data visualizations in 3D space
- Hero scenes with camera movement
- Any 3D that lives inside a React app

## Core setup

\`\`\`tsx
<Canvas>
  <ambientLight intensity={0.5} />
  <directionalLight position={[10, 10, 5]} />
  <mesh>
    <boxGeometry />
    <meshStandardMaterial color="hotpink" />
  </mesh>
  <OrbitControls />
</Canvas>
\`\`\`

## drei — the helper library

drei provides pre-built abstractions: \`OrbitControls\`, \`Environment\`, \`Text\`, \`Html\`, \`Float\`, \`MeshDistortMaterial\`, \`Sparkles\`, \`useGLTF\`, and dozens more.

## Performance rules

- Use \`useFrame\` for per-frame updates; never setState in the render loop
- Prefer instanced meshes for repeated geometry
- Dispose of geometries, materials, and textures on unmount
- Ship a readable poster frame before the 3D fully hydrates
- Use \`<Suspense>\` with a loading fallback for model loading
- Profile with \`<Perf />\` from r3f-perf during development`,
    agentDocs: {
      codex: `# Codex — React Three Fiber

- Use <Canvas> from @react-three/fiber, helpers from @react-three/drei
- Never call setState inside useFrame — mutate refs directly
- Use useGLTF for model loading with <Suspense> fallback
- Dispose geometries and materials on unmount to prevent memory leaks
- Provide a static poster/screenshot for SSR and slow connections`,
      cursor: `# Cursor — React Three Fiber

- All Three.js objects are available as JSX: <mesh>, <boxGeometry>, etc.
- Use drei helpers over raw Three.js when available
- Camera, scene, and renderer are managed by <Canvas> automatically
- Use useThree() to access the renderer, camera, or scene
- Instance repeated geometry with <Instances> for performance`,
      agents: `# AGENTS.md — React Three Fiber

Review:
- Is useFrame avoiding setState calls?
- Are assets disposed on unmount?
- Is there a loading/poster fallback?
- Is the scene profiled for frame rate?`
    }
  },
  {
    slug: "tailwind-design-system",
    title: "Tailwind Design System",
    description:
      "Token-driven design systems with Tailwind CSS v4 @theme, CSS custom properties, and systematic spacing, color, and typography scales.",
    category: "frontend",
    accent: "signal-red",
    tags: ["tailwind", "design-system", "tokens", "css", "theming"],
    body: `# Tailwind Design System

Build and maintain a tokenized design system using Tailwind CSS v4's native \`@theme\` directive and CSS custom properties.

## Why tokens matter

Raw utility classes without a token layer create accidental inconsistency: \`rounded-lg\` here, \`rounded-xl\` there, \`text-gray-600\` vs \`text-zinc-500\`. Tokens enforce decisions.

## Token categories

| Token | Example | Purpose |
|-------|---------|---------|
| Color | \`--color-surface\`, \`--color-accent\` | Semantic palette |
| Spacing | \`--space-xs\` through \`--space-4xl\` | Consistent rhythm |
| Radii | \`--radius-sm\`, \`--radius-card\` | Concentric radius system |
| Shadow | \`--shadow-subtle\`, \`--shadow-elevated\` | Layered depth |
| Type | \`--font-display\`, \`--font-sans\`, \`--font-mono\` | Type triad |
| Motion | \`--duration-fast\`, \`--ease-out-expo\` | Animation consistency |

## Tailwind v4 @theme

\`\`\`css
@theme {
  --color-surface: oklch(0.98 0 0);
  --color-accent: oklch(0.65 0.25 29);
  --radius-card: 1rem;
  --font-display: "Instrument Serif", serif;
}
\`\`\`

## Rules

- Prefer OKLCH for custom color authoring — perceptually uniform
- Keep primary UI to 3 active colors plus neutrals
- Preserve concentric radii: outer = inner + padding
- Use \`tabular-nums\` for metrics, prices, and dynamic numbers
- Use \`text-wrap: balance\` for headings
- Reject raw hex, arbitrary spacing, and accidental radius drift`,
    agentDocs: {
      codex: `# Codex — Tailwind Design System

- Define tokens in @theme block, not as arbitrary values
- Use OKLCH for color authoring
- Keep 3 active colors max plus neutrals
- Enforce concentric radii on nested surfaces
- Use tabular-nums for numeric content`,
      cursor: `# Cursor — Tailwind Design System

- Tokens live in @theme in the global CSS file
- Access tokens as Tailwind utilities: bg-surface, text-accent, rounded-card
- Runtime CSS variables work alongside @theme for dynamic theming
- Never use raw hex or arbitrary Tailwind values for design-critical properties
- Shadow tokens should create layered depth, not single hard shadows`,
      agents: `# AGENTS.md — Tailwind Design System

Review:
- Are all colors, spacing, and radii using tokens?
- Is the color palette limited and intentional?
- Are concentric radii preserved on nested elements?
- Is OKLCH used for custom colors?`
    }
  },
  {
    slug: "web-performance",
    title: "Web Performance",
    description:
      "Core Web Vitals optimization: LCP, CLS, INP, bundle analysis, image optimization, caching strategies, and runtime profiling.",
    category: "frontend",
    accent: "signal-red",
    tags: ["performance", "vitals", "lcp", "cls", "optimization"],
    body: `# Web Performance

Optimize for the metrics that matter: LCP, CLS, INP. Every millisecond of delay and every layout shift costs engagement.

## Core Web Vitals targets

| Metric | Good | Needs work | Poor |
|--------|------|------------|------|
| LCP | < 2.5s | 2.5–4s | > 4s |
| CLS | < 0.1 | 0.1–0.25 | > 0.25 |
| INP | < 200ms | 200–500ms | > 500ms |

## LCP checklist

- Identify the LCP element (usually hero image, heading, or video poster)
- Preload the LCP resource with \`<link rel="preload">\`
- Use \`fetchpriority="high"\` on the LCP image
- Serve responsive images with \`srcset\` and modern formats (AVIF, WebP)
- Avoid render-blocking CSS and JS above the fold
- Use SSR or static generation for critical content

## CLS prevention

- Always set explicit \`width\` and \`height\` on images and videos
- Reserve space for async content with skeleton placeholders
- Avoid injecting content above the current viewport
- Use \`font-display: swap\` with a closely-matched fallback font

## INP optimization

- Keep main-thread tasks under 50ms
- Use \`startTransition\` for non-urgent state updates
- Debounce expensive event handlers
- Virtualize long lists
- Move heavy computation to Web Workers

## Bundle analysis

- Audit with \`next build --analyze\` or \`source-map-explorer\`
- Code-split routes and heavy libraries
- Tree-shake unused exports
- Lazy-load below-the-fold components`,
    agentDocs: {
      codex: `# Codex — Web Performance

- Always identify the LCP element before optimizing
- Use fetchpriority="high" on LCP images
- Set explicit dimensions on all images and video
- Move heavy computation off the main thread
- Audit bundle size after every dependency addition`,
      cursor: `# Cursor — Web Performance

- Preload critical resources in <head> or next/head
- Use Next.js Image component with priority prop for LCP images
- Code-split with dynamic() or React.lazy()
- startTransition for non-urgent renders
- Profile with Chrome DevTools Performance tab before guessing`,
      agents: `# AGENTS.md — Web Performance

Review:
- Is the LCP element preloaded and prioritized?
- Are all images sized explicitly to prevent CLS?
- Are main-thread tasks under 50ms?
- Is the bundle analyzed and code-split?`
    }
  },
  {
    slug: "accessible-ui",
    title: "Accessible UI",
    description:
      "WCAG compliance, ARIA patterns, keyboard navigation, screen reader testing, focus management, and inclusive design for web applications.",
    category: "frontend",
    accent: "signal-red",
    tags: ["accessibility", "a11y", "wcag", "aria", "keyboard"],
    body: `# Accessible UI

Build interfaces that work for everyone. Accessibility is not an afterthought — it's a quality signal.

## WCAG 2.2 essentials

- **Perceivable** — content must be presentable in ways users can perceive
- **Operable** — UI must be navigable via keyboard, screen reader, and alternative inputs
- **Understandable** — content and behavior must be predictable and readable
- **Robust** — content must work across assistive technologies

## Common patterns

### Focus management
- Trap focus in modals and dialogs
- Return focus to trigger element on close
- Use \`tabIndex={-1}\` for programmatic focus targets
- Skip-to-content link as first focusable element

### ARIA usage
- Prefer semantic HTML over ARIA roles (\`<button>\` not \`<div role="button">\`)
- Label form inputs with \`<label>\` or \`aria-label\`
- Use \`aria-live\` regions for dynamic content updates
- \`aria-expanded\`, \`aria-selected\`, \`aria-checked\` for interactive widgets

### Color and contrast
- Minimum 4.5:1 contrast ratio for normal text (AA)
- Minimum 3:1 for large text and UI components
- Never convey information through color alone
- Test with simulated color blindness

### Keyboard
- All interactive elements must be keyboard-reachable
- Visible focus indicators (never \`outline: none\` without replacement)
- Escape closes overlays, Enter/Space activates buttons
- Arrow keys navigate within composite widgets

## Testing
- axe DevTools or Lighthouse accessibility audit
- Manual keyboard walkthrough
- Screen reader testing (VoiceOver on macOS, NVDA on Windows)
- Zoom to 200% without horizontal scroll`,
    agentDocs: {
      codex: `# Codex — Accessible UI

- Use semantic HTML elements before reaching for ARIA
- Every interactive element must be keyboard-accessible
- Trap focus in modals; restore on close
- Maintain 4.5:1 contrast ratio for text
- Test with axe DevTools and manual keyboard navigation`,
      cursor: `# Cursor — Accessible UI

- Add aria-label to icon-only buttons
- Use aria-live="polite" for status messages
- Never suppress focus outlines without providing a visible alternative
- Use Radix UI or Headless UI primitives that handle a11y by default
- Skip-to-content link should be the first focusable element`,
      agents: `# AGENTS.md — Accessible UI

Review:
- Are all interactive elements keyboard-accessible?
- Is focus properly managed in modals/dialogs?
- Do contrast ratios meet WCAG AA minimums?
- Are ARIA roles and properties correct?`
    }
  },
  {
    slug: "nextjs-patterns",
    title: "Next.js Patterns",
    description:
      "App Router architecture, React Server Components, data fetching patterns, caching, middleware, and production deployment with Next.js.",
    category: "frontend",
    accent: "signal-red",
    tags: ["nextjs", "react", "app-router", "rsc", "ssr"],
    body: `# Next.js Patterns

Production patterns for Next.js App Router: server components, data fetching, caching, middleware, and deployment.

## Server vs. Client Components

| Concern | Server Component | Client Component |
|---------|-----------------|------------------|
| Data fetching | Direct DB/API access | Via API route or server action |
| Bundle size | Zero JS shipped | Included in client bundle |
| Interactivity | None | Full React interactivity |
| When to use | Static content, data display | Forms, state, effects, browser APIs |

Default to server components. Add \`"use client"\` only when you need interactivity, effects, or browser APIs.

## Data fetching

- Fetch in server components directly — no useEffect needed
- Use \`unstable_cache\` or \`revalidateTag\` for ISR patterns
- Parallel data fetching with \`Promise.all\` — never waterfall
- Server Actions for mutations — \`"use server"\` functions

## Caching layers

1. **Request memoization** — deduplicate identical fetches within a render
2. **Data cache** — persistent cache for fetch results
3. **Full route cache** — cached HTML at build or first request
4. **Router cache** — client-side cache for visited routes

## Middleware

- Runs on every request at the edge
- Use for auth checks, redirects, geolocation, A/B tests
- Keep middleware fast — no heavy computation
- Match specific paths with \`config.matcher\`

## Production checklist

- Environment variables in \`.env.local\` (never commit secrets)
- Error boundaries at layout and page level
- \`loading.tsx\` for streaming suspense
- \`not-found.tsx\` for 404 handling
- Metadata API for SEO (\`generateMetadata\`)`,
    agentDocs: {
      codex: `# Codex — Next.js Patterns

- Default to server components; add "use client" only when needed
- Parallelize data fetches with Promise.all
- Use Server Actions for mutations
- Keep middleware lightweight — edge runtime constraints
- Set metadata via generateMetadata for SEO`,
      cursor: `# Cursor — Next.js Patterns

- "use client" goes at the top of the file, before imports
- Server Actions use "use server" directive
- Use revalidatePath/revalidateTag for cache invalidation
- loading.tsx provides automatic streaming suspense
- error.tsx catches component-level errors`,
      agents: `# AGENTS.md — Next.js Patterns

Review:
- Are server/client boundaries correct?
- Is data fetching parallelized?
- Are secrets in .env.local, not committed?
- Is there error boundary coverage?`
    }
  },
  {
    slug: "responsive-layouts",
    title: "Responsive Layouts",
    description:
      "Responsive design with container queries, fluid typography, modern CSS grid and flexbox patterns, and mobile-first development.",
    category: "frontend",
    accent: "signal-red",
    tags: ["responsive", "css", "grid", "flexbox", "container-queries"],
    body: `# Responsive Layouts

Modern responsive design goes beyond media queries. Container queries, fluid type, and intrinsic layouts create interfaces that adapt to their context.

## Container queries

Style elements based on their container size, not the viewport:

\`\`\`css
.card-container { container-type: inline-size; }

@container (min-width: 400px) {
  .card { grid-template-columns: 1fr 1fr; }
}
\`\`\`

## Fluid typography

Use \`clamp()\` for typography that scales smoothly:

\`\`\`css
font-size: clamp(1rem, 0.5rem + 2vw, 2rem);
\`\`\`

## Layout patterns

- **Holy grail** — \`grid-template: "header" auto "nav main aside" 1fr "footer" auto / auto 1fr auto\`
- **Responsive grid** — \`grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr))\`
- **Sidebar** — \`grid-template-columns: fit-content(300px) 1fr\`
- **Stack to row** — Flexbox with \`flex-wrap: wrap\` and \`flex-basis\`

## Mobile-first rules

- Start with the smallest viewport, enhance upward
- Touch targets minimum 44x44px
- No horizontal scroll at any breakpoint
- Test on real devices, not just DevTools simulation
- Use \`dvh\` (dynamic viewport height) for mobile full-height layouts`,
    agentDocs: {
      codex: `# Codex — Responsive Layouts

- Use container queries for component-level responsiveness
- Use clamp() for fluid typography
- Start mobile-first, enhance upward
- Touch targets must be at minimum 44x44px
- Test on real devices, not just browser devtools`,
      cursor: `# Cursor — Responsive Layouts

- Prefer container queries over media queries for component styling
- Use auto-fill with minmax for responsive grids
- dvh is more reliable than vh on mobile for full-height
- flex-wrap + gap is often simpler than media query breakpoints
- Avoid fixed widths — use min(), max(), clamp()`,
      agents: `# AGENTS.md — Responsive Layouts

Review:
- Are container queries used where appropriate?
- Is typography fluid with clamp()?
- Is the mobile experience tested and functional?
- Are touch targets at least 44x44px?`
    }
  },
  {
    slug: "component-architecture",
    title: "Component Architecture",
    description:
      "React component patterns: composition, compound components, render props, custom hooks, state management boundaries, and code organization.",
    category: "frontend",
    accent: "signal-red",
    tags: ["react", "components", "patterns", "architecture", "hooks"],
    body: `# Component Architecture

Patterns for building maintainable, reusable React component systems.

## Composition over configuration

Prefer small, composable components over monolithic components with many props:

\`\`\`tsx
// Good: composable
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>

// Avoid: prop-heavy
<Card title="Title" body="Content" headerVariant="large" />
\`\`\`

## Component categories

| Type | Purpose | State | Examples |
|------|---------|-------|---------|
| Presentational | Display data | No internal state | Badge, Avatar, Skeleton |
| Container | Fetch/manage data | Has state | UserList, DashboardPanel |
| Compound | Related sub-components | Shared context | Tabs, Accordion, Select |
| Layout | Structure arrangement | Minimal | Stack, Grid, Sidebar |

## Custom hooks

Extract reusable logic into hooks:
- \`useDebounce\` — debounced values
- \`useMediaQuery\` — responsive breakpoints
- \`useIntersection\` — viewport detection
- \`useLocalStorage\` — persisted state

## State boundaries

- Lift state only as high as needed — not higher
- Use context for cross-cutting concerns (theme, auth, locale)
- Server state belongs in React Query / SWR, not local state
- URL state (search params) for shareable UI state

## File organization

\`\`\`
components/
  ui/           # generic primitives (Button, Input, Badge)
  features/     # domain-specific (SkillCard, UserProfile)
  layouts/      # page structure (Sidebar, Header)
hooks/          # custom hooks
lib/            # utilities, helpers, constants
\`\`\``,
    agentDocs: {
      codex: `# Codex — Component Architecture

- Prefer composition over heavy prop APIs
- Extract reusable logic into custom hooks
- Lift state only as high as needed
- Use context for cross-cutting concerns, not prop drilling
- Keep components in focused files — one primary export per file`,
      cursor: `# Cursor — Component Architecture

- Compound components use React.createContext for shared state
- Presentational components should have zero side effects
- Custom hooks start with "use" and encapsulate a single concern
- Server state (API data) goes in React Query, not useState
- URL params for shareable state, localStorage for persistence`,
      agents: `# AGENTS.md — Component Architecture

Review:
- Is composition preferred over configuration?
- Are hooks extracting reusable logic?
- Is state lifted appropriately (not too high)?
- Is file organization consistent?`
    }
  }
];

// ---------------------------------------------------------------------------
// SEO + GEO (6)
// ---------------------------------------------------------------------------

const seoGeo: SeedSkill[] = [
  {
    slug: "seo-geo",
    title: "SEO + GEO",
    description:
      "On-page SEO and generative-engine optimization for keyword placement, entity coverage, schema markup, AI citability, and crawler readiness.",
    category: "seo-geo",
    accent: "signal-blue",
    featured: true,
    visibility: "public",
    tags: ["featured", "citability", "schema", "keywords", "entities"],
    body: `# SEO + GEO

Optimize a page for both classic search retrieval and AI citation. Treat SEO as the discovery layer and GEO as the extraction and recommendation layer.

## Non-negotiables

1. Place the primary keyword in at least 4 of 6 locations: URL slug, title tag, H1, H2, meta title, body intro
2. Place primary entity and adjacent entities naturally in title, H1, intro, body
3. Run entity gap analysis against top competitors
4. Add JSON-LD schema in the page \`<head>\`
5. Mirror on-page entities inside schema fields

## Workflow

### 1. Classify the page
- Page type, primary query, search intent
- Primary keyword + 3–8 variants
- Primary entity + supporting entities
- Target platforms: Google, ChatGPT, Perplexity, Gemini

### 2. Audit SEO coverage
- Keyword placement, title quality, meta description, clean slug
- Heading hierarchy, internal links, canonical URL
- Image alt text, structured data

### 3. Audit GEO / AI citability
- Does the page answer the query directly and early?
- Are claims specific, sourced, and structured?
- Is factual density high enough for extraction?
- Does schema markup surface entities for AI grounding?

### 4. Fix and implement
- Rewrite weak headings, thin intros, and missing entity coverage
- Add or fix JSON-LD schema
- Add \`llms.txt\` and \`llms-full.txt\` for AI crawler guidance

## Entity gap analysis

Compare your page's entities against the top 5 ranking pages. Add missing relevant entities — subtopics, tools, standards, brands, comparisons — without keyword stuffing.`,
    agentDocs: {
      codex: `# Codex — SEO + GEO

- Always classify the page type and intent before auditing
- Check keyword placement across 6 locations
- Run entity gap analysis against competitors
- Add JSON-LD in <head>, not via client-side injection
- Check AI citability: direct answers, specific claims, structured data`,
      cursor: `# Cursor — SEO + GEO

- Use generateMetadata in Next.js for title, description, OpenGraph
- Place JSON-LD schema in a <script type="application/ld+json"> in <head>
- Use semantic HTML (article, section, nav, aside) for better extraction
- Internal links should use descriptive anchor text
- Canonical URLs prevent duplicate content issues`,
      agents: `# AGENTS.md — SEO + GEO

Review:
- Is the primary keyword in 4+ of the 6 target locations?
- Are entities gap-checked against competitors?
- Is JSON-LD schema present and valid?
- Does the page answer the primary query directly?`
    }
  },
  {
    slug: "schema-markup",
    title: "Schema Markup",
    description:
      "JSON-LD structured data for rich snippets, knowledge panels, and AI search grounding — Article, Product, FAQ, HowTo, Organization, and more.",
    category: "seo-geo",
    accent: "signal-blue",
    tags: ["schema", "json-ld", "structured-data", "rich-snippets", "seo"],
    body: `# Schema Markup

Structured data tells search engines and AI systems what your content means, not just what it says.

## Why it matters

- Enables rich snippets in Google (stars, FAQs, breadcrumbs, product info)
- Powers knowledge panel data
- Feeds AI grounding systems with typed entity data
- Improves click-through rates by 20–30% when rich results appear

## Common schema types

| Type | Use case |
|------|----------|
| Article | Blog posts, news articles |
| Product | E-commerce product pages |
| FAQPage | Frequently asked questions |
| HowTo | Step-by-step guides |
| Organization | Company info, logo, contacts |
| BreadcrumbList | Navigation path |
| WebSite + SearchAction | Sitelinks search box |
| SoftwareApplication | Apps and tools |

## Implementation rules

- Place JSON-LD in \`<head>\` via \`<script type="application/ld+json">\`
- Mirror on-page content in schema — don't add data that isn't visible
- Use \`sameAs\` to connect to authoritative external references
- Validate with Google Rich Results Test and Schema.org validator
- Nest related schemas: \`Article\` > \`author\` > \`Person\` > \`sameAs\`

## Testing

1. Google Rich Results Test — validates eligibility for rich features
2. Schema Markup Validator — checks syntax against Schema.org
3. Google Search Console — monitors rich result performance
4. Structured Data Testing Tool — debug specific pages`,
    agentDocs: {
      codex: `# Codex — Schema Markup

- Use JSON-LD format, never microdata or RDFa
- Place in <head> via <script type="application/ld+json">
- Mirror visible on-page content — don't fabricate
- Validate with Google Rich Results Test before shipping
- Nest related entities (Article > author > Person)`,
      cursor: `# Cursor — Schema Markup

- Generate JSON-LD as a serialized object in a <script> tag
- Use @type for every entity, @context for the root object
- sameAs links to Wikipedia, Wikidata, or official profiles
- BreadcrumbList should match the actual navigation path
- Test with: https://search.google.com/test/rich-results`,
      agents: `# AGENTS.md — Schema Markup

Review:
- Is JSON-LD in <head>, not injected client-side?
- Does schema mirror visible page content?
- Are entities properly nested and typed?
- Has the output been validated?`
    }
  },
  {
    slug: "technical-seo-audit",
    title: "Technical SEO Audit",
    description:
      "Crawlability, indexing, site speed, canonicalization, robots.txt, sitemaps, and Core Web Vitals from the search infrastructure perspective.",
    category: "seo-geo",
    accent: "signal-blue",
    tags: ["technical-seo", "crawlability", "indexing", "sitemap", "audit"],
    body: `# Technical SEO Audit

The infrastructure layer of search visibility. If crawlers can't reach, parse, and index your content, nothing else matters.

## Audit checklist

### Crawlability
- robots.txt allows important paths, blocks waste
- No accidental noindex on critical pages
- Internal link depth ≤ 3 clicks from homepage
- XML sitemap includes all indexable pages
- No orphan pages (pages with zero internal links)

### Indexing
- Canonical URLs set correctly on every page
- No duplicate content across URL variants (www, trailing slash, params)
- hreflang tags for international content
- Pagination handled with rel="next"/"prev" or infinite scroll + sitemap

### Performance
- Core Web Vitals passing (LCP < 2.5s, CLS < 0.1, INP < 200ms)
- Server response time < 200ms (TTFB)
- Render-blocking resources minimized
- Mobile-friendly (responsive, no horizontal scroll)

### Security
- HTTPS everywhere, no mixed content
- HTTP-to-HTTPS redirects in place
- HSTS header configured

### Structured data
- JSON-LD present on key page types
- No errors in Search Console structured data report
- Rich results eligible where applicable

## Tools

- Google Search Console — the source of truth
- Screaming Frog — comprehensive crawl analysis
- PageSpeed Insights — Core Web Vitals diagnosis
- Ahrefs/Semrush — index coverage and backlink audit`,
    agentDocs: {
      codex: `# Codex — Technical SEO Audit

- Start with robots.txt and sitemap validation
- Check for accidental noindex on critical pages
- Verify canonical URLs on every page type
- Ensure internal link depth is 3 clicks or fewer
- Test Core Web Vitals with PageSpeed Insights`,
      cursor: `# Cursor — Technical SEO Audit

- Generate sitemap.xml in Next.js via app/sitemap.ts
- Set canonical in generateMetadata
- robots.txt via app/robots.ts
- Use middleware for redirects (HTTP > HTTPS, www normalization)
- next/headers for security headers (HSTS, CSP)`,
      agents: `# AGENTS.md — Technical SEO Audit

Review:
- Is robots.txt properly configured?
- Are canonical URLs consistent?
- Is the sitemap complete and valid?
- Are Core Web Vitals passing?`
    }
  },
  {
    slug: "ai-citability",
    title: "AI Citability & GEO",
    description:
      "Generative engine optimization for AI search: making content citable by ChatGPT, Perplexity, Gemini, and Bing AI through entity density, structured answers, and llms.txt.",
    category: "seo-geo",
    accent: "signal-blue",
    tags: ["geo", "aeo", "ai-search", "citability", "llms-txt"],
    body: `# AI Citability & GEO

Generative Engine Optimization (GEO) ensures your content gets cited by AI systems — ChatGPT, Perplexity, Gemini, and Bing AI.

## The citability framework

AI systems cite content that is:
1. **Directly answerable** — the page answers the query within the first 2–3 paragraphs
2. **Factually dense** — specific numbers, names, dates, and comparisons
3. **Well-structured** — headings, lists, tables that machines can parse
4. **Authoritative** — linked to known entities via schema and \`sameAs\`
5. **Crawlable** — accessible to AI crawlers without JavaScript rendering

## llms.txt

A machine-readable file at \`/llms.txt\` that tells AI crawlers what your site is about:

\`\`\`
# Site Name
> One-line description

## Docs
- [Getting Started](/docs/getting-started): Setup guide
- [API Reference](/docs/api): Complete API documentation

## Optional
- [Blog](/blog): Latest updates and tutorials
\`\`\`

\`llms-full.txt\` provides a longer, more detailed version for deeper context.

## Platform-specific signals

| Platform | Key signal |
|----------|-----------|
| ChatGPT (Browse) | Direct answers, authoritative links, freshness |
| Perplexity | Structured content, citation-worthy paragraphs, entity density |
| Gemini | Schema.org markup, Google Knowledge Graph alignment |
| Bing AI | Bing Webmaster data, structured answers, entity coverage |

## Anti-patterns

- Walls of text with no structure
- Vague claims without specifics
- Content behind JavaScript that crawlers can't render
- Thin pages that don't answer the query directly`,
    agentDocs: {
      codex: `# Codex — AI Citability

- Answer the primary query directly in the first 2-3 paragraphs
- Use specific numbers, names, dates — not vague claims
- Structure content with headings, lists, and tables for machine parsing
- Create llms.txt at the root with site overview and key pages
- Ensure content is SSR or statically rendered for crawler access`,
      cursor: `# Cursor — AI Citability

- Create app/llms.txt/route.ts for serving llms.txt
- Use semantic HTML and proper heading hierarchy
- generateMetadata for rich, descriptive page titles
- Avoid client-only rendering for critical content
- Use <article>, <section>, <aside> for semantic structure`,
      agents: `# AGENTS.md — AI Citability

Review:
- Does the page answer the query directly and early?
- Is factual density high (specific, not vague)?
- Is content structured with headings, lists, tables?
- Is llms.txt present and accurate?`
    }
  },
  {
    slug: "keyword-research",
    title: "Keyword Research",
    description:
      "Intent-mapped keyword clusters, competitor analysis, search volume prioritization, and content gap identification for SEO strategy.",
    category: "seo-geo",
    accent: "signal-blue",
    tags: ["keywords", "research", "intent", "clusters", "strategy"],
    body: `# Keyword Research

Map user intent to keyword clusters that drive content strategy and page architecture.

## Intent classification

| Intent | Signal | Content type |
|--------|--------|-------------|
| Informational | "how to", "what is", "guide" | Blog, docs, tutorial |
| Navigational | Brand name, product name | Homepage, product page |
| Commercial | "best", "vs", "review", "top" | Comparison, listicle |
| Transactional | "buy", "pricing", "signup" | Product, pricing, CTA |

## Cluster methodology

1. **Seed keywords** — core terms for your product/topic
2. **Expand** — use tools (Ahrefs, Semrush, Google autocomplete) to find related terms
3. **Cluster** — group by parent topic and intent
4. **Prioritize** — score by volume, difficulty, business relevance, and intent alignment
5. **Map** — assign clusters to pages (one primary cluster per page)

## Gap analysis

- Compare your indexed pages against competitor coverage
- Identify topics competitors rank for that you don't cover
- Find thin pages that need expansion
- Spot cannibalization (multiple pages targeting the same keyword)

## Output format

For each cluster:
- Primary keyword + search volume
- 5–10 supporting keywords
- Intent type
- Target page URL (existing or new)
- Content brief (what the page needs to cover)
- Priority score (1–5)`,
    agentDocs: {
      codex: `# Codex — Keyword Research

- Classify intent before selecting keywords (informational, navigational, commercial, transactional)
- Group keywords into topic clusters, not isolated targets
- One primary cluster per page — avoid cannibalization
- Prioritize by volume × relevance × difficulty
- Output structured briefs with target URLs and content requirements`,
      cursor: `# Cursor — Keyword Research

- Store keyword data in structured JSON or database tables
- Use the research output to inform generateMetadata
- Map keyword clusters to route structure
- Internal links should connect pages within the same cluster
- Track keyword positions in Search Console data`,
      agents: `# AGENTS.md — Keyword Research

Review:
- Are keywords clustered by topic and intent?
- Is there one primary cluster per page?
- Are gaps identified against competitors?
- Is cannibalization checked?`
    }
  },
  {
    slug: "content-seo-strategy",
    title: "Content SEO Strategy",
    description:
      "Topic clusters, content calendars, pillar-page architecture, internal linking strategy, and content lifecycle management for organic growth.",
    category: "seo-geo",
    accent: "signal-blue",
    tags: ["content-strategy", "topic-clusters", "pillar-pages", "internal-linking"],
    body: `# Content SEO Strategy

Systematic content production that compounds organic traffic through topic authority and internal linking.

## Pillar-cluster model

- **Pillar page** — comprehensive overview of a broad topic (2,000+ words)
- **Cluster pages** — focused articles on subtopics that link back to the pillar
- **Internal links** — bidirectional links between pillar and clusters create topical authority

## Content lifecycle

1. **Research** — keyword clusters, competitor gaps, intent mapping
2. **Brief** — outline with target keyword, headings, word count, internal links
3. **Create** — write with keyword placement, entity coverage, and structure
4. **Optimize** — schema markup, meta tags, image optimization
5. **Publish** — submit to Search Console, update sitemap
6. **Monitor** — track rankings, traffic, engagement
7. **Refresh** — update declining content every 6–12 months

## Internal linking strategy

- Every new page links to 3–5 related existing pages
- Pillar pages link to all cluster pages and vice versa
- Use descriptive anchor text (not "click here")
- Audit for orphan pages monthly
- Fix broken internal links immediately

## Content refresh triggers

- Rankings declining for 3+ consecutive months
- Traffic dropped 20%+ from peak
- Information is outdated (dates, stats, tools)
- Competitors published better content on the topic
- New subtopics or entities emerged`,
    agentDocs: {
      codex: `# Codex — Content SEO Strategy

- Use pillar-cluster architecture for topical authority
- Brief every piece before writing: keyword, outline, links
- Refresh content when rankings decline for 3+ months
- Every new page needs 3-5 internal links to/from related pages
- Audit for orphan pages regularly`,
      cursor: `# Cursor — Content SEO Strategy

- Model topic clusters as related routes in the app
- Use MDX or a CMS for content management
- generateStaticParams for static generation of content pages
- Sitemap should reflect the cluster hierarchy
- Track content performance via Search Console API`,
      agents: `# AGENTS.md — Content SEO Strategy

Review:
- Is the pillar-cluster structure defined?
- Are internal links bidirectional and descriptive?
- Is there a refresh schedule for aging content?
- Are orphan pages identified?`
    }
  }
];

// ---------------------------------------------------------------------------
// Social (5)
// ---------------------------------------------------------------------------

const social: SeedSkill[] = [
  {
    slug: "social-content-os",
    title: "Social Content OS",
    description:
      "Strategy and operating system for a technical social presence — content pillars, ranked backlogs, recurring series, and proof-backed publishing workflows.",
    category: "social",
    accent: "signal-gold",
    featured: true,
    visibility: "public",
    tags: ["content", "distribution", "strategy", "backlog", "pillars"],
    body: `# Social Content OS

Turn scattered notes, shipping updates, and product opinions into a coherent publishing system.

## Non-negotiables

1. Optimize for earned signal. Every idea maps to: claim, proof, implication, reply target
2. Prefer artifact-backed content: screenshots, code, diagrams, benchmarks, launch notes
3. Keep the mix weighted toward technical and product depth
4. Treat non-public information as off-limits unless explicitly marked public
5. Prefer recurring series over disconnected one-offs — repetition creates recognition

## Workflow

### 1. Identify the narrative
- What identity to reinforce: engineer, builder, product thinker, operator
- Which audience matters most
- Which pillar the idea belongs to
- What evidence exists now vs. what needs gathering

### 2. Convert raw notes into post briefs
- Working title, pillar, one-sentence claim
- Specific proof, why it matters now
- Best platform and format
- Asset to attach, confidentiality check

### 3. Shape the publishing mix
Balance across pillars — don't let one topic dominate the feed.

### 4. Prioritize
Favor ideas with at least two of: sharp contrarian angle, real build artifact, named event/result, stealable lesson, conversation starter.

### 5. Deliver actionably
Default output: ranked backlog with platform assignments, draft briefs for the top 3, and a cadence recommendation.`,
    agentDocs: {
      codex: `# Codex — Social Content OS

- Map every post idea to: claim + proof + implication
- Prefer artifact-backed content over pure opinion
- Balance pillars in the publishing mix
- Prioritize ideas with contrarian angles and real evidence
- Output ranked backlogs with platform assignments`,
      cursor: `# Cursor — Social Content OS

- Store content briefs as structured data (JSON or MDX)
- Track publishing cadence and pillar balance
- Use tags to categorize by pillar and platform
- Internal dashboard for backlog ranking
- Calendar view for scheduling`,
      agents: `# AGENTS.md — Social Content OS

Review:
- Does every idea have a clear claim and proof?
- Is the publishing mix balanced across pillars?
- Are ideas prioritized by signal strength?
- Is the cadence sustainable?`
    }
  },
  {
    slug: "social-draft",
    title: "Social Draft",
    description:
      "Platform-optimized drafting for X and LinkedIn — hooks, threading, tone calibration, and proof-backed posts that sound like a builder, not a content marketer.",
    category: "social",
    accent: "signal-gold",
    featured: true,
    visibility: "public",
    tags: ["drafting", "copy", "x", "linkedin", "hooks"],
    body: `# Social Draft

Turn one idea into platform-native drafts that feel specific, sharp, and credible.

## Workflow

### 1. Build the brief
- Topic and concrete proof (numbers, events, implementation details, results)
- Tone: casual, professional, thought-leader
- Goal: engagement, awareness, recruiting, credibility, leads
- Confidentiality boundary

If proof is missing, don't invent it. Use qualitative specificity or clearly marked placeholders.

### 2. Draft for X
- Lead with tension, result, or curiosity
- Keep single posts tight
- Use threads only when there are multiple concrete beats
- Avoid links in the main post
- Close with a real invitation to reply, not engagement bait

### 3. Draft for LinkedIn
- Make the first two lines carry the post
- Keep paragraphs short
- Sound conversational, not corporate
- End with a useful prompt or strong close
- Hashtags minimal and at the bottom only

### 4. Stress-test the drafts
- Would this sound smart to someone who knows the field?
- Is there at least one proof element?
- Does the opening earn attention without fake drama?
- Does the wording sound like a builder, not a content marketer?

### 5. Deliver clearly
1. X draft
2. LinkedIn draft
3. Optional alternate hook`,
    agentDocs: {
      codex: `# Codex — Social Draft

- Always include at least one proof element (number, event, result)
- X: lead with tension or result, keep tight, no links in main post
- LinkedIn: first 2 lines must carry the post, conversational tone
- Never invent proof — use placeholders if evidence is missing
- Stress-test: would an expert find this credible?`,
      cursor: `# Cursor — Social Draft

- Store draft templates as structured data
- Track character counts for X (280 char) and LinkedIn limits
- Preview rendering for both platforms
- Version drafts — keep edit history
- Tag drafts with pillar and target audience`,
      agents: `# AGENTS.md — Social Draft

Review:
- Is there concrete proof in the draft?
- Does the hook earn attention without fake drama?
- Does the tone match the platform?
- Would an expert in the field find this credible?`
    }
  },
  {
    slug: "audience-growth",
    title: "Audience Growth",
    description:
      "Follower growth mechanics, engagement optimization, reply strategies, collaboration tactics, and analytics-driven content iteration for X and LinkedIn.",
    category: "social",
    accent: "signal-gold",
    tags: ["growth", "engagement", "followers", "analytics", "social"],
    body: `# Audience Growth

Systematic approaches to growing a technical audience on X and LinkedIn through consistent quality and strategic engagement.

## Growth levers

### Content quality
- Specificity beats generality — "We cut deploy time from 8min to 45s" beats "Fast deploys matter"
- Proof compounds credibility — each post with real evidence makes the next post more trusted
- Consistency beats virality — one great post per week outperforms sporadic viral attempts

### Reply strategy
- Reply to accounts 2–10x your size with genuine, additive comments
- Add context, data, or a different angle — not "great post!"
- Reply within the first hour of their post for maximum visibility
- Your replies are content too — they appear on your profile

### Collaboration
- Quote-tweet with original analysis, not just "This!"
- Co-create threads with complementary experts
- Tag people only when you're adding genuine context about their work

### Analytics
- Track impressions, engagement rate, profile visits, and follower growth
- Identify which topics and formats drive the most profile visits
- Double down on what converts visitors to followers
- Drop formats that get impressions but no follows

## Platform-specific growth

**X**: Thread hooks, bookmark-worthy content, meme awareness, spaces participation
**LinkedIn**: Long-form posts, document carousels, commenting on industry leaders, newsletter`,
    agentDocs: {
      codex: `# Codex — Audience Growth

- Prioritize specificity and proof in every post
- Reply strategy: add genuine value to larger accounts
- Track which topics convert profile visits to followers
- Consistency beats virality — maintain sustainable cadence
- Collaborate via quote-tweets with original analysis`,
      cursor: `# Cursor — Audience Growth

- Build analytics dashboard tracking engagement rates
- Store performance data per post to identify winning topics
- Automate posting schedule reminders
- Track follower growth trends over time
- A/B test hook styles and measure profile visit conversion`,
      agents: `# AGENTS.md — Audience Growth

Review:
- Is the growth strategy based on data, not guesses?
- Is there a consistent publishing cadence?
- Are reply and collaboration strategies defined?
- Is content specificity prioritized?`
    }
  },
  {
    slug: "content-repurposing",
    title: "Content Repurposing",
    description:
      "Multi-format content adaptation: turning one idea into blog posts, social threads, newsletter segments, video scripts, and documentation.",
    category: "social",
    accent: "signal-gold",
    tags: ["repurposing", "multi-format", "distribution", "content"],
    body: `# Content Repurposing

One good idea, multiple surfaces. Repurposing is not copying — it's adapting the idea to each format's native strengths.

## The content flywheel

One core idea can become:
1. **X thread** — punchy, hook-driven, proof-backed
2. **LinkedIn post** — conversational, slightly longer, career-angle
3. **Blog post** — detailed, SEO-optimized, reference-grade
4. **Newsletter segment** — curated with commentary
5. **Video/podcast clip** — verbal storytelling with visuals
6. **Documentation** — technical reference distilled from the blog post

## Adaptation rules

- Each format starts from the core insight, not from another format's output
- Match the tone and structure to the platform — don't paste a blog post into a tweet
- Lead with the strongest proof point for that audience
- Remove context that's obvious to the target audience; add context they need
- Every adaptation should stand alone — don't assume the reader saw other formats

## Sequencing

Best order for a technical builder:
1. Ship the thing → screenshot/demo
2. X post about the result
3. LinkedIn post with broader lesson
4. Blog post with full technical detail
5. Newsletter including the blog as a feature
6. Docs if applicable`,
    agentDocs: {
      codex: `# Codex — Content Repurposing

- Start from the core insight, not from another format's output
- Each format should stand alone
- Match tone and structure to the platform
- Sequence: ship → social → blog → newsletter → docs
- Lead with the strongest proof point for each audience`,
      cursor: `# Cursor — Content Repurposing

- Track content atoms (core ideas) and their adaptations
- Link related content across formats
- Template each format: X thread template, LinkedIn template, blog template
- Measure performance per format to identify which surfaces compound best
- Maintain a repurposing queue in the content calendar`,
      agents: `# AGENTS.md — Content Repurposing

Review:
- Does each adaptation stand alone?
- Is the tone matched to the platform?
- Is sequencing logical?
- Is the core insight preserved across formats?`
    }
  },
  {
    slug: "newsletter-craft",
    title: "Newsletter Craft",
    description:
      "Email newsletter writing, growth tactics, subject line optimization, audience segmentation, and retention strategies for technical newsletters.",
    category: "social",
    accent: "signal-gold",
    tags: ["newsletter", "email", "growth", "writing", "distribution"],
    body: `# Newsletter Craft

Build and grow a technical newsletter that readers actually open, read, and forward.

## Structure

A strong newsletter issue has:
1. **Hook** — one compelling opening line or question
2. **Main piece** — the core insight, tutorial, or analysis (60% of the issue)
3. **Curated links** — 3–5 hand-picked items with one-line commentary
4. **CTA** — reply prompt, share prompt, or specific ask

## Subject line rules

- Specific > clever ("3 things I learned migrating to Postgres" > "Database thoughts")
- Include a number or specific detail when possible
- Keep under 50 characters for mobile
- Preview text should complement, not repeat, the subject

## Growth tactics

- Cross-promote in social posts: link to archive, not just subscribe page
- Guest issues from credible people in your space
- Referral incentives (but only if the reward matches the audience)
- SEO-optimized archive pages that rank for relevant queries
- "Best of" compilation posts on social

## Retention

- Open rates below 30% need subject line work
- Click rates below 5% need content quality work
- Unsubscribe rates above 1% per issue need audience alignment work
- Ask readers what they want — quarterly one-question survey
- Segment by engagement level and adjust send frequency`,
    agentDocs: {
      codex: `# Codex — Newsletter Craft

- Structure: hook + main piece + curated links + CTA
- Subject lines: specific, under 50 chars, with a concrete detail
- Monitor open rate, click rate, and unsubscribe rate
- Cross-promote via social with archive links
- Segment by engagement and adjust frequency`,
      cursor: `# Cursor — Newsletter Craft

- Store newsletter issues as MDX or structured content
- Track metrics per issue (opens, clicks, unsubscribes)
- SEO-optimize archive pages with generateMetadata
- Build a subscription form with Clerk or custom auth
- Preview rendering for email clients`,
      agents: `# AGENTS.md — Newsletter Craft

Review:
- Does each issue have a clear hook and main piece?
- Are subject lines specific and concise?
- Are retention metrics being tracked?
- Is there a growth strategy beyond "subscribe"?`
    }
  }
];

// ---------------------------------------------------------------------------
// Infra (5)
// ---------------------------------------------------------------------------

const infra: SeedSkill[] = [
  {
    slug: "edge-compute",
    title: "Edge Compute",
    description:
      "Cloudflare Workers, Vercel Edge Functions, Deno Deploy — patterns for running code at the edge with low latency and global distribution.",
    category: "infra",
    accent: "signal-blue",
    tags: ["edge", "cloudflare", "vercel", "serverless", "latency"],
    body: `# Edge Compute

Run code close to users for minimal latency. Edge functions execute on a global network, not in a single region.

## Platforms

| Platform | Runtime | Cold start | Use case |
|----------|---------|------------|----------|
| Cloudflare Workers | V8 isolates | ~0ms | API proxies, auth, redirects |
| Vercel Edge Functions | V8 isolates | ~0ms | Middleware, personalization |
| Deno Deploy | V8 isolates | ~0ms | Full APIs, SSR |
| AWS Lambda@Edge | Node.js | 50–200ms | CloudFront integration |

## When to use edge

- Auth/session checks before hitting origin
- Geolocation-based routing or content
- A/B testing and feature flags
- API response caching with stale-while-revalidate
- Request transformation and header manipulation

## Constraints

- No filesystem access
- Limited CPU time (usually 10–50ms)
- No native Node.js modules (use web-compatible alternatives)
- Database access requires edge-compatible clients (Neon, PlanetScale, Turso)
- Memory limits (128MB typical)

## Patterns

- **Edge middleware** — check auth, redirect, set headers before the page renders
- **Edge API route** — lightweight JSON API at the edge
- **Edge SSR** — render HTML at the edge with streamed responses
- **Edge cache** — Cache API for fine-grained response caching`,
    agentDocs: {
      codex: `# Codex — Edge Compute

- Use edge for auth checks, redirects, geolocation, and caching
- Edge runtime has no filesystem or native Node.js module access
- Use edge-compatible database clients (Neon, PlanetScale, Turso)
- Keep CPU time under 10-50ms
- Cache responses with Cache API for repeated requests`,
      cursor: `# Cursor — Edge Compute

- In Next.js, export const runtime = "edge" in route files
- Middleware runs at edge by default in Next.js
- Use web-standard APIs (fetch, Request, Response, crypto)
- Edge-compatible ORMs: Drizzle, Prisma Edge, Kysely
- Test edge functions locally with wrangler or vercel dev`,
      agents: `# AGENTS.md — Edge Compute

Review:
- Is edge runtime appropriate for this use case?
- Are all dependencies edge-compatible?
- Is CPU time within platform limits?
- Is caching implemented for repeated requests?`
    }
  },
  {
    slug: "database-patterns",
    title: "Database Patterns",
    description:
      "Postgres best practices: connection pooling, migrations, indexing, query optimization, and schema design for web applications.",
    category: "infra",
    accent: "signal-blue",
    tags: ["postgres", "database", "sql", "migrations", "indexing"],
    body: `# Database Patterns

Production Postgres patterns for web applications: schema design, querying, pooling, migrations, and optimization.

## Connection pooling

- Never create a new connection per request — use a pool
- Supabase uses PgBouncer in transaction mode by default
- Serverless environments need external poolers (Supavisor, PgBouncer, Neon pooler)
- Keep pool size proportional to expected concurrency

## Schema design

- Use UUIDs for primary keys (gen_random_uuid())
- Add created_at and updated_at timestamps to every table
- Use foreign keys for referential integrity
- Use enums or CHECK constraints for status fields
- Prefer \`text\` over \`varchar(n)\` unless you have a real length constraint

## Indexing

- Index columns used in WHERE, JOIN, and ORDER BY
- Composite indexes for multi-column queries (order matters)
- GIN indexes for full-text search and JSONB containment
- Partial indexes for frequently filtered subsets
- Don't over-index — each index adds write overhead

## Query optimization

- Use EXPLAIN ANALYZE to profile queries
- Avoid N+1 queries — use JOINs or batch fetches
- Use \`EXISTS\` over \`COUNT(*) > 0\` for existence checks
- Limit result sets with pagination
- Use CTEs for readability but beware of optimization fences in older Postgres

## Migrations

- One migration file per change
- Migrations must be idempotent and reversible
- Never modify a deployed migration — add a new one
- Test migrations against a copy of production data`,
    agentDocs: {
      codex: `# Codex — Database Patterns

- Always use connection pooling in serverless environments
- Add created_at/updated_at to every table
- Index WHERE, JOIN, ORDER BY columns
- Profile with EXPLAIN ANALYZE before optimizing
- Never modify deployed migrations`,
      cursor: `# Cursor — Database Patterns

- Use Supabase client with getServerSupabase() for server-side access
- Migrations live in supabase/migrations/
- Use .select() to limit returned columns
- Parallelize independent queries with Promise.all
- Use .maybeSingle() for nullable lookups`,
      agents: `# AGENTS.md — Database Patterns

Review:
- Is connection pooling configured?
- Are indexes appropriate and not excessive?
- Are queries profiled for N+1 patterns?
- Are migrations idempotent?`
    }
  },
  {
    slug: "observability-stack",
    title: "Observability Stack",
    description:
      "Logging, tracing, alerting, and metrics for production systems — structured logs, distributed traces, error tracking, and dashboard design.",
    category: "infra",
    accent: "signal-blue",
    tags: ["observability", "logging", "tracing", "alerting", "metrics"],
    body: `# Observability Stack

You can't fix what you can't see. Observability is logs, metrics, traces, and alerts working together.

## Three pillars

### Logs
- Structured JSON logs, not printf-style strings
- Include: timestamp, level, message, request_id, user_id, route
- Log at the right level: error (broken), warn (degraded), info (notable), debug (development)
- Don't log sensitive data (tokens, passwords, PII)

### Metrics
- **RED method** for services: Rate, Errors, Duration
- **USE method** for resources: Utilization, Saturation, Errors
- Track: request count, error rate, p50/p95/p99 latency, queue depth
- Use counters for totals, gauges for current values, histograms for distributions

### Traces
- Distributed tracing follows a request across services
- Add trace_id to every log entry for correlation
- Trace spans: HTTP handler → database query → external API call
- Identify bottlenecks by examining span durations

## Alerting rules

- Alert on symptoms (high error rate), not causes (CPU usage)
- Every alert must have a runbook or clear next step
- Deduplicate and group related alerts
- Avoid alert fatigue — fewer, meaningful alerts beat many noisy ones

## Tools

| Category | Options |
|----------|---------|
| Logs | Axiom, Datadog, Logtail, CloudWatch |
| Metrics | Prometheus + Grafana, Datadog, New Relic |
| Traces | Jaeger, Tempo, Datadog APM |
| Errors | Sentry, Bugsnag |`,
    agentDocs: {
      codex: `# Codex — Observability Stack

- Use structured JSON logs with request_id correlation
- Track RED metrics: Rate, Errors, Duration
- Add trace_id to logs for distributed trace correlation
- Alert on symptoms, not causes
- Never log sensitive data (tokens, PII)`,
      cursor: `# Cursor — Observability Stack

- Use a structured logger (pino, winston) not console.log
- Add request_id to every handler via middleware
- Use Sentry for error tracking with source maps
- Instrument database queries with timing spans
- Dashboard key metrics: error rate, p95 latency, request rate`,
      agents: `# AGENTS.md — Observability Stack

Review:
- Are logs structured and correlated with request IDs?
- Are RED metrics tracked for services?
- Do alerts have runbooks?
- Is sensitive data excluded from logs?`
    }
  },
  {
    slug: "serverless-architecture",
    title: "Serverless Architecture",
    description:
      "Lambda functions, edge functions, API route patterns, cold start mitigation, and event-driven architectures for serverless deployments.",
    category: "infra",
    accent: "signal-blue",
    tags: ["serverless", "lambda", "functions", "event-driven", "architecture"],
    body: `# Serverless Architecture

Build systems where compute scales to zero and spins up on demand, without managing servers.

## When serverless fits

- Variable or unpredictable traffic
- Event-driven workloads (webhooks, file processing, cron)
- API routes that don't need persistent connections
- Prototypes and MVPs where infrastructure cost should be minimal

## When it doesn't

- Persistent WebSocket connections
- Long-running processes (> 15 minutes)
- Workloads needing GPU or specialized hardware
- High-throughput, steady-state processing

## Cold start mitigation

- Use smaller bundles — tree-shake aggressively
- Prefer edge runtime (V8 isolates) over full Node.js when possible
- Provision concurrency for critical paths (AWS)
- Keep initialization code minimal — lazy-load heavy dependencies
- Use connection poolers for database access

## Patterns

- **API route per resource** — \`/api/users\`, \`/api/skills\`, \`/api/billing\`
- **Fan-out** — one event triggers multiple independent functions
- **Queue-based processing** — decouple request handling from heavy work
- **Cron functions** — scheduled execution for batch jobs
- **Webhook handlers** — validate signature, process event, respond quickly

## Cost optimization

- Functions are billed per invocation + duration
- Optimize response time to reduce cost
- Cache responses to reduce invocation count
- Use edge functions for lightweight work (cheaper than Lambda)`,
    agentDocs: {
      codex: `# Codex — Serverless Architecture

- Use serverless for variable traffic and event-driven workloads
- Mitigate cold starts with small bundles and lazy loading
- Use connection poolers for database access
- Decouple heavy processing with queues
- Cache responses to reduce invocations and cost`,
      cursor: `# Cursor — Serverless Architecture

- Next.js API routes are serverless by default on Vercel
- Use export const runtime = "edge" for edge functions
- Webhook handlers: validate signature first, then process
- Use cron via vercel.json or external scheduler
- Keep handler functions focused — one responsibility each`,
      agents: `# AGENTS.md — Serverless Architecture

Review:
- Is serverless appropriate for the workload?
- Are cold starts mitigated?
- Is database access using a pooler?
- Are costs optimized with caching?`
    }
  },
  {
    slug: "cdn-caching",
    title: "CDN & Caching",
    description:
      "Cache strategies, CDN configuration, stale-while-revalidate, cache invalidation, and edge caching for fast global content delivery.",
    category: "infra",
    accent: "signal-blue",
    tags: ["cdn", "caching", "swr", "invalidation", "performance"],
    body: `# CDN & Caching

Serve content fast by caching at the right layer with the right invalidation strategy.

## Cache layers

1. **Browser cache** — Cache-Control headers, ETag, immutable assets
2. **CDN/edge cache** — cached at points of presence worldwide
3. **Application cache** — in-memory or Redis for computed results
4. **Database cache** — query result caching, materialized views

## Cache-Control patterns

| Pattern | Header | Use case |
|---------|--------|----------|
| Immutable | \`public, max-age=31536000, immutable\` | Hashed static assets |
| SWR | \`public, s-maxage=60, stale-while-revalidate=600\` | API responses |
| Private | \`private, no-cache\` | User-specific data |
| No store | \`no-store\` | Sensitive data |

## stale-while-revalidate

Serve the cached version immediately while fetching a fresh copy in the background. Users get instant responses; data stays fresh within the revalidation window.

## Cache invalidation

The two hard problems in CS: cache invalidation and naming things.

- **Time-based** — TTL expires, content re-fetched
- **Tag-based** — invalidate by tag when source data changes
- **Path-based** — purge specific URL patterns
- **On-demand** — API call to purge after a write operation

## Rules

- Cache public, rarely-changing content aggressively
- Never cache authenticated responses at the CDN layer
- Use hash-based filenames for static assets (automatic in Next.js)
- Invalidate proactively after writes rather than waiting for TTL
- Monitor cache hit rates — below 90% means something is misconfigured`,
    agentDocs: {
      codex: `# Codex — CDN & Caching

- Cache public content aggressively; never cache authenticated data at CDN
- Use stale-while-revalidate for API responses
- Hash static asset filenames for immutable caching
- Invalidate proactively after writes
- Monitor cache hit rates — target 90%+`,
      cursor: `# Cursor — CDN & Caching

- Set Cache-Control headers in Next.js route handlers
- Use revalidateTag/revalidatePath for on-demand revalidation
- Static assets in /public get immutable headers automatically
- ISR (Incremental Static Regeneration) for page-level SWR
- Use next.config headers() for global caching rules`,
      agents: `# AGENTS.md — CDN & Caching

Review:
- Are Cache-Control headers set correctly?
- Is authenticated data excluded from CDN caching?
- Is cache invalidation proactive after writes?
- Are hit rates monitored?`
    }
  }
];

// ---------------------------------------------------------------------------
// Containers (3)
// ---------------------------------------------------------------------------

const containers: SeedSkill[] = [
  {
    slug: "dockerfile-mastery",
    title: "Dockerfile Mastery",
    description:
      "Multi-stage builds, layer optimization, caching, security hardening, and production-ready Dockerfile patterns for Node.js and web applications.",
    category: "containers",
    accent: "signal-red",
    tags: ["docker", "dockerfile", "multi-stage", "optimization", "containers"],
    body: `# Dockerfile Mastery

Write production-quality Dockerfiles that build fast, run lean, and stay secure.

## Multi-stage builds

Separate build dependencies from runtime:

\`\`\`dockerfile
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-slim AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

## Layer optimization

- Order instructions from least to most frequently changing
- COPY package files before source code for better cache hits
- Combine RUN commands to reduce layers
- Use .dockerignore to exclude node_modules, .git, .env

## Security

- Use slim or distroless base images
- Run as non-root user
- Don't install unnecessary packages
- Scan images with Trivy or Snyk
- Pin base image digests for reproducibility

## Size optimization

- Use \`node:20-slim\` not \`node:20\` (150MB vs 1GB)
- Prune dev dependencies after build
- Use Next.js standalone output for minimal production images
- Final image should be under 200MB for most web apps`,
    agentDocs: {
      codex: `# Codex — Dockerfile Mastery

- Always use multi-stage builds for production
- Order layers from stable to volatile for cache efficiency
- Use slim base images and run as non-root
- Scan images for vulnerabilities before deployment
- Keep final images under 200MB`,
      cursor: `# Cursor — Dockerfile Mastery

- Use output: "standalone" in next.config.ts for minimal Docker images
- .dockerignore should exclude node_modules, .git, .env*, .next
- Pin base image versions or digests
- Use HEALTHCHECK for container orchestration
- Build context should be as small as possible`,
      agents: `# AGENTS.md — Dockerfile Mastery

Review:
- Is the build multi-stage?
- Are layers ordered for cache efficiency?
- Is the container running as non-root?
- Is the final image size reasonable?`
    }
  },
  {
    slug: "kubernetes-essentials",
    title: "Kubernetes Essentials",
    description:
      "Pods, services, deployments, ingress, ConfigMaps, health checks, and resource management for Kubernetes-based deployments.",
    category: "containers",
    accent: "signal-red",
    tags: ["kubernetes", "k8s", "pods", "deployments", "orchestration"],
    body: `# Kubernetes Essentials

Core Kubernetes concepts and production patterns for deploying and managing containerized applications.

## Core resources

| Resource | Purpose |
|----------|---------|
| Pod | Smallest deployable unit — one or more containers |
| Deployment | Manages pod replicas with rolling updates |
| Service | Stable network endpoint for pods (ClusterIP, LoadBalancer, NodePort) |
| Ingress | HTTP routing and TLS termination |
| ConfigMap | Non-sensitive configuration data |
| Secret | Sensitive data (tokens, passwords) |
| HPA | Horizontal Pod Autoscaler |

## Health checks

Every production pod needs:
- **readinessProbe** — is the pod ready to receive traffic?
- **livenessProbe** — is the pod still healthy?
- **startupProbe** — has the pod finished starting? (for slow starters)

## Resource management

- Always set resource requests and limits
- Requests = guaranteed allocation; limits = maximum allowed
- OOMKilled means your memory limit is too low
- CPU throttling means your CPU limit is too low

## Production checklist

- Rolling update strategy with maxUnavailable and maxSurge
- Pod disruption budgets for availability during maintenance
- Resource quotas per namespace
- Network policies for pod-to-pod communication
- RBAC for service account permissions
- Image pull secrets for private registries`,
    agentDocs: {
      codex: `# Codex — Kubernetes Essentials

- Set readiness, liveness, and startup probes on every pod
- Always define resource requests and limits
- Use rolling update strategy for zero-downtime deploys
- Store secrets in Kubernetes Secrets, not ConfigMaps
- Apply network policies for pod-to-pod security`,
      cursor: `# Cursor — Kubernetes Essentials

- YAML manifests in a k8s/ or deploy/ directory
- Use kustomize or Helm for environment-specific configs
- kubectl apply -f for declarative deployments
- kubectl logs and kubectl exec for debugging
- Use namespaces to isolate environments`,
      agents: `# AGENTS.md — Kubernetes Essentials

Review:
- Are health probes configured?
- Are resource requests/limits set?
- Is the update strategy zero-downtime?
- Are secrets stored securely?`
    }
  },
  {
    slug: "container-security",
    title: "Container Security",
    description:
      "Image scanning, runtime policies, non-root execution, secrets management, and supply chain security for containerized applications.",
    category: "containers",
    accent: "signal-red",
    tags: ["security", "containers", "scanning", "runtime", "supply-chain"],
    body: `# Container Security

Secure the build, the image, and the runtime — not just one layer.

## Image security

- Use minimal base images (distroless, Alpine, slim)
- Scan images in CI with Trivy, Snyk, or Grype
- Pin base image digests, not just tags
- Don't include build tools, debuggers, or shells in production images
- Sign images with cosign for supply chain verification

## Runtime security

- Run as non-root user (USER directive in Dockerfile)
- Drop all capabilities, add back only what's needed
- Read-only filesystem where possible
- No privilege escalation (allowPrivilegeEscalation: false)
- Limit syscalls with seccomp profiles

## Secrets management

- Never bake secrets into images
- Use Kubernetes Secrets, Vault, or cloud secret managers
- Mount secrets as volumes, not environment variables (env vars leak to child processes)
- Rotate secrets regularly
- Audit secret access

## Supply chain

- Use trusted base images from verified publishers
- Lock dependency versions in lockfiles
- Scan dependencies for known vulnerabilities
- SBOM (Software Bill of Materials) for every production image
- Sign and verify artifacts at each stage

## Compliance checklist

- CIS Docker Benchmark for Dockerfile security
- CIS Kubernetes Benchmark for cluster security
- Pod Security Standards (restricted, baseline, privileged)
- Regular vulnerability scanning in production`,
    agentDocs: {
      codex: `# Codex — Container Security

- Scan images in CI before deployment
- Run as non-root with minimal capabilities
- Never bake secrets into images
- Pin base image digests for reproducibility
- Generate SBOM for production images`,
      cursor: `# Cursor — Container Security

- Add Trivy or Snyk scan step to CI pipeline
- Dockerfile: USER node (not root)
- securityContext in Kubernetes manifests
- Use Vault or cloud secret manager for sensitive data
- Enable Pod Security Standards in namespaces`,
      agents: `# AGENTS.md — Container Security

Review:
- Are images scanned for vulnerabilities?
- Is the container running as non-root?
- Are secrets managed properly (not in images)?
- Is the supply chain verified?`
    }
  }
];

// ---------------------------------------------------------------------------
// A2A — Agents (5)
// ---------------------------------------------------------------------------

const a2a: SeedSkill[] = [
  {
    slug: "agent-orchestration",
    title: "Agent Orchestration",
    description:
      "Multi-agent patterns, handoff protocols, tool routing, state management, and coordination strategies for AI agent systems.",
    category: "a2a",
    accent: "signal-gold",
    tags: ["agents", "orchestration", "handoff", "multi-agent", "patterns"],
    body: `# Agent Orchestration

Patterns for building systems where multiple AI agents collaborate, specialize, and hand off work.

## Orchestration patterns

### Router pattern
A central router agent classifies the request and delegates to specialist agents:
- User query → Router → {Code Agent, Research Agent, Writing Agent}

### Pipeline pattern
Agents process sequentially, each adding to or refining the output:
- Research Agent → Analysis Agent → Writing Agent → Review Agent

### Supervisor pattern
A supervisor agent coordinates workers, checks quality, and decides when to loop:
- Supervisor → Worker A, Worker B → Supervisor reviews → Done or retry

### Swarm pattern
Agents operate independently with shared state, converging on a solution:
- Multiple agents explore different approaches; best result wins

## Handoff protocol

- Include full context in the handoff — never assume the next agent remembers
- Pass structured data, not natural language summaries, between agents
- Include the task, constraints, and success criteria in every handoff
- Log every handoff for debugging and audit

## State management

- Shared state store (database, Redis) for cross-agent coordination
- Each agent writes its output to a known location
- Version state to handle concurrent modifications
- Checkpoint state before expensive operations for recovery

## Tool routing

- Each agent has access only to the tools it needs
- Central tool registry with access control
- Rate-limit tool calls to prevent runaway agents
- Log every tool invocation with inputs and outputs`,
    agentDocs: {
      codex: `# Codex — Agent Orchestration

- Choose pattern based on task: router for classification, pipeline for sequential, supervisor for quality control
- Include full context in every handoff — agents don't share memory
- Use structured data between agents, not natural language summaries
- Log every handoff and tool invocation
- Rate-limit tool calls to prevent runaway behavior`,
      cursor: `# Cursor — Agent Orchestration

- Define agent roles as separate modules with clear interfaces
- Use a shared state store (Supabase, Redis) for coordination
- Implement handoff as typed function calls with full context
- Each agent file should define: tools, system prompt, and handoff format
- Use streaming for long-running orchestrations`,
      agents: `# AGENTS.md — Agent Orchestration

Review:
- Is the orchestration pattern appropriate for the task?
- Are handoffs carrying full context?
- Is state managed with versioning?
- Are tool calls logged and rate-limited?`
    }
  },
  {
    slug: "mcp-development",
    title: "MCP Development",
    description:
      "Building Model Context Protocol servers and clients — tool definitions, resource exposure, transport layers, and integration patterns.",
    category: "a2a",
    accent: "signal-gold",
    tags: ["mcp", "protocol", "tools", "server", "integration"],
    body: `# MCP Development

Build MCP (Model Context Protocol) servers that expose tools and resources to AI agents in a standardized way.

## What MCP provides

- **Tools** — functions agents can call (search, create, update, delete)
- **Resources** — read-only data agents can access (files, database records, API responses)
- **Prompts** — reusable prompt templates for common tasks

## Server architecture

\`\`\`
MCP Server
├── tools/          # Tool definitions with schemas
├── resources/      # Resource definitions with URIs
├── prompts/        # Prompt templates
└── transport/      # stdio, HTTP, SSE, WebSocket
\`\`\`

## Tool definition

Each tool needs:
- **name** — unique identifier
- **description** — what the tool does (agents use this for selection)
- **inputSchema** — JSON Schema for parameters
- **handler** — the function that executes

## Transport options

| Transport | When to use |
|-----------|-------------|
| stdio | Local development, CLI tools |
| HTTP | REST-style stateless servers |
| SSE | Server-to-client streaming |
| WebSocket | Bidirectional real-time |

## Best practices

- Write clear tool descriptions — agents select tools based on these
- Validate inputs against the schema before executing
- Return structured results, not raw text
- Handle errors gracefully with meaningful messages
- Rate-limit and authenticate in production
- Version your MCP API for backward compatibility`,
    agentDocs: {
      codex: `# Codex — MCP Development

- Write clear, specific tool descriptions for agent selection
- Validate all inputs against the schema
- Return structured data, not raw text
- Handle errors with meaningful messages
- Rate-limit tool calls in production`,
      cursor: `# Cursor — MCP Development

- Tool descriptors live as JSON files in the mcps/ directory
- Use CallMcpTool to invoke tools from the IDE
- Test tools locally with stdio transport
- Tool schemas use JSON Schema for parameter validation
- Resources use URIs for addressing`,
      agents: `# AGENTS.md — MCP Development

Review:
- Are tool descriptions clear enough for agent selection?
- Are inputs validated against schemas?
- Are errors handled with useful messages?
- Is the transport appropriate for the use case?`
    }
  },
  {
    slug: "prompt-engineering",
    title: "Prompt Engineering",
    description:
      "System prompts, few-shot examples, chain-of-thought, structured outputs, and prompt optimization techniques for production AI applications.",
    category: "a2a",
    accent: "signal-gold",
    tags: ["prompts", "system-prompt", "few-shot", "chain-of-thought", "llm"],
    body: `# Prompt Engineering

Write prompts that produce reliable, high-quality outputs from language models in production systems.

## System prompt anatomy

1. **Role** — who the model is and what it does
2. **Context** — relevant background information
3. **Instructions** — specific rules and constraints
4. **Output format** — expected structure and format
5. **Examples** — few-shot demonstrations (optional but powerful)

## Techniques

### Few-shot prompting
Include 2–5 input/output examples that demonstrate the expected behavior. Examples should cover edge cases and common patterns.

### Chain-of-thought
Ask the model to reason step-by-step before giving a final answer. Reduces errors on complex tasks.

### Structured output
Request JSON, XML, or other structured formats. Use JSON Schema to constrain the shape.

### Constraint specification
Be explicit about what NOT to do. "Do not include explanations" is clearer than hoping the model infers your preference.

## Production patterns

- **Temperature** — 0 for deterministic outputs, 0.3–0.7 for creative tasks
- **Max tokens** — set to prevent runaway responses
- **Stop sequences** — control where generation ends
- **Retry with escalation** — retry failed calls, then escalate to a more capable model
- **Prompt versioning** — version control prompts like code

## Anti-patterns

- Vague instructions ("make it good")
- Missing output format specification
- No error handling for malformed responses
- Unversioned prompts changing in production
- Assuming the model remembers previous conversations in stateless APIs`,
    agentDocs: {
      codex: `# Codex — Prompt Engineering

- Structure system prompts: role, context, instructions, output format, examples
- Use few-shot examples for complex tasks
- Request structured output (JSON) with schema constraints
- Version prompts like code — changes affect output quality
- Set temperature based on task: 0 for deterministic, 0.3-0.7 for creative`,
      cursor: `# Cursor — Prompt Engineering

- Store system prompts in dedicated files, not inline strings
- Use template literals with variables for dynamic prompt construction
- Validate structured outputs against a schema (Zod, JSON Schema)
- Log prompt + response pairs for debugging
- A/B test prompt variations with metrics`,
      agents: `# AGENTS.md — Prompt Engineering

Review:
- Is the system prompt structured (role, context, instructions, format)?
- Are prompts versioned?
- Is structured output validated?
- Are edge cases covered in examples?`
    }
  },
  {
    slug: "tool-use-patterns",
    title: "Tool Use Patterns",
    description:
      "Function calling, structured outputs, tool selection strategies, error recovery, and composable tool chains for AI agent applications.",
    category: "a2a",
    accent: "signal-gold",
    tags: ["function-calling", "tools", "structured-output", "agents", "api"],
    body: `# Tool Use Patterns

Design and implement tools that AI agents can reliably call in production applications.

## Tool design principles

- **Single responsibility** — one tool does one thing well
- **Clear naming** — \`searchSkills\` not \`doSearch\` or \`skill_op\`
- **Typed inputs** — JSON Schema with required fields and descriptions
- **Typed outputs** — consistent return shape for each tool
- **Idempotent when possible** — safe to retry on failure

## Function calling flow

1. Model receives the system prompt + available tool definitions
2. Model decides which tool to call (or none)
3. System validates the call, executes the tool, returns the result
4. Model processes the result and either calls another tool or responds

## Error recovery

- Return structured error objects, not raw exceptions
- Include actionable guidance in error messages
- Implement automatic retry with exponential backoff
- Fallback to alternative tools when primary fails
- Log all tool errors for debugging

## Composable tool chains

Build complex operations from simple tools:
- \`searchWeb\` → \`extractContent\` → \`summarize\` → \`formatResponse\`
- Each tool receives the output of the previous
- Intermediate results are logged and checkpointed

## Guardrails

- Rate-limit tool calls per conversation
- Validate tool outputs before passing to the model
- Maximum tool chain depth to prevent infinite loops
- Human-in-the-loop for destructive operations
- Audit log for all tool invocations`,
    agentDocs: {
      codex: `# Codex — Tool Use Patterns

- Design tools with single responsibility and clear naming
- Use JSON Schema for typed inputs and outputs
- Return structured errors with actionable guidance
- Implement retry with exponential backoff
- Rate-limit and log all tool invocations`,
      cursor: `# Cursor — Tool Use Patterns

- Define tools as typed functions with Zod schemas
- Tool definitions go in dedicated files under lib/tools/
- Use a tool registry pattern for dynamic tool discovery
- Validate tool outputs before returning to the model
- Stream tool results for long-running operations`,
      agents: `# AGENTS.md — Tool Use Patterns

Review:
- Are tools single-responsibility with clear names?
- Are inputs and outputs typed?
- Is error recovery implemented?
- Are tool calls rate-limited and logged?`
    }
  },
  {
    slug: "rag-pipelines",
    title: "RAG Pipelines",
    description:
      "Retrieval-augmented generation: chunking strategies, embedding models, vector search, context window management, and hybrid search for AI applications.",
    category: "a2a",
    accent: "signal-gold",
    tags: ["rag", "retrieval", "embeddings", "vector-search", "context"],
    body: `# RAG Pipelines

Retrieval-Augmented Generation grounds language model responses in your actual data instead of relying on training knowledge alone.

## Pipeline stages

1. **Ingest** — load documents from sources
2. **Chunk** — split into semantic segments
3. **Embed** — convert chunks to vector representations
4. **Index** — store embeddings in a vector database
5. **Retrieve** — find relevant chunks for a query
6. **Generate** — pass retrieved context + query to the language model

## Chunking strategies

| Strategy | When to use |
|----------|-------------|
| Fixed size (500 tokens) | Simple, predictable, fast |
| Semantic (by heading/section) | Structured documents |
| Recursive splitting | General purpose with overlap |
| Sentence-level | When precision matters |

## Retrieval methods

- **Semantic search** — cosine similarity on embeddings
- **Keyword search** — BM25 or full-text search
- **Hybrid** — combine semantic + keyword with reciprocal rank fusion
- **Re-ranking** — second pass with a cross-encoder for precision

## Context window management

- Prioritize the most relevant chunks (not just the most)
- Include source metadata for attribution
- Stay within the model's context window with headroom for generation
- Use a summary of retrieved chunks if context is too large

## Evaluation

- **Retrieval quality** — are the right chunks returned? (precision, recall)
- **Generation quality** — are answers accurate and grounded? (faithfulness)
- **End-to-end** — does the user get a correct, useful answer?
- Use LLM-as-judge for automated evaluation at scale`,
    agentDocs: {
      codex: `# Codex — RAG Pipelines

- Choose chunking strategy based on document structure
- Use hybrid search (semantic + keyword) for best retrieval
- Include source metadata for attribution
- Manage context window: relevant chunks with headroom
- Evaluate with retrieval precision and generation faithfulness`,
      cursor: `# Cursor — RAG Pipelines

- Use Supabase pgvector for vector storage
- OpenAI text-embedding-3-small for embeddings
- Chunk documents during ingestion, not at query time
- Store chunk metadata (source, page, section) alongside vectors
- Use RPC functions for hybrid search queries`,
      agents: `# AGENTS.md — RAG Pipelines

Review:
- Is chunking appropriate for the document type?
- Is hybrid search used for retrieval?
- Is context window managed with headroom?
- Are answers evaluated for faithfulness?`
    }
  }
];

// ---------------------------------------------------------------------------
// Security (4)
// ---------------------------------------------------------------------------

const security: SeedSkill[] = [
  {
    slug: "security-best-practices",
    title: "Security Best Practices",
    description:
      "Secure coding defaults for web applications: input validation, output encoding, authentication, authorization, and dependency management.",
    category: "security",
    accent: "signal-blue",
    featured: true,
    visibility: "member",
    tags: ["hardening", "review", "secure-coding", "validation"],
    body: `# Security Best Practices

Security defaults that should be in place before you ship anything to production.

## Input validation

- Validate all input on the server side — never trust client validation alone
- Use schema validation (Zod, Joi) for request bodies
- Sanitize input for SQL injection, XSS, and path traversal
- Reject unexpected fields — don't just ignore them
- Validate content types and file uploads

## Output encoding

- HTML-encode user content before rendering
- Use parameterized queries for SQL — never string concatenation
- Set Content-Type headers explicitly
- Enable CSP headers to prevent XSS
- Escape data in JSON responses

## Authentication

- Hash passwords with bcrypt or argon2 (never MD5 or SHA-1 alone)
- Use secure session cookies (HttpOnly, Secure, SameSite=Strict)
- Implement rate limiting on login endpoints
- Support MFA for sensitive accounts
- Use OAuth/OIDC from a trusted provider (Clerk, Auth0)

## Authorization

- Check permissions on every request, not just the UI
- Use Row Level Security (RLS) in Supabase/Postgres
- Principle of least privilege for API keys and service accounts
- Validate resource ownership — users should only access their own data

## Dependencies

- Audit dependencies regularly (npm audit, Snyk)
- Lock versions in lockfiles
- Monitor for CVEs in your dependency tree
- Minimize dependency count — fewer deps = smaller attack surface`,
    agentDocs: {
      codex: `# Codex — Security Best Practices

- Validate all input server-side with schema validation
- Use parameterized queries — never concatenate SQL
- Hash passwords with bcrypt or argon2
- Check permissions on every request, not just UI
- Audit dependencies regularly for CVEs`,
      cursor: `# Cursor — Security Best Practices

- Use Zod for request body validation in API routes
- Supabase RLS for row-level authorization
- Set security headers in middleware (CSP, HSTS, X-Frame-Options)
- Use Clerk for auth — don't build from scratch
- npm audit in CI pipeline`,
      agents: `# AGENTS.md — Security Best Practices

Review:
- Is input validated server-side?
- Are SQL queries parameterized?
- Are permissions checked on every request?
- Are dependencies audited?`
    }
  },
  {
    slug: "security-threat-model",
    title: "Security Threat Model",
    description:
      "Threat modeling methodology: trust boundaries, asset inventory, attacker capabilities, abuse paths, and structured mitigation planning.",
    category: "security",
    accent: "signal-blue",
    featured: true,
    visibility: "member",
    tags: ["threat-model", "appsec", "trust-boundaries", "mitigations"],
    body: `# Security Threat Model

Systematic identification and mitigation of security risks before they become vulnerabilities.

## STRIDE framework

| Threat | Question |
|--------|----------|
| **S**poofing | Can an attacker impersonate a user or service? |
| **T**ampering | Can data be modified in transit or at rest? |
| **R**epudiation | Can an attacker deny their actions? |
| **I**nformation disclosure | Can sensitive data leak? |
| **D**enial of service | Can the system be made unavailable? |
| **E**levation of privilege | Can a user gain unauthorized access? |

## Process

### 1. Define scope
- System boundaries and components
- Data flows between components
- Trust boundaries (user → API → database)

### 2. Identify assets
- User data, credentials, API keys
- Business logic and intellectual property
- Infrastructure access

### 3. Enumerate threats
- Apply STRIDE to each component and data flow
- Consider both external and internal attackers
- Include supply chain attacks

### 4. Assess risk
- Likelihood × Impact = Risk score
- Prioritize by risk score
- Accept, mitigate, transfer, or avoid each risk

### 5. Plan mitigations
- Specific, actionable mitigations for each high-risk threat
- Assign ownership and timeline
- Validate mitigations with testing

## Output

A threat model document with:
- System diagram with trust boundaries
- Asset inventory
- Threat matrix (STRIDE per component)
- Risk-prioritized mitigation plan`,
    agentDocs: {
      codex: `# Codex — Security Threat Model

- Use STRIDE for systematic threat identification
- Map trust boundaries in the system diagram
- Assess risk as likelihood × impact
- Produce actionable mitigations with ownership
- Review threat model when architecture changes`,
      cursor: `# Cursor — Security Threat Model

- Document threat models in Markdown alongside the codebase
- Use Mermaid diagrams for system architecture and data flows
- Map trust boundaries to middleware and auth checks
- Link mitigations to specific code changes or configurations
- Review when adding new API routes or data stores`,
      agents: `# AGENTS.md — Security Threat Model

Review:
- Are trust boundaries clearly identified?
- Is STRIDE applied to each component?
- Are mitigations specific and actionable?
- Is the model kept up to date?`
    }
  },
  {
    slug: "auth-patterns",
    title: "Auth Patterns",
    description:
      "Authentication and authorization patterns: JWT, sessions, OAuth, RBAC, row-level security, and multi-tenant access control for web apps.",
    category: "security",
    accent: "signal-blue",
    tags: ["auth", "jwt", "sessions", "oauth", "rbac"],
    body: `# Auth Patterns

Authentication (who are you?) and authorization (what can you do?) patterns for production web applications.

## Authentication methods

| Method | Pros | Cons |
|--------|------|------|
| Session cookies | Simple, secure (HttpOnly) | Requires server-side storage |
| JWT (stateless) | Scalable, no server state | Can't revoke without blocklist |
| JWT + refresh token | Balance of security and UX | More complex implementation |
| OAuth/OIDC | Delegate to trusted provider | Integration complexity |

## Session management

- Use HttpOnly, Secure, SameSite=Strict cookies
- Rotate session IDs after login
- Set reasonable expiration times
- Invalidate sessions on password change
- Store sessions server-side (database or Redis)

## Authorization patterns

### RBAC (Role-Based Access Control)
- Assign roles: admin, editor, viewer
- Check role before every operation
- Roles grant permissions, not direct access

### ABAC (Attribute-Based Access Control)
- Fine-grained policies based on user attributes, resource attributes, and context
- More flexible but more complex than RBAC

### Row-Level Security (RLS)
- Database enforces access at the row level
- Policies check user ID against row ownership
- Defense in depth — works even if application logic has bugs

## Multi-tenant patterns

- Tenant ID on every row, enforced by RLS
- Separate schemas per tenant (stronger isolation)
- Separate databases per tenant (strongest isolation, highest cost)
- Validate tenant context on every request`,
    agentDocs: {
      codex: `# Codex — Auth Patterns

- Use session cookies with HttpOnly, Secure, SameSite=Strict
- Implement RBAC with role checks on every operation
- Use Supabase RLS for row-level authorization
- Rotate sessions on login, invalidate on password change
- Multi-tenant: enforce tenant ID on every query`,
      cursor: `# Cursor — Auth Patterns

- Use Clerk for authentication (don't build from scratch)
- Middleware for route-level auth checks
- Supabase RLS policies for data-level authorization
- Store clerk_user_id in database tables for ownership
- Use getAuth() in server components for current user`,
      agents: `# AGENTS.md — Auth Patterns

Review:
- Are sessions configured securely?
- Is authorization checked on every request?
- Is RLS enabled for user-specific data?
- Is multi-tenant isolation enforced?`
    }
  },
  {
    slug: "api-security",
    title: "API Security",
    description:
      "Rate limiting, input validation, CORS configuration, API key management, webhook verification, and abuse prevention for HTTP APIs.",
    category: "security",
    accent: "signal-blue",
    tags: ["api", "rate-limiting", "cors", "validation", "webhooks"],
    body: `# API Security

Protect your API endpoints from abuse, injection, and unauthorized access.

## Rate limiting

- Limit requests per IP, per user, and per API key
- Use sliding window or token bucket algorithms
- Return 429 with Retry-After header when limited
- Apply stricter limits on auth endpoints (login, signup, password reset)
- Consider geographic rate limiting for suspicious regions

## Input validation

- Validate every field with a schema (Zod, JSON Schema)
- Reject requests with unexpected fields
- Validate Content-Type headers
- Limit request body size
- Sanitize file uploads (type, size, content)

## CORS configuration

- Whitelist specific origins — never use \`*\` with credentials
- Restrict allowed methods and headers
- Set appropriate max-age for preflight caching
- Different CORS policies per route if needed

## API key management

- Hash API keys at rest (like passwords)
- Prefix keys for identification (sk_live_, sk_test_)
- Support key rotation without downtime
- Scope keys with permissions (read-only, admin)
- Log key usage for audit

## Webhook security

- Verify webhook signatures with HMAC or asymmetric keys
- Use a shared secret per integration
- Process webhooks idempotently (handle retries)
- Respond quickly (200) and process async
- Validate the payload schema before processing`,
    agentDocs: {
      codex: `# Codex — API Security

- Rate-limit by IP, user, and API key
- Validate every input with a schema
- Whitelist specific CORS origins — never use * with credentials
- Verify webhook signatures before processing
- Hash API keys at rest`,
      cursor: `# Cursor — API Security

- Use middleware for rate limiting (upstash/ratelimit or custom)
- Zod validation at the top of every route handler
- CORS config in next.config.ts or middleware
- Verify Stripe webhook signatures with stripe.webhooks.constructEvent
- Return early on validation failure with appropriate status codes`,
      agents: `# AGENTS.md — API Security

Review:
- Is rate limiting configured on all endpoints?
- Are inputs validated before processing?
- Is CORS properly restricted?
- Are webhooks signature-verified?`
    }
  }
];

// ---------------------------------------------------------------------------
// Ops (2)
// ---------------------------------------------------------------------------

const ops: SeedSkill[] = [
  {
    slug: "gh-actions-ci",
    title: "GitHub Actions CI",
    description:
      "CI/CD workflows with GitHub Actions: test pipelines, build caching, deployment automation, matrix builds, and reusable workflows.",
    category: "ops",
    accent: "signal-gold",
    tags: ["ci", "github-actions", "automation", "deployment", "testing"],
    body: `# GitHub Actions CI

Automate testing, building, and deploying with GitHub Actions workflows.

## Workflow anatomy

\`\`\`yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
      - run: pnpm lint
\`\`\`

## Caching

- Cache node_modules with \`actions/setup-node\` cache option
- Cache build outputs (.next, dist) between runs
- Use \`actions/cache\` for custom cache keys
- Hash lockfile for cache invalidation

## Best practices

- Run tests on every PR and push to main
- Fail fast — lint and type-check before running tests
- Matrix builds for multiple Node versions or OS targets
- Reusable workflows for shared CI logic across repos
- Branch protection rules requiring CI to pass

## Deployment

- Deploy preview environments on PR open
- Deploy to production on merge to main
- Use environment secrets for deployment credentials
- Require manual approval for production deploys (optional)
- Rollback strategy for failed deployments

## Security

- Pin action versions to SHA hashes
- Use GITHUB_TOKEN with minimal permissions
- Never log secrets — use masking
- Audit third-party actions before using`,
    agentDocs: {
      codex: `# Codex — GitHub Actions CI

- Run lint, type-check, and tests on every PR
- Cache dependencies using pnpm/action-setup + setup-node cache
- Pin action versions to SHA hashes for security
- Use matrix builds for multiple Node versions
- Deploy previews on PR, production on merge to main`,
      cursor: `# Cursor — GitHub Actions CI

- Workflows live in .github/workflows/
- Use pnpm/action-setup for pnpm projects
- actions/cache for custom cache keys
- Environment secrets for deployment credentials
- Branch protection rules for required checks`,
      agents: `# AGENTS.md — GitHub Actions CI

Review:
- Are tests running on every PR?
- Are dependencies cached?
- Are action versions pinned?
- Is the deployment pipeline secure?`
    }
  },
  {
    slug: "release-management",
    title: "Release Management",
    description:
      "Semantic versioning, changelogs, release automation, feature flags, canary deployments, and rollback strategies for production software.",
    category: "ops",
    accent: "signal-gold",
    tags: ["releases", "versioning", "changelog", "deployment", "feature-flags"],
    body: `# Release Management

Ship confidently with structured versioning, clear changelogs, and safe deployment strategies.

## Semantic versioning

- **MAJOR** (1.0.0 → 2.0.0) — breaking changes
- **MINOR** (1.0.0 → 1.1.0) — new features, backward compatible
- **PATCH** (1.0.0 → 1.0.1) — bug fixes, backward compatible

## Changelog format

Follow Keep a Changelog format:
- **Added** — new features
- **Changed** — changes in existing functionality
- **Deprecated** — soon-to-be removed features
- **Removed** — removed features
- **Fixed** — bug fixes
- **Security** — vulnerability fixes

## Release process

1. Feature branches merged to main via PR
2. Changelog updated with each merge
3. Version bumped (automated with changesets or release-please)
4. Git tag created
5. GitHub Release published with changelog
6. Deployment triggered

## Deployment strategies

| Strategy | Risk | Speed | Rollback |
|----------|------|-------|----------|
| Blue-green | Low | Fast | Instant (switch) |
| Canary | Low | Gradual | Routing change |
| Rolling | Medium | Gradual | Deploy previous |
| Recreate | High | Fast | Deploy previous |

## Feature flags

- Decouple deployment from release
- Ship code to production behind a flag
- Gradually roll out to percentages of users
- Instant kill switch for broken features
- Clean up old flags — they're technical debt`,
    agentDocs: {
      codex: `# Codex — Release Management

- Follow semantic versioning for all releases
- Keep a changelog with every PR merge
- Use automated release tooling (changesets, release-please)
- Prefer canary or blue-green deployments for safety
- Use feature flags to decouple deploy from release`,
      cursor: `# Cursor — Release Management

- Use changesets for version management in monorepos
- GitHub Releases for distribution and changelog
- Feature flags via Vercel Edge Config or LaunchDarkly
- Tag releases in git for traceability
- Automate changelog generation from commit messages`,
      agents: `# AGENTS.md — Release Management

Review:
- Is versioning following semver?
- Is the changelog kept up to date?
- Is the deployment strategy safe?
- Are feature flags cleaned up after rollout?`
    }
  }
];

// ---------------------------------------------------------------------------
// Export all definitions
// ---------------------------------------------------------------------------

export const SEED_SKILL_DEFINITIONS: SeedSkill[] = [
  ...frontend,
  ...seoGeo,
  ...social,
  ...infra,
  ...containers,
  ...a2a,
  ...security,
  ...ops
];

export function toCreateSkillInput(skill: SeedSkill): CreateSkillInput {
  return {
    ...skill,
    origin: skill.origin ?? "repo"
  };
}
