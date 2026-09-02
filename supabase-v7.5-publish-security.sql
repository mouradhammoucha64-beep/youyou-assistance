-- YOUYOU V7.5 — Published Landing Page Security Lock
-- Run ONCE after supabase-v7.2-published-landing-pages.sql.
-- Public visitors do NOT receive direct table access anymore.
-- The public page endpoint can only request the published HTML snapshot by slug.

-- Remove broad anonymous table access inherited from V7.2.
revoke all privileges on table public.landing_pages from anon;

-- Authenticated workspace users keep normal CRUD access; RLS still limits rows by company.
grant select, insert, update, delete
on table public.landing_pages
to authenticated;

-- Public users do not need a table policy once direct SELECT is revoked.
drop policy if exists "Public can view published landing pages" on public.landing_pages;

-- Return ONLY the frozen published HTML. Draft JSON, company_id, draft_id and other
-- internal fields are never exposed to anonymous callers.
create or replace function public.get_published_landing_page(p_slug text)
returns table (html_snapshot text)
language sql
stable
security definer
set search_path = public
as $$
  select lp.html_snapshot
  from public.landing_pages lp
  where lp.slug = lower(trim(p_slug))
    and lp.status = 'published'
    and nullif(lp.html_snapshot, '') is not null
  limit 1;
$$;

revoke all on function public.get_published_landing_page(text) from public;
grant execute on function public.get_published_landing_page(text) to anon;
grant execute on function public.get_published_landing_page(text) to authenticated;
