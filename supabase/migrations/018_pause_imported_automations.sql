-- Pause all skill automations except the 10 high-signal daily skills.
-- Covers both imported (origin = 'remote') and seeded skills that are not
-- in the active set. Skills can be re-enabled individually from settings.
-- Also demotes cadence to 'weekly' so re-enabled skills don't run daily.

UPDATE skills
SET automation = jsonb_set(
  jsonb_set(
    jsonb_set(automation::jsonb, '{enabled}', 'false'),
    '{status}', '"paused"'
  ),
  '{cadence}', '"weekly"'
)
WHERE automation IS NOT NULL
  AND slug NOT IN (
    'frontend-frontier',
    'motion-framer',
    'nextjs-patterns',
    'seo-geo',
    'web-performance',
    'agent-orchestration',
    'mcp-development',
    'prompt-engineering',
    'tool-use-patterns',
    'security-best-practices'
  );
