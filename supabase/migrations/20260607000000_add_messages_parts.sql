-- messages.parts: 完整保存 AI SDK v6 的 UIMessage.parts 数组
--
-- 背景：app/(main)/chat 重构为 useChat 模式后，消息内容不仅有 text，
-- 还可能含 reasoning（thinking 模型）、tool-*/data-* 等 part。刷新页面后
-- 旧 schema（仅 content + thinking）会丢失这些结构，AI agent 的思考过程
-- 和工具调用无法回放。
--
-- 现在 parts (jsonb) 完整存下整个 parts 数组，行为与 novel_messages.parts
-- 完全一致。
--
-- 兼容性：列允许为 NULL；旧消息无 parts 时回退到 content + thinking 还原。

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS parts jsonb;

COMMENT ON COLUMN public.messages.parts IS
  'AI SDK v6 UIMessage.parts 数组（含 text/reasoning/tool-* 等）。NULL 表示旧消息，按 content+thinking 回填。';

-- 可选索引：当未来 Memory Agent 需要按 tool name 检索历史调用时启用。
-- 当前阶段不创建，避免无效成本。
-- CREATE INDEX IF NOT EXISTS idx_messages_parts ON public.messages USING gin (parts);
