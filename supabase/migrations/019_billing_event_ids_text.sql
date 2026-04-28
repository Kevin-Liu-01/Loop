-- Stripe event ids use string prefixes such as evt_..., so billing_events.id
-- must not be constrained to uuid.
alter table billing_events
  alter column id type text using id::text;

alter table billing_events
  alter column id drop default;
