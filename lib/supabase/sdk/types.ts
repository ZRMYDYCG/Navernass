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

export interface Todo {
  id: string
  user_id: string
  content: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
}

export interface CreateTodoDto {
  content: string
  priority?: 'low' | 'medium' | 'high'
}

export interface UpdateTodoDto {
  id: string
  content?: string
  completed?: boolean
  priority?: 'low' | 'medium' | 'high'
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
  /** 滚动摘要，由 Memory Agent 维护；MVP 阶段始终为 null。 */
  summary?: string | null
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
  /** AI SDK v6 UIMessage.parts 数组（含 text/reasoning/tool-* 等）。NULL 表示旧消息。 */
  parts?: unknown[] | null
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
  parts?: unknown[]
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

// =============================================
// 世界观（Worldbook）类型
// =============================================

export type WorldbookCategory =
  | 'setting'
  | 'location'
  | 'item'
  | 'faction'
  | 'event'
  | 'rule'
  | 'character_lore'
  | 'other'

export interface WorldbookEntry {
  id: string
  user_id: string
  novel_id: string
  category: WorldbookCategory
  title: string
  content: string
  keywords: string[]
  order_index: number
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CreateWorldbookEntryDto {
  novel_id: string
  category?: WorldbookCategory
  title: string
  content?: string
  keywords?: string[]
  order_index?: number
}

export interface UpdateWorldbookEntryDto {
  category?: WorldbookCategory
  title?: string
  content?: string
  keywords?: string[]
  order_index?: number
}

// =============================================
// 大纲（Outlines）类型
// =============================================

export interface Outline {
  id: string
  user_id: string
  novel_id: string
  volume_id?: string | null
  parent_id?: string | null
  title: string
  content: string
  order_index: number
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CreateOutlineDto {
  novel_id: string
  volume_id?: string | null
  parent_id?: string | null
  title: string
  content?: string
  order_index?: number
}

export interface UpdateOutlineDto {
  volume_id?: string | null
  parent_id?: string | null
  title?: string
  content?: string
  order_index?: number
}

// =============================================
// 工作台统计类型
// =============================================

export interface WorkspaceStatsSummary {
  novelCount: number
  totalWordCount: number
  totalChapterCount: number
  conversationCount: number
}

export interface WordCountTrendItem {
  month: string
  wordCount: number
}

export interface NovelStatusItem {
  status: string
  label: string
  value: number
}

export interface CharacterMapItem {
  title: string
  characters: number
  relationships: number
}

export interface GenreRadarItem {
  category: string
  draft: number
  published: number
  archived: number
}

export interface CalendarDayItem {
  date: string
  count: number
}

export interface WorkspaceStats {
  summary: WorkspaceStatsSummary
  wordCountTrend: WordCountTrendItem[]
  novelStatusData: NovelStatusItem[]
  characterMapData: CharacterMapItem[]
  genreRadarData: GenreRadarItem[]
  calendarData: CalendarDayItem[]
}

// =============================================
// 调研类型
// =============================================

export interface Survey {
  id: string
  user_id?: string
  experience: string
  genres: string[]
  pain_points: string[]
  tools: string[]
  ai_expectations: string[]
  ai_concerns?: string
  contact?: string
  created_at: string
}

export interface CreateSurveyDto {
  experience: string
  genres: string[]
  pain_points: string[]
  tools: string[]
  ai_expectations: string[]
  ai_concerns?: string
  contact?: string
}
