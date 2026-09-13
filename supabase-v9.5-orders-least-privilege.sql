-- YOUYOU V9.5: remove unnecessary client privileges found in the hosted audit.
-- Run in Supabase SQL Editor. No business records are changed.
-- Atomic and repeatable. Existing RLS policies and server-role grants stay in place.
begin;

revoke all privileges on table public.stripe_orders, public.profiles, public.companies
  from public, anon, authenticated;
grant select on table public.stripe_orders, public.profiles to authenticated;
grant select, update on table public.companies to authenticated;

-- Fulfilment remains accessible only through the tenant-scoped function.
revoke execute on function public.update_stripe_order_status(uuid,text) from public, anon;
grant execute on function public.update_stripe_order_status(uuid,text) to authenticated, service_role;

-- Check effective privileges, including inherited grants. Abort all changes on failure.
do $$
declare
  t text;
  r text;
  permission text;
begin
  foreach t in array array['stripe_orders','profiles','companies'] loop
    if not (select relrowsecurity from pg_class where oid = format('public.%I',t)::regclass) then
      raise exception 'RLS is disabled on %; changes rolled back', t;
    end if;
    foreach r in array array['anon','authenticated'] loop
      foreach permission in array array['TRUNCATE','REFERENCES','TRIGGER','INSERT','DELETE'] loop
        if has_table_privilege(r, format('public.%I',t), permission) then
          raise exception 'Unexpected % privilege for % on %; changes rolled back', permission,r,t;
        end if;
      end loop;
      if r = 'anon' and (has_any_column_privilege(r,format('public.%I',t),'SELECT')
        or has_any_column_privilege(r,format('public.%I',t),'UPDATE')
        or has_any_column_privilege(r,format('public.%I',t),'INSERT')) then
        raise exception 'Anonymous column access remains on %; changes rolled back',t;
      end if;
      if r = 'authenticated' and t in ('stripe_orders','profiles') and
        (has_any_column_privilege(r,format('public.%I',t),'UPDATE')
        or has_any_column_privilege(r,format('public.%I',t),'INSERT')) then
        raise exception 'Direct client writes remain on %; changes rolled back',t;
      end if;
    end loop;
    if not has_table_privilege('authenticated',format('public.%I',t),'SELECT') then
      raise exception 'Required SELECT privilege is missing on %',t;
    end if;
  end loop;
  if not has_table_privilege('authenticated','public.companies','UPDATE') then
    raise exception 'Company settings UPDATE privilege is missing';
  end if;
  if has_function_privilege('anon','public.update_stripe_order_status(uuid,text)','EXECUTE')
    or not has_function_privilege('authenticated','public.update_stripe_order_status(uuid,text)','EXECUTE') then
    raise exception 'Unexpected fulfilment function permissions';
  end if;
end $$;

notify pgrst, 'reload schema';
commit;
select 'Client privileges restricted successfully' as result;
