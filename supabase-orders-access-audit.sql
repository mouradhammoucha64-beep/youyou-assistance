-- Read-only inspection. Does not change policies, records or permissions.
-- Run in Supabase SQL Editor and return the JSON result for review.
select jsonb_build_object(
  'rls', (select jsonb_agg(jsonb_build_object('table',c.relname,'enabled',c.relrowsecurity))
    from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relname in ('profiles','companies','stripe_orders')),
  'policies', (select jsonb_agg(jsonb_build_object('table',tablename,'name',policyname,
    'roles',roles,'command',cmd,'using',qual,'check',with_check))
    from pg_policies where schemaname='public' and tablename in ('profiles','companies','stripe_orders')),
  'grants', (select jsonb_agg(jsonb_build_object('table',table_name,'role',grantee,'privilege',privilege_type))
    from information_schema.role_table_grants where table_schema='public'
    and table_name in ('profiles','companies','stripe_orders') and grantee in ('anon','authenticated','PUBLIC')),
  'profile_triggers', (select jsonb_agg(jsonb_build_object('name',t.tgname,
    'trigger',pg_get_triggerdef(t.oid),'function',pg_get_functiondef(t.tgfoid)))
    from pg_trigger t where t.tgrelid='public.profiles'::regclass and not t.tgisinternal),
  'fulfilment_function', pg_get_functiondef('public.update_stripe_order_status(uuid,text)'::regprocedure)
) as orders_access_audit;
