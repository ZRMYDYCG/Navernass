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
-- =====================================================

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.chapters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  novel_id uuid NOT NULL,
  user_id uuid DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text DEFAULT ''::text,
  order_index integer NOT NULL,
  word_count integer DEFAULT 0,
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'published'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT chapters_pkey PRIMARY KEY (id),
  CONSTRAINT chapters_novel_id_fkey FOREIGN KEY (novel_id) REFERENCES public.novels(id)
);
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  title text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  is_pinned boolean DEFAULT false,
  pinned_at timestamp with time zone,
  CONSTRAINT conversations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  user_id uuid DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text])),
  content text NOT NULL,
  model text,
  tokens integer,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  thinking text,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id)
);
CREATE TABLE public.news (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type = ANY (ARRAY['feature'::text, 'update'::text, 'announcement'::text, 'community'::text])),
  title text NOT NULL,
  content text NOT NULL,
  image text,
  link text,
  author text,
  status text DEFAULT 'published'::text CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])),
  priority integer DEFAULT 0,
  read_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT news_pkey PRIMARY KEY (id)
);
CREATE TABLE public.novels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  cover text,
  category text,
  tags ARRAY DEFAULT '{}'::text[],
  word_count integer DEFAULT 0,
  chapter_count integer DEFAULT 0,
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  published_at timestamp with time zone,
  CONSTRAINT novels_pkey PRIMARY KEY (id)
);

-- =====================================================
-- 完成！
-- =====================================================
-- 数据库初始化完成
-- 现在可以开始使用 Narraverse 了！

