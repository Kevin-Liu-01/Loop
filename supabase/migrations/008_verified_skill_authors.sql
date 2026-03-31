-- Loop: verified skill authors + direct author ownership
-- Adds a first-class author model so verified publishers can own and edit skills.

create table if not exists skill_authors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  bio text not null default '',
  logo_url text,
  website_url text,
  primary_email text,
  clerk_user_id text,
  verified boolean not null default false,
  is_official boolean not null default false,
  badge_label text not null default 'Verified',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint skill_authors_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index if not exists skill_authors_primary_email_idx
  on skill_authors (lower(primary_email))
  where primary_email is not null;

create unique index if not exists skill_authors_clerk_user_id_idx
  on skill_authors (clerk_user_id)
  where clerk_user_id is not null;

create index if not exists skill_authors_verified_idx on skill_authors (verified);

drop trigger if exists skill_authors_updated_at on skill_authors;
create trigger skill_authors_updated_at
  before update on skill_authors
  for each row execute function update_updated_at();

alter table skills
  add column if not exists author_id uuid references skill_authors(id) on delete set null;

create index if not exists skills_author_id_idx on skills(author_id);

insert into skill_authors (
  slug,
  display_name,
  bio,
  logo_url,
  website_url,
  primary_email,
  verified,
  is_official,
  badge_label,
  metadata
) values (
  'loop',
  'Loop',
  'Official Loop-published skills, workflows, and platform-maintained playbooks.',
  '/brand/loop-mark.svg',
  null,
  'kk23907751@gmail.com',
  true,
  true,
  'Verified',
  jsonb_build_object(
    'brandColor', '#E8650A',
    'kind', 'platform'
  )
)
on conflict (slug) do update
set
  display_name = excluded.display_name,
  bio = excluded.bio,
  logo_url = excluded.logo_url,
  website_url = excluded.website_url,
  primary_email = excluded.primary_email,
  verified = excluded.verified,
  is_official = excluded.is_official,
  badge_label = excluded.badge_label,
  metadata = excluded.metadata,
  updated_at = now();

update skills
set
  author_id = (select id from skill_authors where slug = 'loop'),
  owner_name = coalesce(nullif(owner_name, ''), 'Loop')
where author_id is null
  and creator_clerk_user_id is null;
