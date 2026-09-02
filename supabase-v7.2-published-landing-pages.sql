-- YOUYOU V7.2 — Published Landing Pages
-- Run ONCE in Supabase SQL Editor before using Publish.
-- Creates the publishing table and Row Level Security used by /p/:slug pages.

create table if not exists public.landing_pages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  draft_id text not null,
  slug text not null,
  name text not null default 'Landing page',
  template_id text not null default 'product-launch',
  content jsonb not null default '{}'::jsonb,
  html_snapshot text not null default '',
  status text not null default 'draft' check (status in ('draft','published','unpublished')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists landing_pages_company_draft_uidx
  on public.landing_pages(company_id, draft_id);

create unique index if not exists landing_pages_slug_uidx
  on public.landing_pages(slug);

create index if not exists landing_pages_company_updated_idx
  on public.landing_pages(company_id, updated_at desc);

create index if not exists landing_pages_public_lookup_idx
  on public.landing_pages(slug, status);

alter table public.landing_pages enable row level security;

-- Anyone may load only pages that are explicitly published.
drop policy if exists "Public can view published landing pages" on public.landing_pages;
create policy "Public can view published landing pages"
on public.landing_pages
for select
to public
using (status = 'published');

-- Signed-in members may also see their own workspace pages, including drafts.
drop policy if exists "Users can view company landing pages" on public.landing_pages;
create policy "Users can view company landing pages"
on public.landing_pages
for select
to authenticated
using (
  company_id in (
    select p.company_id
    from public.profiles p
    where p.id = auth.uid()
  )
);

-- Only members of the matching company may create pages.
drop policy if exists "Users can insert company landing pages" on public.landing_pages;
create policy "Users can insert company landing pages"
on public.landing_pages
for insert
to authenticated
with check (
  company_id in (
    select p.company_id
    from public.profiles p
    where p.id = auth.uid()
  )
);

-- Only members of the matching company may update pages.
drop policy if exists "Users can update company landing pages" on public.landing_pages;
create policy "Users can update company landing pages"
on public.landing_pages
for update
to authenticated
using (
  company_id in (
    select p.company_id
    from public.profiles p
    where p.id = auth.uid()
  )
)
with check (
  company_id in (
    select p.company_id
    from public.profiles p
    where p.id = auth.uid()
  )
);

-- Only members of the matching company may delete pages.
drop policy if exists "Users can delete company landing pages" on public.landing_pages;
create policy "Users can delete company landing pages"
on public.landing_pages
for delete
to authenticated
using (
  company_id in (
    select p.company_id
    from public.profiles p
    where p.id = auth.uid()
  )
);

grant select on public.landing_pages to anon;
grant select, insert, update, delete on public.landing_pages to authenticated;
