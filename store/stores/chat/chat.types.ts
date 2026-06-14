import type { ChatAiMode } from '@/lib/ai/agents/chat-modes'
import type { AiModel } from '@/app/(writing)/editor/_components/right-panel/types'

export type { ChatAiMode }

export type ChatState = {
  /** 欢迎页输入框文本（路由到具体会话前的草稿输入） */
  welcomeInput: string
  /** 欢迎页跳转草稿会话时携带的首条消息，draft 页消费后即清空 */
  pendingDraftMessage: string | null
  /** 当前正在进行流式响应的会话 id；用于左侧抽屉列表的 loading 指示器 */
  streamingConversationId: string | null
  /** 欢迎页用户选定的 mode，跳转后由 [id] 页一次性消费 */
  welcomeMode: ChatAiMode
  /** 欢迎页用户选定的 model，跳转后由 [id] 页一次性消费 */
  welcomeModel: AiModel
}

export type ChatActions = {
  setWelcomeInput: (input: string) => void
  setPendingDraftMessage: (msg: string | null) => void
  /** 原子读取 + 清空，保证 draft 页只触发一次 sendMessage */
  consumePendingDraftMessage: () => string | null
  setStreamingConversationId: (id: string | null) => void
  setWelcomeMode: (mode: ChatAiMode) => void
  setWelcomeModel: (model: AiModel) => void
  /** 原子读取并清空 welcomeMode + welcomeModel（[id] 页挂载时调用） */
  consumeWelcomeAgent: () => { mode: ChatAiMode, model: AiModel } | null
}

export type ChatStore = {
  chat: ChatState
  chatActions: ChatActions
}
