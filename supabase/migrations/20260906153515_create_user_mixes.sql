create table public.mixes (
  id text not null check (char_length(id) between 8 and 100 and id like 'preset-%'),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  description text check (description is null or char_length(description) <= 280),
  icon text check (icon is null or char_length(icon) <= 16),
  tracks jsonb not null check (
    jsonb_typeof(tracks) = 'object'
    and tracks <> '{}'::jsonb
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.mixes enable row level security;

revoke all on table public.mixes from anon;
grant select, insert, update, delete on table public.mixes to authenticated;

create policy "Users can read their own mixes"
on public.mixes
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own mixes"
on public.mixes
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own mixes"
on public.mixes
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own mixes"
on public.mixes
for delete
to authenticated
using ((select auth.uid()) = user_id);

create function public.set_mixes_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_mixes_updated_at() from public;

create trigger set_mixes_updated_at
before update on public.mixes
for each row execute function public.set_mixes_updated_at();
