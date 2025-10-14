/**
 * Home 模块类型定义
 */

/**
 * 对话会话类型
 */
export interface Conversation {
  /** 会话唯一标识 */
  id: number;
  /** 会话标题 */
  title: string;
  /** 最后更新时间 */
  time: string;
  /** 会话创建时间戳 (可选) */
  createdAt?: number;
  /** 会话更新时间戳 (可选) */
  updatedAt?: number;
}

/**
 * 对话消息类型
 */
export interface Message {
  /** 消息唯一标识 */
  id: string;
  /** 消息内容 */
  content: string;
  /** 消息角色：用户/助手 */
  role: 'user' | 'assistant';
  /** 消息时间戳 */
  timestamp: number;
}

/**
 * 对话列表侧边栏 Props
 */
export interface ConversationListProps {
  /** 对话列表数据 */
  conversations: Conversation[];
  /** 当前选中的对话ID */
  selectedId: number | null;
  /** 选择对话的回调 */
  onSelect: (id: number) => void;
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
  onClick: (id: number) => void;
  /** 更多操作回调 */
  onMoreAction?: (id: number) => void;
}

/**
 * 聊天区域 Props
 */
export interface ChatAreaProps {
  /** 当前选中的对话ID */
  selectedConversationId: number | null;
  /** 消息列表 */
  messages?: Message[];
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

