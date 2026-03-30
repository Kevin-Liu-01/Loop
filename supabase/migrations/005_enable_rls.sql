-- Enable Row Level Security on all tables.
--
-- All application queries use the service_role key (which bypasses RLS),
-- so enabling RLS with no policies effectively blocks the publicly-exposed
-- anon key from reading or writing any data.

alter table categories enable row level security;
alter table skills enable row level security;
alter table skill_versions enable row level security;
alter table imported_mcps enable row level security;
alter table imported_mcp_versions enable row level security;
alter table daily_briefs enable row level security;
alter table loop_runs enable row level security;
alter table refresh_runs enable row level security;
alter table usage_events enable row level security;
alter table billing_events enable row level security;
alter table subscriptions enable row level security;
alter table purchases enable row level security;
alter table conversations enable row level security;
