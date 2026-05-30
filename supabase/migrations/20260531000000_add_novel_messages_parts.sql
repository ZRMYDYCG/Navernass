-- novel_messages.parts: 完整保存 AI SDK v6 的 UIMessage.parts 数组
--
-- 背景：之前只持久化了最终的 content (text) 和 thinking (reasoning)。
-- 但 ai-sdk v6 的 UIMessage 还包含 tool calls (tool-propose_edit 等)、ask_user 表单、
-- 流式中产生的多个 part 顺序等。刷新页面后这些都丢失，AI agent 的"工作过程"和
-- 用户填的表单也无法回放。
--
-- 现在 parts (jsonb) 完整存下整个 parts 数组：
--   - role=user 的消息：通常只有 1 个 text part
--   - role=assistant 的消息：可能含 reasoning + 多个 text + 多个 tool-* parts，按出现顺序
--
-- 兼容性：列允许为 NULL；旧消息无 parts 时回退到 content + thinking 还原。

ALTER TABLE public.novel_messages
  ADD COLUMN IF NOT EXISTS parts jsonb;

COMMENT ON COLUMN public.novel_messages.parts IS
  'AI SDK v6 UIMessage.parts 数组（含 text/reasoning/tool-* 等）。NULL 表示旧消息，按 content+thinking 回填。';

-- 可选索引：当未来 Memory Agent 需要按 tool name 检索历史调用时启用。
-- 当前阶段不创建，避免无效成本。
-- CREATE INDEX IF NOT EXISTS idx_novel_messages_parts ON public.novel_messages USING gin (parts);
