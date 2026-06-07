-- conversations.mode / conversations.model：Chat Agent 按对话持久化模式与模型
--
-- 背景：Chat 页的 Agent 体验需要按"对话"粒度记忆 mode（ask / brainstorm / craft / polish / agent）
-- 和 model（MiniMax-M3 等）。刷新页面 / 重新挂载 conversation 时直接读行恢复，
-- 不再依赖 zustand 临时态或 URL 参数。
--
-- mode 默认 'ask'，保证老数据与新数据行为一致（默认走通用问答 specialist）。
-- model 留空：null 表示沿用后端 DEFAULT_LLM_MODEL（'MiniMax-M3'），
-- 仅在用户显式切换到非默认 model 时才写入。

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'ask',
  ADD COLUMN IF NOT EXISTS model text;

COMMENT ON COLUMN public.conversations.mode IS
  'Chat Agent 模式：ask | brainstorm | craft | polish | agent。新建默认 ask。';
COMMENT ON COLUMN public.conversations.model IS
  'Chat Agent 模型 id（MiniMax-M3 / MiniMax-M2.7 / MiniMax-M2.1 / MiniMax-Text-01 / abab6.5s-chat）。NULL 表示沿用默认。';
