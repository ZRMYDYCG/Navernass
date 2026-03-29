alter table public.novels enable row level security;
alter table public.chapters enable row level security;
alter table public.volumes enable row level security;

drop policy if exists "Public can read published novels" on public.novels;
create policy "Public can read published novels"
  on public.novels
  for select
  using (
    status = 'published'
    and published_at is not null
  );

drop policy if exists "Public can read published chapters" on public.chapters;
create policy "Public can read published chapters"
  on public.chapters
  for select
  using (
    status = 'published'
    and deleted_at is null
    and exists (
      select 1
      from public.novels
      where novels.id = chapters.novel_id
        and novels.status = 'published'
        and novels.published_at is not null
    )
  );

drop policy if exists "Public can read published volumes" on public.volumes;
create policy "Public can read published volumes"
  on public.volumes
  for select
  using (
    deleted_at is null
    and exists (
      select 1
      from public.novels
      where novels.id = volumes.novel_id
        and novels.status = 'published'
        and novels.published_at is not null
    )
  );

grant select on public.novels to anon, authenticated;
grant select on public.chapters to anon, authenticated;
grant select on public.volumes to anon, authenticated;
