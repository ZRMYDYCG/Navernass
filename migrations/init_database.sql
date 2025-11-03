-- =====================================================
-- Narraverse 数据库初始化脚本（无认证版本）
-- =====================================================
-- 适用于自部署的 MVP 版本，不需要用户认证
-- 
-- 使用方法：
-- 方法 1 - Supabase Dashboard（推荐）：
--   1. 登录 Supabase Dashboard (https://app.supabase.com)
--   2. 进入 SQL Editor
--   3. 复制此文件内容并执行
-- 
-- 方法 2 - Supabase CLI：
--   1. 安装 Supabase CLI: npm install -g supabase
--   2. 登录: supabase login
--   3. 关联项目: supabase link --project-ref your-project-id
--   4. 推送: supabase db push
-- 
-- 更多信息请查看: docs/DATABASE_MIGRATION.md
-- =====================================================

-- =====================================================
-- 1. 小说表 (novels)
-- =====================================================
create table if not exists novels (
  id uuid default gen_random_uuid() primary key,
  user_id uuid default gen_random_uuid(), -- 自动生成，用于未来扩展
  title text not null,
  description text,
  cover text,
  category text,
  tags text[] default '{}',
  word_count integer default 0,
  chapter_count integer default 0,
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  published_at timestamp with time zone
);

-- 创建索引以提高查询性能
create index if not exists novels_status_idx on novels(status);
create index if not exists novels_created_at_idx on novels(created_at desc);
create index if not exists novels_updated_at_idx on novels(updated_at desc);

-- 添加注释
comment on table novels is '小说表';
comment on column novels.id is '小说ID';
comment on column novels.title is '小说标题';
comment on column novels.status is '状态: draft(草稿), published(已发布), archived(已归档)';

-- =====================================================
-- 2. 章节表 (chapters)
-- =====================================================
create table if not exists chapters (
  id uuid default gen_random_uuid() primary key,
  novel_id uuid references novels(id) on delete cascade not null,
  user_id uuid default gen_random_uuid(),
  title text not null,
  content text default '',
  order_index integer not null,
  word_count integer default 0,
  status text default 'draft' check (status in ('draft', 'published')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建索引
create index if not exists chapters_novel_id_idx on chapters(novel_id);
create index if not exists chapters_order_idx on chapters(novel_id, order_index);

-- 添加注释
comment on table chapters is '章节表';
comment on column chapters.novel_id is '所属小说ID';
comment on column chapters.order_index is '章节排序序号';

-- =====================================================
-- 3. 对话表 (conversations)
-- =====================================================
create table if not exists conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid default gen_random_uuid(),
  title text not null,
  novel_id uuid references novels(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建索引
create index if not exists conversations_novel_id_idx on conversations(novel_id);
create index if not exists conversations_created_at_idx on conversations(created_at desc);

-- 添加注释
comment on table conversations is 'AI对话表';
comment on column conversations.novel_id is '关联的小说ID（可选）';

-- =====================================================
-- 4. 消息表 (messages)
-- =====================================================
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  user_id uuid default gen_random_uuid(),
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  model text,
  tokens integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建索引
create index if not exists messages_conversation_id_idx on messages(conversation_id);
create index if not exists messages_created_at_idx on messages(created_at);

-- 添加注释
comment on table messages is 'AI对话消息表';
comment on column messages.role is '角色: user(用户), assistant(AI), system(系统)';
comment on column messages.model is 'AI模型名称';
comment on column messages.tokens is '使用的token数量';

-- =====================================================
-- 5. 自动更新 updated_at 触发器
-- =====================================================

-- 创建更新时间戳函数
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- 为 novels 表添加触发器
drop trigger if exists update_novels_updated_at on novels;
create trigger update_novels_updated_at
  before update on novels
  for each row
  execute function update_updated_at_column();

-- 为 chapters 表添加触发器
drop trigger if exists update_chapters_updated_at on chapters;
create trigger update_chapters_updated_at
  before update on chapters
  for each row
  execute function update_updated_at_column();

-- 为 conversations 表添加触发器
drop trigger if exists update_conversations_updated_at on conversations;
create trigger update_conversations_updated_at
  before update on conversations
  for each row
  execute function update_updated_at_column();

-- =====================================================
-- 6. 禁用 RLS（行级安全）
-- =====================================================
-- 因为是自部署版本，不需要用户认证和行级安全

alter table novels disable row level security;
alter table chapters disable row level security;
alter table conversations disable row level security;
alter table messages disable row level security;

-- =====================================================
-- 完成！
-- =====================================================
-- 数据库初始化完成
-- 现在可以开始使用 Narraverse 了！

