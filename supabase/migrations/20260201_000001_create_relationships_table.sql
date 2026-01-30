-- Migration: create relationships table
-- depends: none

create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  novel_id uuid not null references public.novels(id) on delete cascade,
  sourceId uuid not null references public.characters(id) on delete cascade,
  targetId uuid not null references public.characters(id) on delete cascade,
  sourceToTargetLabel text not null,
  targetToSourceLabel text not null,
  note text,
  user_id uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- trigger to update updated_at column
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_timestamp on public.relationships;
create trigger set_timestamp
before update on public.relationships
for each row execute procedure public.set_updated_at();

-- RLS (optional): enable and allow owner or novel owners
alter table public.relationships enable row level security;

-- Allow owners to read/write
create policy "Relationships owner access" on public.relationships
  for all using (auth.uid() = user_id);

