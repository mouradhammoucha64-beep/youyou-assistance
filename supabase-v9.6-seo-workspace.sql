-- YOUYOU SEO workspace. Run once in Supabase SQL Editor before deployment.
-- All access goes through authenticated server endpoints; browser roles cannot read tokens.
begin;
create table if not exists public.seo_workspaces (
  company_id uuid primary key references public.companies(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.seo_drafts (
  company_id uuid not null references public.companies(id) on delete cascade,
  url text not null,
  draft jsonb not null,
  updated_at timestamptz not null default now(),
  primary key(company_id, url)
);
create table if not exists public.seo_audits (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  url text not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists seo_audits_company_date on public.seo_audits(company_id, created_at desc);
create table if not exists public.seo_google_connections (
  company_id uuid primary key references public.companies(id) on delete cascade,
  connected_by uuid not null references auth.users(id) on delete cascade,
  refresh_token_ciphertext text not null,
  property text,
  updated_at timestamptz not null default now()
);
create table if not exists public.seo_oauth_states (
  state_hash text primary key,
  browser_hash text not null,
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null
);
create table if not exists public.seo_rate_limits (
  company_id uuid not null references public.companies(id) on delete cascade,
  action text not null,
  window_start timestamptz not null,
  count integer not null default 1,
  primary key(company_id, action)
);
alter table public.seo_drafts enable row level security;
alter table public.seo_workspaces enable row level security;
alter table public.seo_audits enable row level security;
alter table public.seo_google_connections enable row level security;
alter table public.seo_oauth_states enable row level security;
alter table public.seo_rate_limits enable row level security;
revoke all on public.seo_drafts, public.seo_workspaces, public.seo_audits, public.seo_google_connections, public.seo_oauth_states, public.seo_rate_limits from public, anon, authenticated;
grant all on public.seo_drafts, public.seo_workspaces, public.seo_audits, public.seo_google_connections, public.seo_oauth_states, public.seo_rate_limits to service_role;
create or replace function public.seo_consume_limit(p_company uuid, p_action text, p_limit integer, p_seconds integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  insert into public.seo_rate_limits(company_id, action, window_start, count)
  values (p_company, p_action, now(), 1)
  on conflict (company_id, action) do update set
    count = case when seo_rate_limits.window_start < now() - make_interval(secs => p_seconds) then 1 else seo_rate_limits.count + 1 end,
    window_start = case when seo_rate_limits.window_start < now() - make_interval(secs => p_seconds) then now() else seo_rate_limits.window_start end
  returning count into n;
  return n <= p_limit;
end; $$;
revoke all on function public.seo_consume_limit(uuid,text,integer,integer) from public, anon, authenticated;
grant execute on function public.seo_consume_limit(uuid,text,integer,integer) to service_role;
commit;
