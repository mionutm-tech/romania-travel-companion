-- Soft-delete / disable flag for users managed from the admin panel.
alter table public.users
  add column if not exists disabled_at timestamptz;

create index if not exists users_disabled_at_idx
  on public.users (disabled_at)
  where disabled_at is null;
