-- Unify badge_label to 'Verified' for all verified authors.
-- Previously Anthropic and OpenAI used 'Official'; now every checkmark badge
-- displays the same label.

update skill_authors
set badge_label = 'Verified',
    updated_at  = now()
where badge_label <> 'Verified'
  and verified = true;
