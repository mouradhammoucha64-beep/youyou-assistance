-- YOUYOU V3.8 — Website Widget Customization
-- Run once in Supabase SQL Editor.

create table if not exists public.widget_configs (
  company_id uuid primary key references public.companies(id) on delete cascade,
  enabled boolean not null default true,
  welcome_message text not null default 'Hi! 👋 How can I help you today?',
  accent_color text not null default '#22c55e',
  position text not null default 'Right',
  updated_at timestamptz not null default now()
);

alter table public.widget_configs enable row level security;

drop policy if exists "Users can view own widget config" on public.widget_configs;
create policy "Users can view own widget config"
on public.widget_configs
for select
to authenticated
using (
  company_id in (
    select p.company_id
    from public.profiles p
    where p.id = auth.uid()
  )
);

drop policy if exists "Users can insert own widget config" on public.widget_configs;
create policy "Users can insert own widget config"
on public.widget_configs
for insert
to authenticated
with check (
  company_id in (
    select p.company_id
    from public.profiles p
    where p.id = auth.uid()
  )
);

drop policy if exists "Users can update own widget config" on public.widget_configs;
create policy "Users can update own widget config"
on public.widget_configs
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

-- Public visitors only need to READ the appearance/status of a widget.
drop policy if exists "Public can read widget config" on public.widget_configs;
create policy "Public can read widget config"
on public.widget_configs
for select
to anon
using (true);

-- Seed existing companies with their already-saved V3.7 widget settings.
insert into public.widget_configs (
  company_id,
  enabled,
  welcome_message,
  accent_color,
  position
)
select
  c.id,
  coalesce(c.widget_status, 'Enabled') <> 'Disabled',
  coalesce(nullif(c.widget_welcome_message, ''), 'Hi! 👋 How can I help you today?'),
  '#22c55e',
  'Right'
from public.companies c
on conflict (company_id) do nothing;
