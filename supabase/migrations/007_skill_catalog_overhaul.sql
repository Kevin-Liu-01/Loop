-- Loop: skill catalog + MCP normalization overhaul
-- Adds normalized upstream skill sources, source-run telemetry, and
-- MCP verification fields so the app can distinguish trusted/runnable content
-- from unverified catalog filler.

alter table skills
  add column if not exists featured_rank integer not null default 0,
  add column if not exists quality_score integer not null default 0,
  add column if not exists research_profile jsonb not null default '{}';

update skills
set featured_rank = case when featured then greatest(featured_rank, 50) else featured_rank end
where featured = true;

alter table imported_mcps
  add column if not exists slug text,
  add column if not exists docs_url text,
  add column if not exists package_name text,
  add column if not exists package_registry text,
  add column if not exists install_strategy text not null default 'manual'
    check (install_strategy in ('npx', 'uvx', 'binary', 'remote-http', 'manual')),
  add column if not exists auth_type text not null default 'none'
    check (auth_type in ('none', 'oauth', 'api-key', 'pat', 'session', 'mixed')),
  add column if not exists verification_status text not null default 'unverified'
    check (verification_status in ('verified', 'partial', 'unverified', 'broken')),
  add column if not exists sandbox_supported boolean not null default false,
  add column if not exists sandbox_notes text not null default '',
  add column if not exists normalized_config jsonb not null default '{}';

alter table imported_mcp_versions
  add column if not exists docs_url text,
  add column if not exists package_name text,
  add column if not exists package_registry text,
  add column if not exists install_strategy text not null default 'manual'
    check (install_strategy in ('npx', 'uvx', 'binary', 'remote-http', 'manual')),
  add column if not exists auth_type text not null default 'none'
    check (auth_type in ('none', 'oauth', 'api-key', 'pat', 'session', 'mixed')),
  add column if not exists verification_status text not null default 'unverified'
    check (verification_status in ('verified', 'partial', 'unverified', 'broken')),
  add column if not exists sandbox_supported boolean not null default false,
  add column if not exists sandbox_notes text not null default '',
  add column if not exists normalized_config jsonb not null default '{}';

