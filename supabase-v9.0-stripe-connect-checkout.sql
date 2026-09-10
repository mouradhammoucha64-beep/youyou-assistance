-- YOUYOU V9.0 — Stripe Connect checkout and verified orders
-- Run once in Supabase SQL Editor before testing dynamic Stripe checkout.

alter table public.companies
  add column if not exists stripe_account_id text,
  add column if not exists stripe_connect_status text not null default 'not_connected',
  add column if not exists stripe_charges_enabled boolean not null default false,
  add column if not exists stripe_payouts_enabled boolean not null default false;

create unique index if not exists companies_stripe_account_uidx
  on public.companies(stripe_account_id)
  where stripe_account_id is not null;

create table if not exists public.stripe_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  landing_page_id uuid references public.landing_pages(id) on delete set null,
  connected_account_id text not null,
  checkout_session_id text not null unique,
  payment_intent_id text,
  status text not null default 'processing' check (status in ('processing','paid','failed','refunded','partially_refunded')),
  amount_total bigint not null default 0,
  currency text not null default 'USD',
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_city text,
  customer_address text,
  quantity integer not null default 1,
  color text,
  bundle text,
  options jsonb not null default '{}'::jsonb,
  customer_message text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stripe_orders_company_created_idx
  on public.stripe_orders(company_id, created_at desc);

alter table public.stripe_orders enable row level security;

drop policy if exists "Company members can view Stripe orders" on public.stripe_orders;
create policy "Company members can view Stripe orders"
on public.stripe_orders for select to authenticated
using (
  company_id in (
    select p.company_id from public.profiles p where p.id = auth.uid()
  )
);

revoke all on table public.stripe_orders from anon;
grant select on table public.stripe_orders to authenticated;

create or replace function public.get_stripe_checkout_offer(p_slug text)
returns table (
  page_id uuid,
  company_id uuid,
  page_name text,
  offer jsonb,
  stripe_account_id text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    lp.id,
    lp.company_id,
    lp.name,
    jsonb_build_object(
      'name', lp.content->>'name',
      'price', lp.content->>'price',
      'currency', lp.content->>'currency',
      'ctaAction', lp.content->>'ctaAction',
      'commerceMode', lp.content->>'commerceMode',
      'quantityMin', lp.content->>'quantityMin',
      'quantityMax', lp.content->>'quantityMax',
      'productColors', lp.content->>'productColors',
      'sizeEnabled', lp.content->>'sizeEnabled',
      'sizeOptions', lp.content->>'sizeOptions',
      'weightEnabled', lp.content->>'weightEnabled',
      'weightOptions', lp.content->>'weightOptions',
      'volumeEnabled', lp.content->>'volumeEnabled',
      'volumeOptions', lp.content->>'volumeOptions',
      'unitsEnabled', lp.content->>'unitsEnabled',
      'unitsOptions', lp.content->>'unitsOptions',
      'customOptionEnabled', lp.content->>'customOptionEnabled',
      'customOptionName', lp.content->>'customOptionName',
      'customOptionValues', lp.content->>'customOptionValues',
      'bundleEnabled', lp.content->>'bundleEnabled',
      'bundleOptions', lp.content->>'bundleOptions'
    ),
    c.stripe_account_id
  from public.landing_pages lp
  join public.companies c on c.id = lp.company_id
  where lp.slug = lower(trim(p_slug))
    and lp.status = 'published'
    and coalesce(lp.content->>'priceMode', 'show') = 'show'
    and coalesce(lp.content->>'commerceEnabled', 'off') = 'on'
  limit 1;
$$;

revoke all on function public.get_stripe_checkout_offer(text) from public;
grant execute on function public.get_stripe_checkout_offer(text) to anon;
grant execute on function public.get_stripe_checkout_offer(text) to authenticated;

