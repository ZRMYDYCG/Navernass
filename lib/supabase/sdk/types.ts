// =============================================
// 通用类型定义
// =============================================

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginationResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// =============================================
// 小说类型
// =============================================

export interface Novel {
  id: string
  user_id: string
  title: string
  description?: string
  cover?: string
  category?: string
  tags?: string[]
  word_count: number
  chapter_count: number
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
  published_at?: string
}

export interface CreateNovelDto {
  title: string
  description?: string
  cover?: string
  category?: string
  tags?: string[]
}

export interface UpdateNovelDto {
  id: string
  title?: string
  description?: string
  cover?: string
  category?: string
  tags?: string[]
  status?: 'draft' | 'published' | 'archived'
}

// =============================================
// 卷类型
// =============================================

export interface Volume {
  id: string
  novel_id: string
  user_id: string
  title: string
  description?: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface CreateVolumeDto {
  novel_id: string
  title: string
  description?: string
  order_index: number
}

export interface UpdateVolumeDto {
  id: string
  title?: string
  description?: string
  order_index?: number
}

// =============================================
// 章节类型
// =============================================

export interface Chapter {
  id: string
  novel_id: string
  volume_id?: string // 所属卷ID，为空表示章节直接属于小说
  user_id: string
  title: string
  content: string
  order_index: number
  word_count: number
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

export interface CreateChapterDto {
  novel_id: string
  volume_id?: string // 可选，指定章节所属的卷
  title: string
  content?: string
  order_index: number
}

export interface UpdateChapterDto {
  id: string
  title?: string
  content?: string
  order_index?: number
  volume_id?: string | null // 支持移动章节到卷或从卷中移出
  status?: 'draft' | 'published'
}

// =============================================
// 对话类型
// =============================================

export interface Conversation {
  id: string
  user_id: string
  title: string
  is_pinned?: boolean
  pinned_at?: string
  created_at: string
  updated_at: string
}

export interface CreateConversationDto {
  title: string
}

export interface UpdateConversationDto {
  id: string
  title?: string
  is_pinned?: boolean
}

export interface Message {
  id: string
  conversation_id: string
  user_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  tokens?: number
  created_at: string
}

export interface CreateMessageDto {
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  tokens?: number
}

// =============================================
// 产品动态类型
// =============================================

export interface News {
  id: string
  type: 'feature' | 'update' | 'announcement' | 'community'
  title: string
  content: string
  image?: string
  link?: string
  author?: string
  status: 'draft' | 'published' | 'archived'
  priority: number
  read_count: number
  created_at: string
  updated_at: string
}

export interface CreateNewsDto {
  type: 'feature' | 'update' | 'announcement' | 'community'
  title: string
  content: string
  image?: string
  link?: string
  author?: string
  priority?: number
}

export interface UpdateNewsDto {
  id: string
  type?: 'feature' | 'update' | 'announcement' | 'community'
  title?: string
  content?: string
  image?: string
  link?: string
  author?: string
  status?: 'draft' | 'published' | 'archived'
  priority?: number
}

// =============================================
// AI 对话类型
// =============================================

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface SendMessageRequest {
  conversationId?: string
  message: string
}

export interface SendMessageResponse {
  conversationId: string
  userMessage: Message
  assistantMessage: Message
}
