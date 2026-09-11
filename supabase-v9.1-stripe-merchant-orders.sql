-- YOUYOU V9.1 — Merchant Stripe onboarding + order fulfilment
-- Run once in Supabase SQL Editor after V9.0.

alter table public.stripe_orders
  add column if not exists product_name text,
  add column if not exists order_status text not null default 'new';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'stripe_orders_order_status_check'
      and conrelid = 'public.stripe_orders'::regclass
  ) then
    alter table public.stripe_orders
      add constraint stripe_orders_order_status_check
      check (order_status in ('new','confirmed','preparing','shipped','completed','cancelled'));
  end if;
end $$;

create or replace function public.protect_company_stripe_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') in ('anon','authenticated') then
    raise exception 'Stripe connection fields can only be updated by the secure server';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_company_stripe_fields_trigger on public.companies;
create trigger protect_company_stripe_fields_trigger
before update of stripe_account_id, stripe_connect_status, stripe_charges_enabled, stripe_payouts_enabled
on public.companies
for each row execute function public.protect_company_stripe_fields();

create or replace function public.update_stripe_order_status(p_order_id uuid, p_status text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_status not in ('new','confirmed','preparing','shipped','completed','cancelled') then
    raise exception 'Invalid order status';
  end if;

  update public.stripe_orders so
  set order_status = p_status,
      updated_at = now()
  where so.id = p_order_id
    and so.company_id in (
      select p.company_id from public.profiles p where p.id = auth.uid()
    );

  return found;
end;
$$;

revoke all on function public.update_stripe_order_status(uuid,text) from public;
grant execute on function public.update_stripe_order_status(uuid,text) to authenticated;

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
    case
      when c.stripe_connect_status = 'connected' and c.stripe_charges_enabled and c.stripe_payouts_enabled then c.stripe_account_id
      else null
    end
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
