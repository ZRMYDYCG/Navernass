-- Worldbook (世界观) + Outlines (大纲) 模块
-- 与 chapters / characters / volumes 同级，由小说 (novel_id) 拥有。
-- 字段设计参考 NovelAI / SillyTavern 的 lorebook 形式：每条都是独立设定卡，
-- 包括 title + content + 可选 keywords（未来用作章节内容自动触发）。

-- =========================================================================
-- 1. worldbook_entries：世界观条目
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.worldbook_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  novel_id uuid NOT NULL,
  category text NOT NULL DEFAULT 'other',
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  keywords text[] DEFAULT '{}'::text[],
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at timestamp with time zone,
  CONSTRAINT worldbook_entries_pkey PRIMARY KEY (id),
  CONSTRAINT worldbook_entries_novel_id_fkey FOREIGN KEY (novel_id)
    REFERENCES public.novels(id) ON DELETE CASCADE,
  CONSTRAINT worldbook_entries_category_check CHECK (
    category IN ('setting', 'location', 'item', 'faction', 'event', 'rule', 'character_lore', 'other')
  )
);

CREATE INDEX IF NOT EXISTS worldbook_entries_novel_id_idx
  ON public.worldbook_entries(novel_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS worldbook_entries_user_id_idx
  ON public.worldbook_entries(user_id);

COMMENT ON TABLE public.worldbook_entries IS
  '世界观条目（lorebook）。每个 entry 是独立的设定卡片。AI agent 续写时会查询并参考。';
COMMENT ON COLUMN public.worldbook_entries.keywords IS
  '触发关键词；未来章节内容包含这些词时 AI 可自动加载该条目。';

-- 自动维护 updated_at
CREATE OR REPLACE FUNCTION public.touch_worldbook_entries_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS worldbook_entries_touch_updated_at ON public.worldbook_entries;
CREATE TRIGGER worldbook_entries_touch_updated_at
  BEFORE UPDATE ON public.worldbook_entries
  FOR EACH ROW EXECUTE FUNCTION public.touch_worldbook_entries_updated_at();

-- =========================================================================
-- 2. outlines：大纲（按卷或全书）
-- 树形结构：parent_id 自引用，可做"卷大纲 → 章节大纲 → 场景大纲"层级
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.outlines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  novel_id uuid NOT NULL,
  volume_id uuid,
  parent_id uuid,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at timestamp with time zone,
  CONSTRAINT outlines_pkey PRIMARY KEY (id),
  CONSTRAINT outlines_novel_id_fkey FOREIGN KEY (novel_id)
    REFERENCES public.novels(id) ON DELETE CASCADE,
  CONSTRAINT outlines_volume_id_fkey FOREIGN KEY (volume_id)
    REFERENCES public.volumes(id) ON DELETE SET NULL,
  CONSTRAINT outlines_parent_id_fkey FOREIGN KEY (parent_id)
    REFERENCES public.outlines(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS outlines_novel_id_idx
  ON public.outlines(novel_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS outlines_volume_id_idx
  ON public.outlines(volume_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS outlines_parent_id_idx
  ON public.outlines(parent_id);

COMMENT ON TABLE public.outlines IS
  '大纲节点。可挂在卷下（volume_id）或父大纲下（parent_id），形成树。';

DROP TRIGGER IF EXISTS outlines_touch_updated_at ON public.outlines;
CREATE OR REPLACE FUNCTION public.touch_outlines_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END $$;
CREATE TRIGGER outlines_touch_updated_at
  BEFORE UPDATE ON public.outlines
  FOR EACH ROW EXECUTE FUNCTION public.touch_outlines_updated_at();

-- =========================================================================
-- 3. RLS：用户只能看到/操作自己的条目
-- =========================================================================
ALTER TABLE public.worldbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outlines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS worldbook_entries_owner ON public.worldbook_entries;
CREATE POLICY worldbook_entries_owner ON public.worldbook_entries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS outlines_owner ON public.outlines;
CREATE POLICY outlines_owner ON public.outlines
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
