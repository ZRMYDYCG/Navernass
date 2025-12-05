/**
 * 聊天相关提示词配置
 * 用于通用聊天功能
 */

export const CHAT_PROMPTS = {
  /** 默认聊天系统提示词 */
  default: '你是一个友好、专业的AI助手，擅长回答各种问题，提供有用的建议和帮助。请用清晰、易懂的方式与用户交流。',
} as const

/**
 * 聊天提示词建议列表
 */
export const CHAT_PROMPT_SUGGESTIONS = [
  { label: '帮我构思一个悬疑推理小说的开篇情节' },
  { label: '如何塑造一个令人印象深刻的反派角色？' },
  { label: '生成都市言情小说的人物关系网' },
  { label: '写一段充满张力的对话场景' },
  { label: '帮我设计一个独特的魔法体系' },
  { label: '优化这段文字的节奏感和情绪渲染' },
] as const

/**
 * 获取聊天提示词
 */
export function getChatPrompt(mode: keyof typeof CHAT_PROMPTS = 'default'): string {
  return CHAT_PROMPTS[mode] || CHAT_PROMPTS.default
}

/**
 * 生成对话标题的提示词
 */
export const TITLE_GENERATION_PROMPT = '你是一个专业的小说创作助手。请根据用户的第一条消息，生成一个简洁、准确的对话标题（不超过20个字）。只需要返回标题，不需要任何其他内容。'
