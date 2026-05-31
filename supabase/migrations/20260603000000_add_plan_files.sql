-- Plan files：小说级规划文档（Plan 模式左侧手风琴）
-- 与 outlines / worldbook 同级，按 novel_id 隔离。

CREATE TABLE IF NOT EXISTS public.plan_files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  novel_id uuid NOT NULL,
  path text NOT NULL,
  name text NOT NULL,
  content text NOT NULL DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at timestamp with time zone,
  CONSTRAINT plan_files_pkey PRIMARY KEY (id),
  CONSTRAINT plan_files_novel_id_fkey FOREIGN KEY (novel_id)
    REFERENCES public.novels(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS plan_files_novel_path_unique_idx
  ON public.plan_files(novel_id, path) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS plan_files_novel_id_idx
  ON public.plan_files(novel_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS plan_files_user_id_idx
  ON public.plan_files(user_id);

COMMENT ON TABLE public.plan_files IS
  'Plan 模式规划文件。path 为小说内唯一 slug（不含 plan/ 前缀）。';

CREATE OR REPLACE FUNCTION public.touch_plan_files_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS plan_files_touch_updated_at ON public.plan_files;
CREATE TRIGGER plan_files_touch_updated_at
  BEFORE UPDATE ON public.plan_files
  FOR EACH ROW EXECUTE FUNCTION public.touch_plan_files_updated_at();

ALTER TABLE public.plan_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS plan_files_owner ON public.plan_files;
CREATE POLICY plan_files_owner ON public.plan_files
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
