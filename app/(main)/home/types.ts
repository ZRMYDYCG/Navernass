/**
 * Home 模块类型定义
 */

import type { Conversation as ApiConversation, Message as ApiMessage } from "@/lib/api";

/**
 * 对话会话类型 (UI 层)
 */
export interface Conversation extends ApiConversation {
  /** 显示用的时间文本 */
  timeText?: string;
}

/**
 * 对话消息类型 (UI 层)
 */
export type Message = ApiMessage;

/**
 * 对话列表侧边栏 Props
 */
export interface ConversationListProps {
  /** 对话列表数据 */
  conversations: Conversation[];
  /** 当前选中的对话ID */
  selectedId: string | null;
  /** 选择对话的回调 */
  onSelect: (id: string) => void;
  /** 创建新对话的回调 */
  onCreateNew?: () => void;
}

/**
 * 对话项组件 Props
 */
export interface ConversationItemProps {
  /** 对话数据 */
  conversation: Conversation;
  /** 是否选中 */
  isSelected: boolean;
  /** 点击回调 */
  onClick: (id: string) => void;
  /** 更多操作回调 */
  onMoreAction?: (id: string) => void;
}

/**
 * 聊天区域 Props
 */
export interface ChatAreaProps {
  /** 当前选中的对话ID */
  selectedConversationId: string | null;
  /** 消息列表 */
  messages?: Message[];
  /** 发送消息的回调 */
  onSendMessage?: (content: string) => void;
  /** 加载状态 */
  loading?: boolean;
}

/**
 * 欢迎区域 Props
 */
export interface WelcomeSectionProps {
  /** 欢迎文本 */
  welcomeText?: string;
  /** Logo尺寸 */
  logoSize?: number;
}

/**
 * 聊天输入框 Props
 */
export interface ChatInputProps {
  /** 输入占位符 */
  placeholder?: string;
  /** 发送消息回调 */
  onSend: (message: string) => void;
  /** 是否禁用 */
  disabled?: boolean;
}