update imported_mcps
set
  slug = coalesce(
    slug,
    nullif(regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'), '')
  ),
  install_strategy = case
    when transport = 'http' then 'remote-http'
    when lower(coalesce(command, '')) = 'npx' then 'npx'
    when lower(coalesce(command, '')) = 'uvx' then 'uvx'
    when coalesce(command, '') <> '' then 'binary'
    else 'manual'
  end,
  auth_type = case
    when coalesce(array_length(env_keys, 1), 0) > 0 and transport = 'http' then 'mixed'
    when coalesce(array_length(env_keys, 1), 0) > 0 then 'api-key'
    when coalesce(url, '') like 'https://mcp.%' then 'session'
    else 'none'
  end,
  verification_status = case
    when transport in ('stdio', 'http') and (command is not null or url is not null) then 'partial'
    else 'unverified'
  end,
  sandbox_supported = case
    when transport in ('stdio', 'http') and coalesce(name, '') not in ('Linear', 'Notion', 'Slack', 'Stripe', 'Vercel')
      then true
    else false
  end,
  sandbox_notes = case
    when coalesce(name, '') in ('Linear', 'Notion', 'Slack', 'Stripe', 'Vercel')
      then 'Requires hosted auth/session or provider-specific credentials before it is safe to expose in the shared sandbox.'
    when transport not in ('stdio', 'http')
      then 'Transport is not executable by the current runtime.'
    else 'Runnable in the sandbox when the required command or endpoint is reachable.'
  end,
  normalized_config = jsonb_strip_nulls(
    jsonb_build_object(
      'transport', transport,
      'url', url,
      'command', command,
      'args', to_jsonb(args),
      'envKeys', to_jsonb(env_keys),
      'headers', coalesce(headers, '{}'::jsonb)
    )
  );

create unique index if not exists imported_mcps_slug_idx on imported_mcps(slug);
create index if not exists imported_mcps_sandbox_supported_idx on imported_mcps(sandbox_supported);
create index if not exists imported_mcps_verification_status_idx on imported_mcps(verification_status);

create table if not exists trusted_skill_sources (
  id text primary key,
  slug text not null unique,
  name text not null,
  trust_tier text not null
    check (trust_tier in ('official', 'vendor', 'standards', 'community')),
  source_type text not null
    check (source_type in ('official-docs', 'official-repo', 'vendor-docs', 'community-curated')),
  homepage_url text not null,
  repo_url text,
  logo_url text,
  discovery_mode text not null default 'discover'
    check (discovery_mode in ('track', 'discover', 'search')),
  search_queries text[] not null default '{}',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trusted_skill_sources_updated_at
  before update on trusted_skill_sources
  for each row execute function update_updated_at();

create table if not exists skill_upstreams (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  category text not null references categories(slug),
  source_id text not null references trusted_skill_sources(id) on delete restrict,
  upstream_url text not null,
  upstream_kind text not null
    check (upstream_kind in ('skill', 'docs-pack', 'plugin-skill', 'repo-skill')),
  body text not null default '',
  logo_url text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger skill_upstreams_updated_at
  before update on skill_upstreams
  for each row execute function update_updated_at();

create table if not exists skill_upstream_links (
  skill_slug text not null references skills(slug) on delete cascade,
  upstream_slug text not null references skill_upstreams(slug) on delete cascade,
  relation text not null default 'secondary'
    check (relation in ('primary', 'secondary', 'derived-from')),
  created_at timestamptz not null default now(),
  primary key (skill_slug, upstream_slug)
);

create table if not exists skill_source_runs (
  id uuid primary key default gen_random_uuid(),
  loop_run_id uuid references loop_runs(id) on delete cascade,
  skill_slug text not null references skills(slug) on delete cascade,
  source_id text not null,
  phase text not null
    check (phase in ('discover', 'fetch', 'rank', 'synthesize')),
  status text not null
    check (status in ('pending', 'running', 'done', 'error')),
  strategy text,
  query text,
  reasoning text,
  signal_count integer not null default 0,
  results jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index if not exists skill_source_runs_skill_slug_idx on skill_source_runs(skill_slug, created_at desc);
create index if not exists skill_source_runs_loop_run_idx on skill_source_runs(loop_run_id);

insert into trusted_skill_sources (
  id, slug, name, trust_tier, source_type, homepage_url, repo_url, logo_url, discovery_mode, search_queries, tags
) values
  ('openai-docs', 'openai-docs', 'OpenAI Developer Docs', 'official', 'official-docs', 'https://platform.openai.com/docs', 'https://github.com/openai', 'https://github.com/openai.png?size=64', 'discover', array['responses api', 'agents sdk', 'prompting guide', 'model updates'], array['openai', 'agents', 'docs']),
  ('anthropic-skills', 'anthropic-skills', 'Anthropic Skills', 'official', 'official-repo', 'https://github.com/anthropics/skills', 'https://github.com/anthropics/skills', 'https://cdn.simpleicons.org/anthropic', 'discover', array['skills', 'mcp', 'agent workflow'], array['anthropic', 'skills']),
  ('openai-skills', 'openai-skills', 'OpenAI Skills', 'official', 'official-repo', 'https://github.com/openai/skills', 'https://github.com/openai/skills', 'https://github.com/openai.png?size=64', 'discover', array['codex skill', 'workflow', 'agent skill'], array['openai', 'skills']),
  ('vercel-docs', 'vercel-docs', 'Vercel Docs', 'official', 'vendor-docs', 'https://vercel.com/docs', 'https://github.com/vercel', 'https://cdn.simpleicons.org/vercel', 'discover', array['ai sdk', 'workflow', 'observability', 'next.js'], array['vercel', 'docs']),
  ('nextjs-docs', 'nextjs-docs', 'Next.js Docs', 'official', 'official-docs', 'https://nextjs.org/docs', 'https://github.com/vercel/next.js', 'https://cdn.simpleicons.org/nextdotjs', 'discover', array['app router', 'server actions', 'cache'], array['nextjs', 'docs']),
  ('react-docs', 'react-docs', 'React Docs', 'official', 'official-docs', 'https://react.dev', 'https://github.com/facebook/react', 'https://cdn.simpleicons.org/react', 'discover', array['compiler', 'concurrent features', 'hooks'], array['react', 'docs']),
  ('modelcontextprotocol', 'modelcontextprotocol', 'Model Context Protocol', 'standards', 'official-repo', 'https://modelcontextprotocol.io', 'https://github.com/modelcontextprotocol', 'https://github.com/modelcontextprotocol.png?size=64', 'discover', array['specification', 'servers', 'transports', 'tools'], array['mcp', 'standards']),
  ('owasp', 'owasp', 'OWASP', 'standards', 'official-docs', 'https://owasp.org', 'https://github.com/owasp', 'https://cdn.simpleicons.org/owasp', 'discover', array['threat modeling', 'secure coding', 'api security'], array['security', 'owasp']),
  ('supabase-docs', 'supabase-docs', 'Supabase Docs', 'vendor', 'vendor-docs', 'https://supabase.com/docs', 'https://github.com/supabase', 'https://cdn.simpleicons.org/supabase', 'discover', array['rls', 'postgres', 'edge functions'], array['supabase', 'docs']),
  ('cloudflare-docs', 'cloudflare-docs', 'Cloudflare Docs', 'vendor', 'vendor-docs', 'https://developers.cloudflare.com', 'https://github.com/cloudflare', 'https://cdn.simpleicons.org/cloudflare', 'discover', array['workers', 'cache', 'durable objects'], array['cloudflare', 'docs'])
on conflict (id) do update
set
  slug = excluded.slug,
  name = excluded.name,
  trust_tier = excluded.trust_tier,
  source_type = excluded.source_type,
  homepage_url = excluded.homepage_url,
  repo_url = excluded.repo_url,
  logo_url = excluded.logo_url,
  discovery_mode = excluded.discovery_mode,
  search_queries = excluded.search_queries,
  tags = excluded.tags;
