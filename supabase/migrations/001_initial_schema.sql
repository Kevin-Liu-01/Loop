-- Loop: initial Supabase schema
-- Migrates all data from local JSON files to Postgres.

-- =============================================================================
-- Helper: updated_at trigger function
-- =============================================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =============================================================================
-- Categories
-- =============================================================================
create table categories (
  slug text primary key,
  title text not null,
  strapline text not null default '',
  description text not null default '',
  hero text not null default '',
  accent text not null default 'signal-red',
  status text not null default 'live'
    check (status in ('live', 'seeded')),
  keywords text[] not null default '{}',
  sources jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categories_updated_at
  before update on categories
  for each row execute function update_updated_at();

-- =============================================================================
-- Skills (all origins: repo, codex, user, remote)
-- =============================================================================
create table skills (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null default '',
  category text not null references categories(slug),
  body text not null default '',
  accent text not null default 'signal-red',
  featured boolean not null default false,
  visibility text not null default 'public'
    check (visibility in ('public', 'member')),
  origin text not null
    check (origin in ('repo', 'codex', 'user', 'remote')),
  path text,
  relative_dir text,
  tags text[] not null default '{}',
  headings jsonb not null default '[]',
  owner_name text,
  sources jsonb not null default '[]',
  automation jsonb,
  updates jsonb not null default '[]',
  agent_docs jsonb not null default '{}',
  references_data jsonb not null default '[]',
  agents_data jsonb not null default '[]',

  -- remote / imported specific
  source_url text,
  canonical_url text,
  sync_enabled boolean not null default false,
  last_synced_at timestamptz,

  -- versioning
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- full-text search (maintained by trigger, not a generated column,
  -- because to_tsvector is STABLE and Supabase requires IMMUTABLE for generated cols)
  search_vector tsvector
);

create index skills_search_idx on skills using gin(search_vector);
create index skills_category_idx on skills(category);
create index skills_origin_idx on skills(origin);
create index skills_slug_idx on skills(slug);

create or replace function skills_search_vector_update()
returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.tags, ' '), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.body, '')), 'D');
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger skills_search_vector_update
  before insert or update on skills
  for each row execute function skills_search_vector_update();

-- =============================================================================
-- Skill versions
-- =============================================================================
create table skill_versions (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references skills(id) on delete cascade,
  version integer not null,
  title text not null,
  description text not null default '',
  category text not null,
  body text not null default '',
  tags text[] not null default '{}',
  owner_name text,
  visibility text not null default 'public',
  sources jsonb not null default '[]',
  automation jsonb,
  updates jsonb not null default '[]',
  agent_docs jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique(skill_id, version)
);

-- =============================================================================
-- Imported MCPs
-- =============================================================================
create table imported_mcps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  manifest_url text not null,
  homepage_url text,
  transport text not null default 'unknown'
    check (transport in ('stdio', 'http', 'sse', 'ws', 'unknown')),
  url text,
  command text,
  args text[] not null default '{}',
  env_keys text[] not null default '{}',
  headers jsonb,
  tags text[] not null default '{}',
  raw text not null default '',
  version integer not null default 1,
  version_label text not null default 'v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger imported_mcps_updated_at
  before update on imported_mcps
  for each row execute function update_updated_at();

-- =============================================================================
-- Imported MCP versions
-- =============================================================================
create table imported_mcp_versions (
  id uuid primary key default gen_random_uuid(),
  mcp_id uuid not null references imported_mcps(id) on delete cascade,
  version integer not null,
  description text not null default '',
  manifest_url text not null,
  homepage_url text,
  transport text not null default 'unknown',
  url text,
  command text,
  args text[] not null default '{}',
  env_keys text[] not null default '{}',
  headers jsonb,
  tags text[] not null default '{}',
  raw text not null default '',
  created_at timestamptz not null default now(),
  unique(mcp_id, version)
);

-- =============================================================================
-- Daily briefs
-- =============================================================================
create table daily_briefs (
  id uuid primary key default gen_random_uuid(),
  category_slug text not null references categories(slug),
  title text not null,
  summary text not null default '',
  what_changed text not null default '',
  experiments text[] not null default '{}',
  items jsonb not null default '[]',
  generated_at timestamptz not null default now()
);

