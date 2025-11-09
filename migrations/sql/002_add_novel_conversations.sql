-- =====================================================
-- 添加小说 AI 会话支持
-- =====================================================
-- 为小说编辑器添加 AI 助手功能，支持多轮对话和会话管理
-- =====================================================

-- 创建 novel_conversations 表（小说会话表）
CREATE TABLE IF NOT EXISTS public.novel_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  novel_id uuid NOT NULL,
  user_id uuid DEFAULT gen_random_uuid(),
  title text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  is_pinned boolean DEFAULT false,
  pinned_at timestamp with time zone,
  CONSTRAINT novel_conversations_pkey PRIMARY KEY (id),
  CONSTRAINT novel_conversations_novel_id_fkey FOREIGN KEY (novel_id) REFERENCES public.novels(id) ON DELETE CASCADE
);

-- 创建 novel_messages 表（小说会话消息表）
CREATE TABLE IF NOT EXISTS public.novel_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  novel_id uuid NOT NULL,
  user_id uuid DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text])),
  content text NOT NULL,
  model text,
  tokens integer,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  thinking text,
  CONSTRAINT novel_messages_pkey PRIMARY KEY (id),
  CONSTRAINT novel_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.novel_conversations(id) ON DELETE CASCADE,
  CONSTRAINT novel_messages_novel_id_fkey FOREIGN KEY (novel_id) REFERENCES public.novels(id) ON DELETE CASCADE
);

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_novel_conversations_novel_id ON public.novel_conversations(novel_id);
CREATE INDEX IF NOT EXISTS idx_novel_conversations_updated_at ON public.novel_conversations(novel_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_novel_conversations_pinned ON public.novel_conversations(novel_id, is_pinned DESC, pinned_at DESC);
CREATE INDEX IF NOT EXISTS idx_novel_messages_conversation_id ON public.novel_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_novel_messages_novel_id ON public.novel_messages(novel_id);
CREATE INDEX IF NOT EXISTS idx_novel_messages_created_at ON public.novel_messages(conversation_id, created_at ASC);

-- 添加注释
COMMENT ON TABLE public.novel_conversations IS '小说 AI 会话表，每个会话关联到一部小说';
COMMENT ON COLUMN public.novel_conversations.novel_id IS '关联的小说ID';
COMMENT ON COLUMN public.novel_conversations.title IS '会话标题';
COMMENT ON COLUMN public.novel_conversations.is_pinned IS '是否置顶';
COMMENT ON COLUMN public.novel_conversations.pinned_at IS '置顶时间';

COMMENT ON TABLE public.novel_messages IS '小说 AI 会话消息表';
COMMENT ON COLUMN public.novel_messages.conversation_id IS '所属会话ID';
COMMENT ON COLUMN public.novel_messages.novel_id IS '关联的小说ID（冗余字段，便于查询）';
COMMENT ON COLUMN public.novel_messages.role IS '消息角色：user, assistant, system';
COMMENT ON COLUMN public.novel_messages.content IS '消息内容';
COMMENT ON COLUMN public.novel_messages.model IS '使用的AI模型';
COMMENT ON COLUMN public.novel_messages.tokens IS '消耗的token数量';

-- =====================================================
-- 迁移完成
-- =====================================================

