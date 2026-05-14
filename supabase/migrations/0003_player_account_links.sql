-- 0003_player_account_links.sql
-- Many-to-many between accounts (logins) and players (playing identities).
-- One account can manage several players (parent + kids); one player can be
-- claimed by several accounts (transfers).

create table public.player_account_links (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  link_type text not null check (link_type in ('primary', 'managed', 'verified')),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (account_id, player_id)
);

create index player_account_links_account_idx on public.player_account_links(account_id);
create index player_account_links_player_idx on public.player_account_links(player_id);
