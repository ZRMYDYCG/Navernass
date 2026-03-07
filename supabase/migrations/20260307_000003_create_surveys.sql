-- Create surveys table
create table if not exists public.surveys (
  id uuid not null default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  experience text not null,
  genres text[] not null default '{}',
  pain_points text[] not null default '{}',
  tools text[] not null default '{}',
  ai_expectations text[] not null default '{}',
  ai_concerns text,
  contact text,
  created_at timestamptz not null default now(),
  
  constraint surveys_pkey primary key (id)
);

-- Set up Row Level Security (RLS)
alter table public.surveys enable row level security;

-- Allow anyone to insert surveys (since it's a public survey)
create policy "Allow public insert access"
  on public.surveys for insert
  with check (true);

-- Allow users to view their own surveys
create policy "Allow users to view their own surveys"
  on public.surveys for select
  using (auth.uid() = user_id);

-- Grant access to authenticated and anon users
grant insert on public.surveys to anon, authenticated;
grant select on public.surveys to authenticated;
