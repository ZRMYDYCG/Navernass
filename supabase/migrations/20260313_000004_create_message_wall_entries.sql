create table if not exists public.message_wall_entries (
  id uuid primary key default gen_random_uuid(),
  nickname text,
  message text not null check (char_length(trim(message)) > 0 and char_length(message) <= 180),
  created_at timestamptz not null default now()
);

alter table public.message_wall_entries enable row level security;

create policy "Public can read message wall"
  on public.message_wall_entries
  for select
  using (true);

create policy "Public can insert message wall"
  on public.message_wall_entries
  for insert
  with check (
    char_length(trim(coalesce(message, ''))) > 0
    and char_length(message) <= 180
    and (nickname is null or char_length(nickname) <= 24)
  );

grant select, insert on public.message_wall_entries to anon, authenticated;

create index if not exists message_wall_entries_created_at_idx
  on public.message_wall_entries (created_at desc);

alter publication supabase_realtime add table public.message_wall_entries;
