-- Create writer_todos table
create table if not exists writer_todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  completed boolean default false,
  priority text default 'medium', -- low, medium, high
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table writer_todos enable row level security;

-- Policies
create policy "Users can view their own todos" 
  on writer_todos for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own todos" 
  on writer_todos for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own todos" 
  on writer_todos for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own todos" 
  on writer_todos for delete 
  using (auth.uid() = user_id);

-- Create index for faster querying by user_id
create index writer_todos_user_id_idx on writer_todos(user_id);
