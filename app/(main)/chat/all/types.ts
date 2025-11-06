export interface ChatItem {
  id: string
  title: string
  createdAt: Date
  updatedAt?: Date
  isPinned?: boolean
}

export interface DateGroup {
  date: string
  label: string
  chats: ChatItem[]
}

export interface ChatBatchAction {
  type: 'delete' | 'pin' | 'share'
  chatIds: string[]
}
