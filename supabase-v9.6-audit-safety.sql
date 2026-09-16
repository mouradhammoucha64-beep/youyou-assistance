-- Apply before deploying the audit-safety release. No customer records deleted.
begin;
alter table public.landing_pages add column if not exists draft_content jsonb;
alter table public.landing_pages add column if not exists publication_revision uuid;
update public.landing_pages set draft_content = content where draft_content is null;
-- Refuse ambiguous legacy live prices. Republish pending edits intentionally first.
do $$ begin
  if exists (select 1 from public.landing_pages where status='published'
    and content->>'hasUnpublishedChanges'='true') then
    raise exception 'Republish or unpublish pages with pending edits before this migration. No changes applied.';
  end if;
end $$;
create or replace function public.freeze_landing_offer()
returns trigger language plpgsql set search_path=public as $$
begin
  if new.status='published' and old.status='published'
     and new.publication_revision is not distinct from old.publication_revision
     and new.html_snapshot is not distinct from old.html_snapshot
     and new.content is distinct from old.content then
    new.draft_content := new.content;
    new.content := old.content;
  end if;
  return new;
end $$;
drop trigger if exists freeze_landing_offer_trigger on public.landing_pages;
create trigger freeze_landing_offer_trigger before update on public.landing_pages
for each row execute function public.freeze_landing_offer();
create table if not exists public.seo_audit_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_start timestamptz not null, requests integer not null
);
alter table public.seo_audit_usage enable row level security;
revoke all on public.seo_audit_usage from public, anon, authenticated;
create or replace function public.consume_seo_audit()
returns boolean language plpgsql security definer set search_path=public as $$
declare n integer; begin
  if auth.uid() is null then return false; end if;
  insert into public.seo_audit_usage values(auth.uid(), now(), 1)
  on conflict(user_id) do update set
    requests=case when seo_audit_usage.window_start < now()-interval '1 minute' then 1 else seo_audit_usage.requests+1 end,
    window_start=case when seo_audit_usage.window_start < now()-interval '1 minute' then now() else seo_audit_usage.window_start end
  returning requests into n;
  return n <= 5;
end $$;
revoke all on function public.consume_seo_audit() from public, anon;
grant execute on function public.consume_seo_audit() to authenticated;
notify pgrst, 'reload schema';
commit;
