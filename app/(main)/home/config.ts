import type { Conversation } from './types';

/**
 * Home 模块配置文件
 */

/**
 * 侧边栏宽度配置
 */
export const SIDEBAR_WIDTH = 300;

/**
 * Header 高度配置
 */
export const HEADER_HEIGHT = 55;

/**
 * Logo 尺寸配置
 */
export const LOGO_SIZE = 100;

/**
 * 默认欢迎文本
 */
export const WELCOME_TEXT = '我是你的专属创作伙伴，可以帮助你构思情节';

/**
 * 输入框占位符文本
 */
export const INPUT_PLACEHOLDER = '输入你的问题或想法...';

/**
 * 对话列表标题
 */
export const CONVERSATION_LIST_TITLE = '对话历史';

/**
 * 最大输入字符数
 */
export const MAX_INPUT_LENGTH = 1000;

/**
 * 对话历史数据
 */
export const MOCK_CONVERSATIONS: Conversation[] = [
  { id: 1, title: '小说情节构思', time: '刚刚' },
  { id: 2, title: '角色性格设定', time: '10分钟前' },
  { id: 3, title: '世界观建设', time: '1小时前' },
  { id: 4, title: '写作技巧指导', time: '昨天' },
];

/**
 * 样式配置
 */
export const STYLES = {
  /** 侧边栏样式类 */
  sidebar: {
    container: 'h-screen border-r border-neutral-200 dark:border-gray-800',
    content: 'bg-white dark:bg-gray-900',
    header: 'bg-neutral-100 dark:bg-gray-800 flex justify-between items-center px-4 border-b border-neutral-200 dark:border-gray-700',
    list: 'h-full overflow-y-auto p-4 space-y-2',
  },
  /** 对话项样式类 */
  conversationItem: {
    base: 'relative w-full p-3 rounded-md cursor-pointer transition-all',
    selected: 'bg-gray-100 dark:bg-gray-800',
    hover: 'hover:bg-neutral-50 dark:hover:bg-gray-800',
    title: 'text-sm font-medium text-neutral-900 dark:text-gray-100',
    time: 'text-xs text-neutral-400 dark:text-gray-500 mt-1',
    moreButton: 'ml-2 p-1 hover:bg-neutral-200 dark:hover:bg-gray-700 rounded transition-colors',
  },
  /** 聊天区域样式类 */
  chatArea: {
    container: 'flex flex-col justify-center items-center w-full h-full px-8 bg-white dark:bg-gray-900',
    welcome: 'flex flex-col items-center mb-8',
    welcomeText: 'text-md font-medium text-gray-900 dark:text-gray-100 mt-4',
  },
  /** 输入框样式类 */
  input: {
    container: 'w-full max-w-3xl mb-8',
    wrapper: 'relative',
    field: 'w-full px-4 py-3 pr-12 rounded-lg border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:border-neutral-400 dark:focus:border-gray-600 transition-colors',
    sendButton: 'absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-black dark:bg-gray-700 rounded-full w-8 h-8 flex justify-center items-center hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors',
  },
} as const;

