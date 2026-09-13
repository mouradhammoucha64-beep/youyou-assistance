-- Run the ENTIRE script in Supabase SQL Editor using its postgres role.
-- Uses two existing companies with orders. No credentials or customer data are returned.
-- All database changes, including any unexpected RPC write, are rolled back.
begin;

do $$
declare
  actor public.profiles%rowtype;
  target public.stripe_orders%rowtype;
begin
  select p.* into actor from public.profiles p
  where p.company_id is not null
    and exists (select 1 from public.stripe_orders o where o.company_id=p.company_id)
    and exists (select 1 from public.stripe_orders o where o.company_id<>p.company_id)
  order by p.id limit 1;
  if actor.id is null then
    raise exception 'Test needs two different companies with existing orders. No changes applied.';
  end if;
  select o.* into target from public.stripe_orders o
  where o.company_id<>actor.company_id order by o.id limit 1;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',actor.id,'role','authenticated')::text,true);
  perform set_config('request.jwt.claim.sub',actor.id::text,true);
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('youyou_test.actor',actor.id::text,true);
  perform set_config('youyou_test.company',actor.company_id::text,true);
  perform set_config('youyou_test.foreign_order',target.id::text,true);
  perform set_config('youyou_test.foreign_status',target.order_status,true);
end $$;

set local role authenticated;

do $$
declare
  own_company uuid := current_setting('youyou_test.company')::uuid;
  foreign_order uuid := current_setting('youyou_test.foreign_order')::uuid;
  changed boolean;
begin
  if current_user <> 'authenticated' or auth.uid() is distinct from current_setting('youyou_test.actor')::uuid then
    raise exception 'FAIL: authenticated test context was not established';
  end if;
  if not exists(select 1 from public.stripe_orders where company_id=own_company) then
    raise exception 'FAIL: the merchant cannot read its own orders';
  end if;
  if exists(select 1 from public.stripe_orders where company_id<>own_company)
    or exists(select 1 from public.stripe_orders where id=foreign_order) then
    raise exception 'FAIL: another company order is readable';
  end if;
  if has_any_column_privilege(current_user,'public.profiles','UPDATE')
    or has_any_column_privilege(current_user,'public.stripe_orders','UPDATE') then
    raise exception 'FAIL: unexpected direct profile/order write privilege';
  end if;
  -- Same status minimizes impact even if a faulty function incorrectly accepts it.
  changed := public.update_stripe_order_status(foreign_order,current_setting('youyou_test.foreign_status'));
  if changed is distinct from false then
    raise exception 'FAIL: fulfilment function accepted another company order';
  end if;
end $$;

rollback;
select 'PASS: own orders readable; other-company orders hidden; cross-company fulfilment rejected; test rolled back' as result;
