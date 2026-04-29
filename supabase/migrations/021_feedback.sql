-- Feedback submissions from the floating widget
create table if not exists feedback (
  id            uuid primary key default gen_random_uuid(),
  clerk_user_id text,
  email         text,
  message       text not null,
  page_url      text,
  created_at    timestamptz not null default now()
);

alter table feedback enable row level security;

create policy "Service role full access on feedback"
  on feedback for all
  using (true)
  with check (true);
