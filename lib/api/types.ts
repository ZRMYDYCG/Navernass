// =============================================
// 通用类型定义
// =============================================

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// =============================================
// 用户类型
// =============================================

export interface Profile {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileDto {
  username?: string;
  avatar_url?: string;
  bio?: string;
}

// =============================================
// 小说类型
// =============================================

export interface Novel {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  cover?: string;
  category?: string;
  tags?: string[];
  word_count: number;
  chapter_count: number;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface CreateNovelDto {
  title: string;
  description?: string;
  cover?: string;
  category?: string;
  tags?: string[];
}

export interface UpdateNovelDto {
  id: string;
  title?: string;
  description?: string;
  cover?: string;
  category?: string;
  tags?: string[];
  status?: "draft" | "published" | "archived";
}

// =============================================
// 章节类型
// =============================================

export interface Chapter {
  id: string;
  novel_id: string;
  user_id: string;
  title: string;
  content: string;
  order_index: number;
  word_count: number;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
}

export interface CreateChapterDto {
  novel_id: string;
  title: string;
  content?: string;
  order_index: number;
}

export interface UpdateChapterDto {
  id: string;
  title?: string;
  content?: string;
  order_index?: number;
  status?: "draft" | "published";
}

// =============================================
// 知识库类型
// =============================================

export interface KnowledgeBase {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateKnowledgeBaseDto {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface UpdateKnowledgeBaseDto {
  id: string;
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface KnowledgeItem {
  id: string;
  knowledge_base_id: string;
  user_id: string;
  parent_id?: string;
  type: "folder" | "file";
  name: string;
  content?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  children?: KnowledgeItem[]; // 用于前端树形结构
}

export interface CreateKnowledgeItemDto {
  knowledge_base_id: string;
  parent_id?: string;
  type: "folder" | "file";
  name: string;
  content?: string;
  order_index?: number;
}

export interface UpdateKnowledgeItemDto {
  id: string;
  name?: string;
  content?: string;
  order_index?: number;
  parent_id?: string;
}

// =============================================
// 对话类型
// =============================================

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  novel_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateConversationDto {
  title: string;
  novel_id?: string;
}

export interface UpdateConversationDto {
  id: string;
  title?: string;
  novel_id?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  tokens?: number;
  created_at: string;
}

export interface CreateMessageDto {
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  tokens?: number;
}
