-- Character timeline events: 角色个人时间线
-- 每个事件挂在某角色名下，可关联章节，按 timeline_position 排序。
-- 用于"角色剧本 Agent"为某角色规划成长线、关键事件。
--
-- 注意：本项目的角色当前存储在 novels.characters jsonb 数组中，没有独立的
-- character 表，所以 character_id 不能加 FK。我们只做应用层校验：
--   - service 层在写入前可选检查 novels.characters 数组中是否存在该 id
--   - 角色被删除时，对应事件的 character_id 会变成"孤儿"，定期清理或忽略即可

CREATE TABLE IF NOT EXISTS public.character_timeline_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  novel_id uuid NOT NULL,
  character_id uuid NOT NULL,
  chapter_id uuid,
  event_type text NOT NULL DEFAULT 'other',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  timeline_position integer NOT NULL DEFAULT 0,
  occurred_at_label text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at timestamp with time zone,
  CONSTRAINT character_timeline_events_pkey PRIMARY KEY (id),
  CONSTRAINT character_timeline_events_novel_id_fkey FOREIGN KEY (novel_id)
    REFERENCES public.novels(id) ON DELETE CASCADE,
  CONSTRAINT character_timeline_events_chapter_id_fkey FOREIGN KEY (chapter_id)
    REFERENCES public.chapters(id) ON DELETE SET NULL,
  CONSTRAINT character_timeline_events_event_type_check CHECK (
    event_type IN ('appearance', 'milestone', 'relation', 'conflict', 'growth', 'death', 'other')
  )
);

CREATE INDEX IF NOT EXISTS character_timeline_events_character_id_idx
  ON public.character_timeline_events(character_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS character_timeline_events_novel_id_idx
  ON public.character_timeline_events(novel_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.character_timeline_events IS
  '角色个人时间线事件。由用户/角色剧本 Agent 维护，记录关键节点。';
COMMENT ON COLUMN public.character_timeline_events.event_type IS
  'appearance=登场, milestone=里程碑, relation=关系变化, conflict=冲突, growth=成长, death=死亡/退场, other=其他';
COMMENT ON COLUMN public.character_timeline_events.occurred_at_label IS
  '故事内时间标签（如"第三年春"），自由文本，与现实日期无关。';

-- 自动 updated_at
CREATE OR REPLACE FUNCTION public.touch_character_timeline_events_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS character_timeline_events_touch_updated_at ON public.character_timeline_events;
CREATE TRIGGER character_timeline_events_touch_updated_at
  BEFORE UPDATE ON public.character_timeline_events
  FOR EACH ROW EXECUTE FUNCTION public.touch_character_timeline_events_updated_at();

-- RLS
ALTER TABLE public.character_timeline_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS character_timeline_events_owner ON public.character_timeline_events;
CREATE POLICY character_timeline_events_owner ON public.character_timeline_events
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
