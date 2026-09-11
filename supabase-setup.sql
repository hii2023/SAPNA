-- ============================================================
-- Sapna's Art Studio: Supabase backend
-- Run ONCE in the Supabase SQL editor of the shared project
-- (xoiksbtxoxrifkgvupqp, the same project as Rumaliwala/CatCare).
--
-- Model: one public-read content table + a locked-down passcode
-- table. All writes go through passcode-checked SECURITY DEFINER
-- RPCs, so the browser never needs write access.
-- ============================================================

-- ---- Content table (products / gallery / profile) ---------
create table if not exists public.sapna_content (
  key        text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.sapna_content enable row level security;

-- Public (anon) may READ published content, nothing else.
drop policy if exists sapna_content_public_read on public.sapna_content;
create policy sapna_content_public_read
  on public.sapna_content for select
  to anon, authenticated
  using (true);

-- ---- Admin passcode table (never readable by the browser) --
create table if not exists public.sapna_admin (
  id       int primary key default 1,
  passcode text not null
);

alter table public.sapna_admin enable row level security;
-- No policies => anon/authenticated cannot read or write this table.
-- Only the SECURITY DEFINER functions below can touch it.

insert into public.sapna_admin (id, passcode)
values (1, 'sapna@2026')
on conflict (id) do nothing;

-- ---- RPC: verify passcode (used for admin login) -----------
create or replace function public.sapna_check_pass(p_passcode text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.sapna_admin where id = 1 and passcode = p_passcode
  );
$$;

-- ---- RPC: save a content section (products/gallery/profile)
create or replace function public.sapna_save_content(
  p_passcode text,
  p_key      text,
  p_data     jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.sapna_admin where id = 1 and passcode = p_passcode) then
    raise exception 'unauthorized';
  end if;

  if p_key not in ('products', 'gallery', 'profile', 'projects', 'siteImages') then
    raise exception 'invalid key';
  end if;

  insert into public.sapna_content (key, data, updated_at)
  values (p_key, p_data, now())
  on conflict (key) do update
    set data = excluded.data, updated_at = now();
end;
$$;

-- ---- RPC: change the admin passcode ------------------------
create or replace function public.sapna_set_pass(
  p_passcode text,
  p_new      text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.sapna_admin where id = 1 and passcode = p_passcode) then
    raise exception 'unauthorized';
  end if;
  if length(p_new) < 6 then
    raise exception 'passcode too short';
  end if;
  update public.sapna_admin set passcode = p_new where id = 1;
end;
$$;

-- ---- Let the browser (anon) call these RPCs ----------------
grant execute on function public.sapna_check_pass(text)              to anon, authenticated;
grant execute on function public.sapna_save_content(text, text, jsonb) to anon, authenticated;
grant execute on function public.sapna_set_pass(text, text)          to anon, authenticated;

-- Done. Login passcode is: sapna@2026  (change it in Settings after first login)
