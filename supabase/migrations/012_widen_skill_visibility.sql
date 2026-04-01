-- Widen the skills visibility check to include 'private'.
-- The original constraint (001) only allowed 'public' and 'member'.
-- Fork/copy flows need 'private' for user-owned drafts.

alter table skills
  drop constraint if exists skills_visibility_check;

alter table skills
  add constraint skills_visibility_check
  check (visibility in ('public', 'member', 'private'));
