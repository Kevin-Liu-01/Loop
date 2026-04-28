-- Filter search_skills_fts to only return public skills.
create or replace function search_skills_fts(
  search_query text,
  result_limit integer default 12
)
returns table (
  slug text,
  title text,
  description text,
  category text,
  tags text[],
  updated_at timestamptz,
  origin text,
  version integer,
  rank real
)
language sql stable
as $$
  select
    s.slug,
    s.title,
    s.description,
    s.category,
    s.tags,
    s.updated_at,
    s.origin,
    s.version,
    ts_rank(s.search_vector, to_tsquery('english', search_query)) as rank
  from skills s
  where s.search_vector @@ to_tsquery('english', search_query)
    and s.visibility = 'public'
  order by rank desc, s.updated_at desc
  limit result_limit;
$$;
