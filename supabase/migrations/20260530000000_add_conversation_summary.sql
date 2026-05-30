-- Add summary column to novel_conversations for future Memory Agent.
-- 用途：当 conversation 累积消息超过阈值时，由 Memory Agent 滚动写入摘要，
-- 后续轮次不再回填整段历史，只把摘要 + 最近 N 条消息送给 specialist agent。
--
-- 当前阶段（MVP）：仅添加列，不读不写。预留接口位。
-- 兼容性：列允许为 NULL，已有 conversation 不受影响（IF NOT EXISTS 保证幂等）。

ALTER TABLE public.novel_conversations
  ADD COLUMN IF NOT EXISTS summary text;

COMMENT ON COLUMN public.novel_conversations.summary IS
  'Rolling conversation summary maintained by Memory Agent. NULL means no summary yet.';
