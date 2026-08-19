-- YOUYOU V3.6 — AI Control Center persistence
-- Run once in Supabase > SQL Editor.

create table if not exists public.ai_settings (
  company_id uuid primary key references public.companies(id) on delete cascade,
  agent_name text not null default 'YOUYOU AI',
  tone text not null default 'Professional',
  language text not null default 'English',
  instructions text not null default '',
  response_style text not null default 'Balanced',
  lead_capture boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.ai_settings enable row level security;

grant select, insert, update on table public.ai_settings to authenticated;

revoke all on table public.ai_settings from anon;

drop policy if exists "Users can view company AI settings" on public.ai_settings;
drop policy if exists "Users can insert company AI settings" on public.ai_settings;
drop policy if exists "Users can update company AI settings" on public.ai_settings;

create policy "Users can view company AI settings"
on public.ai_settings
for select
to authenticated
using (
  company_id in (
    select p.company_id
    from public.profiles p
    where p.id = auth.uid()
  )
);

create policy "Users can insert company AI settings"
on public.ai_settings
for insert
to authenticated
with check (
  company_id in (
    select p.company_id
    from public.profiles p
    where p.id = auth.uid()
  )
);

create policy "Users can update company AI settings"
on public.ai_settings
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
