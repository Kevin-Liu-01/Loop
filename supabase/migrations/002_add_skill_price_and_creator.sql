-- Add price and creator columns to skills table
-- These columns support paid skills and creator attribution.

alter table skills
  add column if not exists price jsonb default null,
  add column if not exists creator_clerk_user_id text default null;

create index if not exists skills_creator_idx on skills(creator_clerk_user_id);
