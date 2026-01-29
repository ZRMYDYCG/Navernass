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
  order_index: number
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
// 卷类�?
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
  volume_id?: string // 所属卷ID，为空表示章节直接属于小�?
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
  volume_id?: string // 可选，指定章节所属的�?
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

export interface Character {
  id: string
  novel_id: string
  user_id: string
  name: string
  role?: string
  avatar?: string
  color?: string
  description?: string
  traits: string[]
  keywords: string[]
  first_appearance?: string
  note?: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface CreateCharacterDto {
  novel_id: string
  name: string
  role?: string
  avatar?: string
  color?: string
  description?: string
  traits?: string[]
  keywords?: string[]
  first_appearance?: string
  note?: string
  order_index?: number
  overview_x?: number | null
  overview_y?: number | null
}

export interface Relationship {
  id: string
  novel_id?: string
  sourceId: string
  targetId: string
  sourceToTargetLabel: string
  targetToSourceLabel: string
  note?: string
  created_at?: string
  updated_at?: string
}

export interface CreateRelationshipDto {
  novel_id: string
  sourceId: string
  targetId: string
  sourceToTargetLabel: string
  targetToSourceLabel: string
  note?: string
}

export interface UpdateRelationshipDto {
  id: string
  sourceId?: string
  targetId?: string
  sourceToTargetLabel?: string
  targetToSourceLabel?: string
  note?: string
}

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
// 产品动态类�?
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

// =============================================
// 小说 AI 会话类型
// =============================================

export interface NovelConversation {
  id: string
  novel_id: string
  user_id: string
  title: string
  is_pinned?: boolean
  pinned_at?: string
  created_at: string
  updated_at: string
  message_count?: number
}

export interface CreateNovelConversationDto {
  novel_id: string
  title: string
}

export interface UpdateNovelConversationDto {
  id: string
  title?: string
  is_pinned?: boolean
}

export interface NovelMessage {
  id: string
  conversation_id: string
  novel_id: string
  user_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  tokens?: number
  thinking?: string
  created_at: string
}

export interface CreateNovelMessageDto {
  conversation_id: string
  novel_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  tokens?: number
  thinking?: string
}

export interface SendNovelMessageRequest {
  novelId: string
  conversationId?: string
  message: string
  selectedChapterIds?: string[]
  mode?: string
  model?: string
}

export interface UserSettings {
  id: string
  user_id: string
  api_key: string | null
  created_at: string
  updated_at: string
}
