-- Seed verified skill_authors rows for each external skill source provider.
-- Skills imported from these providers are automatically linked to their
-- verified author, so the UI shows a "Verified" badge.

-- Anthropic (official)
insert into skill_authors (
  slug, display_name, bio, logo_url, website_url, verified, is_official, badge_label, metadata
) values (
  'anthropic',
  'Anthropic',
  'Official Claude agent skills maintained by Anthropic.',
  'https://cdn.simpleicons.org/anthropic',
  'https://github.com/anthropics/skills',
  true,
  true,
  'Official',
  jsonb_build_object('kind', 'provider', 'sourceId', 'anthropic-skills')
)
on conflict (slug) do update set
  display_name = excluded.display_name,
  bio          = excluded.bio,
  logo_url     = excluded.logo_url,
  website_url  = excluded.website_url,
  verified     = excluded.verified,
  is_official  = excluded.is_official,
  badge_label  = excluded.badge_label,
  metadata     = excluded.metadata,
  updated_at   = now();

-- OpenAI (official)
insert into skill_authors (
  slug, display_name, bio, logo_url, website_url, verified, is_official, badge_label, metadata
) values (
  'openai',
  'OpenAI',
  'Official Codex agent skills maintained by OpenAI.',
  'https://github.com/openai.png?size=64',
  'https://github.com/openai/skills',
  true,
  true,
  'Official',
  jsonb_build_object('kind', 'provider', 'sourceId', 'openai-skills')
)
on conflict (slug) do update set
  display_name = excluded.display_name,
  bio          = excluded.bio,
  logo_url     = excluded.logo_url,
  website_url  = excluded.website_url,
  verified     = excluded.verified,
  is_official  = excluded.is_official,
  badge_label  = excluded.badge_label,
  metadata     = excluded.metadata,
  updated_at   = now();

-- Cursor Directory (community, verified)
insert into skill_authors (
  slug, display_name, bio, logo_url, website_url, verified, is_official, badge_label, metadata
) values (
  'cursor-directory',
  'Cursor Directory',
  'Community-curated Cursor rules from cursor.directory.',
  '/brands/cursor.svg',
  'https://cursor.directory',
  true,
  false,
  'Verified',
  jsonb_build_object('kind', 'provider', 'sourceId', 'cursor-directory')
)
on conflict (slug) do update set
  display_name = excluded.display_name,
  bio          = excluded.bio,
  logo_url     = excluded.logo_url,
  website_url  = excluded.website_url,
  verified     = excluded.verified,
  is_official  = excluded.is_official,
  badge_label  = excluded.badge_label,
  metadata     = excluded.metadata,
  updated_at   = now();

-- Awesome Agent Skills (community, verified)
insert into skill_authors (
  slug, display_name, bio, logo_url, website_url, verified, is_official, badge_label, metadata
) values (
  'awesome-agent-skills',
  'Awesome Agent Skills',
  'Community-curated list of agent skill repos.',
  'https://cdn.simpleicons.org/github',
  'https://github.com/heilcheng/awesome-agent-skills',
  true,
  false,
  'Verified',
  jsonb_build_object('kind', 'provider', 'sourceId', 'awesome-agent-skills')
)
on conflict (slug) do update set
  display_name = excluded.display_name,
  bio          = excluded.bio,
  logo_url     = excluded.logo_url,
  website_url  = excluded.website_url,
  verified     = excluded.verified,
  is_official  = excluded.is_official,
  badge_label  = excluded.badge_label,
  metadata     = excluded.metadata,
  updated_at   = now();

-- Awesome MCP Servers (community, verified)
insert into skill_authors (
  slug, display_name, bio, logo_url, website_url, verified, is_official, badge_label, metadata
) values (
  'awesome-mcp-servers',
  'Awesome MCP Servers',
  'Community-curated list of MCP server integrations.',
  '/brands/mcp.svg',
  'https://github.com/appcypher/awesome-mcp-servers',
  true,
  false,
  'Verified',
  jsonb_build_object('kind', 'provider', 'sourceId', 'awesome-mcp-servers')
)
on conflict (slug) do update set
  display_name = excluded.display_name,
  bio          = excluded.bio,
  logo_url     = excluded.logo_url,
  website_url  = excluded.website_url,
  verified     = excluded.verified,
  is_official  = excluded.is_official,
  badge_label  = excluded.badge_label,
  metadata     = excluded.metadata,
  updated_at   = now();

-- Backfill: link existing Anthropic-imported skills
update skills
set author_id = (select id from skill_authors where slug = 'anthropic')
where author_id is null
  and owner_name = 'Anthropic Skills';

-- Backfill: link existing OpenAI-imported skills
update skills
set author_id = (select id from skill_authors where slug = 'openai')
where author_id is null
  and owner_name = 'OpenAI Skills';

-- Backfill: link existing Cursor Directory skills
update skills
set author_id = (select id from skill_authors where slug = 'cursor-directory')
where author_id is null
  and owner_name = 'Cursor Directory';

-- Backfill: link existing Awesome Agent Skills
update skills
set author_id = (select id from skill_authors where slug = 'awesome-agent-skills')
where author_id is null
  and owner_name = 'Awesome Agent Skills';

-- Backfill: link existing Awesome MCP Servers skills
update skills
set author_id = (select id from skill_authors where slug = 'awesome-mcp-servers')
where author_id is null
  and owner_name = 'Awesome MCP Servers';
