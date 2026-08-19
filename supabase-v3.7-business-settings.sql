-- YOUYOU V3.7 — Professional Business Settings
-- Run once in Supabase SQL Editor.

alter table public.companies
  add column if not exists industry text,
  add column if not exists website_url text,
  add column if not exists country text default 'United States',
  add column if not exists business_description text,
  add column if not exists business_email text,
  add column if not exists business_phone text,
  add column if not exists whatsapp_number text,
  add column if not exists city text,
  add column if not exists business_address text,
  add column if not exists timezone text default 'America/New_York',
  add column if not exists widget_status text default 'Enabled',
  add column if not exists business_hours text,
  add column if not exists widget_welcome_message text,
  add column if not exists notification_email text,
  add column if not exists lead_alert_mode text default 'Hot leads only',
  add column if not exists updated_at timestamptz default now();

-- Safe defaults for existing workspaces.
update public.companies
set
  country = coalesce(nullif(country, ''), 'United States'),
  timezone = coalesce(nullif(timezone, ''), 'America/New_York'),
  widget_status = coalesce(nullif(widget_status, ''), 'Enabled'),
  lead_alert_mode = coalesce(nullif(lead_alert_mode, ''), 'Hot leads only'),
  updated_at = coalesce(updated_at, now())
where true;
