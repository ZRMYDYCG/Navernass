-- =====================================================
-- 产品动态表 (news)
-- =====================================================
-- 用于存储产品更新、公告、社区动态等信息

create table if not exists news (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('feature', 'update', 'announcement', 'community')),
  title text not null,
  content text not null,
  image text,
  link text,
  author text,
  status text default 'published' check (status in ('draft', 'published', 'archived')),
  priority integer default 0,
  read_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建索引
create index if not exists news_type_idx on news(type);
create index if not exists news_status_idx on news(status);
create index if not exists news_created_at_idx on news(created_at desc);
create index if not exists news_priority_idx on news(priority desc);

-- 添加注释
comment on table news is '产品动态表';
comment on column news.type is '动态类型: feature(新功能), update(更新), announcement(公告), community(社区)';
comment on column news.priority is '优先级，数字越大越靠前';

-- 为 news 表添加触发器
drop trigger if exists update_news_updated_at on news;
create trigger update_news_updated_at
  before update on news
  for each row
  execute function update_updated_at_column();

-- =====================================================
-- 完成！
-- =====================================================
