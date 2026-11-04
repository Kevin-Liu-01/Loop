-- One-off cleanup to run by hand in the Supabase SQL editor. Not a migration.
--
-- The app reads a run's transcript, sources, diff and reasoning only for each skill's latest run
-- (the activity panel on the skill page). Older runs keep their summary columns, which the run
-- history and the manual-update cooldown use, and lose the payload columns that hold almost all
-- of loop_runs' bytes.
--
-- Keeps full payloads for each skill's three newest runs per origin and for anything from the
-- last 30 days.

-- 1. Preview: how many runs and how many bytes this clears.
with ranked as (
  select id,
         row_number() over (partition by skill_slug, origin order by started_at desc) as recency
  from loop_runs
)
select count(*) as runs,
       pg_size_pretty(sum(
         pg_column_size(run.messages) + pg_column_size(run.sources)
         + pg_column_size(run.diff_lines) + coalesce(pg_column_size(run.reasoning_steps), 0)
         + coalesce(pg_column_size(run.added_sources), 0)
       )) as payload
from loop_runs as run
join ranked on ranked.id = run.id
where ranked.recency > 3
  and run.started_at < now() - interval '30 days';

-- 2. Clear the payloads.
with ranked as (
  select id,
         row_number() over (partition by skill_slug, origin order by started_at desc) as recency
  from loop_runs
)
update loop_runs as run
set messages = '{}',
    sources = '[]',
    diff_lines = '[]',
    reasoning_steps = null,
    added_sources = null
from ranked
where run.id = ranked.id
  and ranked.recency > 3
  and run.started_at < now() - interval '30 days';

-- 3. Give the freed space back to the disk. Locks loop_runs for a few seconds at this size.
vacuum full loop_runs;
