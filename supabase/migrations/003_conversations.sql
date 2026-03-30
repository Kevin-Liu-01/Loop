-- Conversations: persist chat sessions (copilot + agent studio) per user.

create table conversations (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  channel text not null
    check (channel in ('copilot', 'agent-studio')),
  title text not null default '',
  messages jsonb not null default '[]',
  model text,
  provider_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index conversations_user_idx on conversations(clerk_user_id);
create index conversations_channel_idx on conversations(clerk_user_id, channel);
create index conversations_updated_at_idx on conversations(updated_at desc);

create trigger conversations_updated_at
  before update on conversations
  for each row execute function update_updated_at();