create index daily_briefs_category_idx on daily_briefs(category_slug);
create index daily_briefs_generated_at_idx on daily_briefs(generated_at desc);

-- =============================================================================
-- Loop runs
-- =============================================================================
create table loop_runs (
  id uuid primary key default gen_random_uuid(),
  skill_slug text not null,
  title text not null,
  origin text not null,
  trigger text not null
    check (trigger in ('manual', 'automation', 'import-sync')),
  status text not null
    check (status in ('success', 'error')),
  started_at timestamptz not null,
  finished_at timestamptz not null,
  previous_version_label text,
  next_version_label text,
  href text,
  summary text,
  what_changed text,
  body_changed boolean,
  changed_sections text[] not null default '{}',
  editor_model text,
  source_count integer not null default 0,
  signal_count integer not null default 0,
  messages text[] not null default '{}',
  sources jsonb not null default '[]',
  diff_lines jsonb not null default '[]',
  reasoning_steps jsonb,
  error_message text
);

create index loop_runs_skill_slug_idx on loop_runs(skill_slug);
create index loop_runs_started_at_idx on loop_runs(started_at desc);

-- =============================================================================
-- Refresh runs
-- =============================================================================
create table refresh_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null
    check (status in ('success', 'error')),
  started_at timestamptz not null,
  finished_at timestamptz not null,
  generated_at timestamptz,
  generated_from text,
  write_local boolean not null default false,
  upload_blob boolean not null default false,
  refresh_category_signals boolean not null default false,
  refresh_user_skills boolean not null default false,
  refresh_imported_skills boolean not null default false,
  focus_skill_slugs text[] not null default '{}',
  focus_imported_skill_slugs text[] not null default '{}',
  skill_count integer,
  category_count integer,
  daily_brief_count integer,
  error_message text
);

create index refresh_runs_started_at_idx on refresh_runs(started_at desc);

-- =============================================================================
-- Usage events
-- =============================================================================
create table usage_events (
  id uuid primary key default gen_random_uuid(),
  at timestamptz not null default now(),
  kind text not null,
  source text not null,
  label text not null,
  path text,
  route text,
  method text,
  status integer,
  duration_ms integer,
  ok boolean,
  skill_slug text,
  category_slug text,
  details text
);

create index usage_events_at_idx on usage_events(at desc);
create index usage_events_kind_idx on usage_events(kind);

-- =============================================================================
-- Billing events
-- =============================================================================
create table billing_events (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  created_at timestamptz not null default now(),
  livemode boolean not null default false,
  customer_id text,
  customer_email text,
  subscription_id text,
  plan_slug text,
  status text,
  amount integer,
  currency text
);

-- =============================================================================
-- Subscriptions
-- =============================================================================
create table subscriptions (
  id text primary key,
  customer_id text not null,
  customer_email text,
  plan_slug text,
  status text not null,
  cancel_at_period_end boolean not null default false,
  current_period_end timestamptz,
  checkout_completed_at timestamptz,
  updated_at timestamptz not null default now(),
  latest_invoice_id text
);

create trigger subscriptions_updated_at
  before update on subscriptions
  for each row execute function update_updated_at();

-- =============================================================================
-- Purchases
-- =============================================================================
create table purchases (
  id text primary key,
  clerk_user_id text not null,
  skill_slug text not null,
  stripe_payment_intent_id text not null,
  amount integer not null default 0,
  currency text not null default 'usd',
  purchased_at timestamptz not null default now()
);

create index purchases_user_idx on purchases(clerk_user_id);
create index purchases_skill_idx on purchases(skill_slug);

-- =============================================================================
-- Full-text search RPC function
-- =============================================================================
create or replace function search_skills_fts(
  search_query text,
  result_limit integer default 12
)
returns table (
  slug text,
  title text,
  description text,
  category text,
  tags text[],
  updated_at timestamptz,
  origin text,
  version integer,
  rank real
)
language sql stable
as $$
  select
    s.slug,
    s.title,
    s.description,
    s.category,
    s.tags,
    s.updated_at,
    s.origin,
    s.version,
    ts_rank(s.search_vector, to_tsquery('english', search_query)) as rank
  from skills s
  where s.search_vector @@ to_tsquery('english', search_query)
  order by rank desc, s.updated_at desc
  limit result_limit;
$$;
