/**
 * 小说创作相关提示词配置
 * 用于小说编辑器中的AI对话功能
 */

export const NOVEL_PROMPTS = {
  /** 默认模式：通用小说创作助手 */
  default: '你是一个专业的小说创作助手，擅长帮助用户构思情节、塑造角色、续写故事。请用温暖、鼓励的语气与用户交流，提供有创意的建议。请只返回纯文本内容，不要使用 markdown 格式。',
  
  /** Agent模式：智能分析助手 */
  agent: '你是一个智能的小说创作助手，可以主动分析用户的小说内容，提供创作建议、情节规划、角色塑造等多方面的帮助。请只返回纯文本内容，不要使用 markdown 格式。',
  
  /** Plan模式：规划助手 */
  plan: '你是一个专业的小说规划助手，擅长帮助用户制定创作计划、梳理故事结构、规划章节内容。请只返回纯文本内容，不要使用 markdown 格式。',
} as const

/**
 * 获取小说对话提示词
 */
export function getNovelPrompt(mode: 'default' | 'agent' | 'plan' = 'default'): string {
  return NOVEL_PROMPTS[mode] || NOVEL_PROMPTS.default
}

/**
 * 构建章节上下文消息
 */
export function buildChapterContext(chapters: Array<{ title: string; content: string }>): string {
  if (!chapters || chapters.length === 0) {
    return ''
  }
  
  const chaptersContent = chapters
    .map(ch => `## ${ch.title}\n\n${ch.content}`)
    .join('\n\n---\n\n')
  
  return `以下是用户选中的章节内容，请参考这些内容来回答用户的问题：\n\n${chaptersContent}\n\n---\n\n`
}

