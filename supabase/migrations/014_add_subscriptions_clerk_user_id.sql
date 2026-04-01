-- Add clerk_user_id to subscriptions so we can look up a user's active
-- subscription by their Clerk identity, not just by Stripe customer_id.
-- This column already exists in the live database but was never captured
-- in a migration.

alter table subscriptions
  add column if not exists clerk_user_id text;

create index if not exists subscriptions_clerk_user_id_idx
  on subscriptions (clerk_user_id)
  where clerk_user_id is not null;
