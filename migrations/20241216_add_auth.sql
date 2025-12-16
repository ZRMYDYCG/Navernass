-- =====================================================
-- Narraverse 认证系统迁移脚本
-- =====================================================
-- 添加 Supabase Auth 支持和用户系统
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

-- 创建 profiles 表（扩展 auth.users）
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  website text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 创建函数：自动创建用户 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器：当新用户注册时自动创建 profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.novel_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.novel_messages ENABLE ROW LEVEL SECURITY;

-- profiles 表 RLS 策略
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- user_settings 表 RLS 策略
CREATE POLICY "Users can view their own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid()::text = user_id);

-- novels 表 RLS 策略
CREATE POLICY "Users can view their own novels"
  ON public.novels FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own novels"
  ON public.novels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own novels"
  ON public.novels FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own novels"
  ON public.novels FOR DELETE
  USING (auth.uid() = user_id);

-- volumes 表 RLS 策略
CREATE POLICY "Users can view their own volumes"
  ON public.volumes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own volumes"
  ON public.volumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own volumes"
  ON public.volumes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own volumes"
  ON public.volumes FOR DELETE
  USING (auth.uid() = user_id);

-- chapters 表 RLS 策略
CREATE POLICY "Users can view their own chapters"
  ON public.chapters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chapters"
  ON public.chapters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chapters"
  ON public.chapters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chapters"
  ON public.chapters FOR DELETE
  USING (auth.uid() = user_id);

-- conversations 表 RLS 策略
CREATE POLICY "Users can view their own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.conversations FOR DELETE
  USING (auth.uid() = user_id);

-- messages 表 RLS 策略
CREATE POLICY "Users can view their own messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
  ON public.messages FOR DELETE
  USING (auth.uid() = user_id);

-- novel_conversations 表 RLS 策略
CREATE POLICY "Users can view their own novel conversations"
  ON public.novel_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own novel conversations"
  ON public.novel_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own novel conversations"
  ON public.novel_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own novel conversations"
  ON public.novel_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- novel_messages 表 RLS 策略
CREATE POLICY "Users can view their own novel messages"
  ON public.novel_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own novel messages"
  ON public.novel_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own novel messages"
  ON public.novel_messages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own novel messages"
  ON public.novel_messages FOR DELETE
  USING (auth.uid() = user_id);

-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 profiles 表添加自动更新时间戳
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
