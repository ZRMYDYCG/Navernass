export type ChatState = {
  /** 欢迎页输入框文本（路由到具体会话前的草稿输入） */
  welcomeInput: string
  /** 欢迎页跳转草稿会话时携带的首条消息，draft 页消费后即清空 */
  pendingDraftMessage: string | null
  /** 当前正在进行流式响应的会话 id；用于左侧抽屉列表的 loading 指示器 */
  streamingConversationId: string | null
}

export type ChatActions = {
  setWelcomeInput: (input: string) => void
  setPendingDraftMessage: (msg: string | null) => void
  /** 原子读取 + 清空，保证 draft 页只触发一次 sendMessage */
  consumePendingDraftMessage: () => string | null
  setStreamingConversationId: (id: string | null) => void
}

export type ChatSlice = {
  chat: ChatState
  chatActions: ChatActions
}
