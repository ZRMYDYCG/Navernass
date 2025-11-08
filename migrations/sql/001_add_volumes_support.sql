-- =====================================================
-- 添加卷（Volume）支持
-- =====================================================
-- 为小说添加卷的概念，支持两种结构：
-- 1. 小说 -> 章节（原有的）
-- 2. 小说 -> 卷 -> 章节（新增的）
-- =====================================================

-- 创建 volumes 表
CREATE TABLE IF NOT EXISTS public.volumes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  novel_id uuid NOT NULL,
  user_id uuid DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  order_index integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT volumes_pkey PRIMARY KEY (id),
  CONSTRAINT volumes_novel_id_fkey FOREIGN KEY (novel_id) REFERENCES public.novels(id) ON DELETE CASCADE
);

-- 为 chapters 表添加 volume_id 字段（可为空，允许章节直接属于小说）
ALTER TABLE public.chapters 
ADD COLUMN IF NOT EXISTS volume_id uuid,
ADD CONSTRAINT chapters_volume_id_fkey FOREIGN KEY (volume_id) REFERENCES public.volumes(id) ON DELETE SET NULL;

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_volumes_novel_id ON public.volumes(novel_id);
CREATE INDEX IF NOT EXISTS idx_volumes_order ON public.volumes(novel_id, order_index);
CREATE INDEX IF NOT EXISTS idx_chapters_volume_id ON public.chapters(volume_id);
CREATE INDEX IF NOT EXISTS idx_chapters_novel_volume ON public.chapters(novel_id, volume_id);

-- 添加注释
COMMENT ON TABLE public.volumes IS '小说的卷/分卷表';
COMMENT ON COLUMN public.volumes.title IS '卷的标题，如"第一卷"、"上部"等';
COMMENT ON COLUMN public.volumes.description IS '卷的描述或简介';
COMMENT ON COLUMN public.volumes.order_index IS '卷的排序索引';
COMMENT ON COLUMN public.chapters.volume_id IS '所属卷ID，为空表示章节直接属于小说';

-- =====================================================
-- 迁移完成
-- =====================================================

