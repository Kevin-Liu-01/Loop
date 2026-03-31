import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import type { SkillRecord } from "@/lib/types";

type SkillResearchPanelProps = {
  skill: SkillRecord;
};

function titleCase(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function SkillResearchPanel({ skill }: SkillResearchPanelProps) {
  const profile = skill.researchProfile;
  const trackedSources = skill.sources ?? [];

  if (!profile && trackedSources.length === 0 && (skill.upstreams?.length ?? 0) === 0) {
    return null;
  }

  const modeCounts = new Map<string, number>();
  const trustCounts = new Map<string, number>();

  for (const source of trackedSources) {
    if (source.mode) {
      modeCounts.set(source.mode, (modeCounts.get(source.mode) ?? 0) + 1);
    }

    if (source.trust) {
      trustCounts.set(source.trust, (trustCounts.get(source.trust) ?? 0) + 1);
    }
  }

  return (
    <section className="grid gap-5 border-t border-line pt-8" id="research">
      <h2 className="m-0 font-serif text-xl font-medium tracking-[-0.02em] text-ink">
        Research engine
      </h2>

      <Panel compact square>
        <div className="grid gap-4">
          {profile?.summary ? (
            <p className="m-0 max-w-[68ch] text-sm leading-relaxed text-ink-soft">
              {profile.summary}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Badge>{trackedSources.length} sources</Badge>
            {Array.from(modeCounts.entries()).map(([mode, count]) => (
              <Badge key={mode} muted>
                {count} {titleCase(mode)}
              </Badge>
            ))}
            {Array.from(trustCounts.entries()).map(([trust, count]) => (
              <Badge key={trust} muted>
                {count} {titleCase(trust)}
              </Badge>
            ))}
            {skill.featuredRank ? <Badge muted>Rank {skill.featuredRank}</Badge> : null}
            {skill.qualityScore ? <Badge muted>Quality {skill.qualityScore}</Badge> : null}
          </div>

          {profile?.featuredReason ? (
            <div className="grid gap-1.5 rounded-none border border-line bg-paper-3/70 p-4 dark:bg-paper-2/40">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                Why this is featured
              </span>
              <p className="m-0 text-sm leading-relaxed text-ink-soft">
                {profile.featuredReason}
              </p>
            </div>
          ) : null}

          {profile?.process?.length ? (
            <div className="grid gap-3">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                Discovery process
              </span>
              <div className="grid gap-3">
                {profile.process.map((step, index) => (
                  <article
                    className="grid gap-1 rounded-none border border-line bg-paper-3/70 px-4 py-3 dark:bg-paper-2/40"
                    key={`${step.title}-${index}`}
                  >
                    <strong className="text-sm text-ink">
                      {index + 1}. {step.title}
                    </strong>
                    <p className="m-0 text-sm leading-relaxed text-ink-soft">{step.detail}</p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {profile?.discoveryQueries && profile.discoveryQueries.length > 0 ? (
            <div className="grid gap-2">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                Query hints
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile.discoveryQueries.map((query) => (
                  <Badge key={query} muted>
                    {query}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          {skill.upstreams && skill.upstreams.length > 0 ? (
            <div className="grid gap-2">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                Trusted upstreams
              </span>
              <div className="grid gap-2">
                {skill.upstreams.map((upstream) => (
                  <a
                    className="grid gap-1 rounded-none border border-line bg-paper-3/70 px-4 py-3 no-underline transition-colors hover:bg-paper-3 dark:bg-paper-2/40"
                    href={upstream.upstreamUrl}
                    key={upstream.slug}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <strong className="text-sm text-ink">{upstream.title}</strong>
                    <p className="m-0 text-sm leading-relaxed text-ink-soft">{upstream.description}</p>
                    {upstream.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {upstream.tags.slice(0, 4).map((tag) => (
                          <Badge key={`${upstream.slug}-${tag}`} muted>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Panel>
    </section>
  );
}
