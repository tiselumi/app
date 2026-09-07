alter table public.mixes
add column deleted_at timestamptz;

comment on column public.mixes.deleted_at is
'Timestamp marking when a mix was removed from the user''s saved soundscapes.';

drop policy if exists "Users can delete their own mixes" on public.mixes;
revoke delete on table public.mixes from authenticated;
