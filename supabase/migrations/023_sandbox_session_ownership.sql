-- Server-only ownership and quota ledger for paid Vercel Sandbox sessions.
create table if not exists sandbox_sessions (
  id uuid primary key default gen_random_uuid(),
  sandbox_id text not null unique,
  clerk_user_id text not null,
  runtime text not null,
  status text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  stopped_at timestamptz
);

create index if not exists sandbox_sessions_user_active_idx
  on sandbox_sessions(clerk_user_id, status, expires_at desc);

alter table sandbox_sessions enable row level security;

-- No client policies: the service role is the only database actor allowed to
-- read or mutate ownership records.
