-- Hot-path indexes for skill detail telemetry and recent run lookups.
create index if not exists usage_events_skill_at_idx
  on usage_events(skill_slug, at desc)
  where skill_slug is not null;

create index if not exists loop_runs_skill_started_at_idx
  on loop_runs(skill_slug, started_at desc);

create index if not exists daily_briefs_category_generated_at_idx
  on daily_briefs(category_slug, generated_at desc);
