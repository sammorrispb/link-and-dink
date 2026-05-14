-- 0001_accounts.sql
-- Account = a login identity (email or phone). May or may not yet be claimed by
-- a Supabase auth user (seed data and managed accounts can exist unclaimed).

create extension if not exists "pgcrypto";

-- Shared updated_at trigger used by every table with an updated_at column.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  -- Bridge to Supabase auth. Nullable so seed/managed accounts can exist before
  -- a real login claims them. (Not in the original Phase 1 spec — added so RLS
  -- can resolve auth.uid() -> account. See PHASE_1_COMPLETE.md.)
  auth_user_id uuid unique references auth.users(id) on delete set null,
  email text unique,
  phone text unique,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index accounts_auth_user_id_idx on public.accounts(auth_user_id);

create trigger accounts_set_updated_at
  before update on public.accounts
  for each row execute function public.set_updated_at();

-- Resolves the current auth user to their account row. Used throughout RLS.
create or replace function public.current_account_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.accounts where auth_user_id = auth.uid();
$$;
