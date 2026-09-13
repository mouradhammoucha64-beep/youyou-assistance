-- Run once in the YOUYOU Supabase SQL Editor. Safe to run again.
-- Historical partial refunds remain unknown until their Stripe event is replayed.
begin;
alter table public.stripe_orders add column if not exists amount_refunded bigint;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'stripe_orders_refund_amount_check'
    and conrelid = 'public.stripe_orders'::regclass) then
    alter table public.stripe_orders add constraint stripe_orders_refund_amount_check
      check (amount_refunded is null or (amount_refunded >= 0 and amount_refunded <= amount_total));
  end if;
end $$;
update public.stripe_orders set amount_refunded = amount_total
where status = 'refunded' and amount_refunded is null;
notify pgrst, 'reload schema';
commit;
