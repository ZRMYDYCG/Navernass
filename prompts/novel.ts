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
export function buildChapterContext(chapters: Array<{ title: string, content: string }>): string {
  if (!chapters || chapters.length === 0) {
    return ''
  }

  const chaptersContent = chapters
    .map(ch => `## ${ch.title}\n\n${ch.content}`)
    .join('\n\n---\n\n')

  return `以下是用户选中的章节内容，请参考这些内容来回答用户的问题：\n\n${chaptersContent}\n\n---\n\n`
}

/**
 * 构建书本上下文消息（主聊天页 @book 注入）
 */
export function buildBookContext(books: Array<BookContextEntry>): string {
  if (!books || books.length === 0) return ''

  const lines = books.map((b) => {
    const tag = b.category ? `（${b.category}）` : ''
    const tags = b.tags && b.tags.length > 0 ? ` [${b.tags.join(', ')}]` : ''
    const desc = b.description ? `\n简介：${b.description}` : ''
    // eslint-disable-next-line no-irregular-whitespace -- full-width space is intentional Chinese typography
    const stats = `\n字数：${b.word_count ?? 0}　章节数：${b.chapter_count ?? 0}　状态：${b.status ?? 'draft'}`
    return `- 《${b.title}》${tag}${tags}（bookId: ${b.id}）${desc}${stats}`
  })

  return `以下是用户在主对话中 @ 选中的小说（书本）摘要，请结合这些书本信息回答用户的问题。必要时可调 propose_* 工具进一步操作书本或调用 list_chapters / read_chapter 等工具读取其内容。\n\n${lines.join('\n')}\n\n---\n\n`
}

/**
 * 构建角色上下文块（主聊天页 @character 注入）
 */
export function buildCharacterContextBlock(characters: CharacterContextEntry[]): string {
  if (!characters || characters.length === 0) return ''

  const lines = characters.map((c) => {
    const role = c.role ? `（${c.role}）` : ''
    const desc = c.description ? `\n  描述：${c.description}` : ''
    const traits = c.traits && c.traits.length > 0 ? `\n  性格标签：${c.traits.join('、')}` : ''
    const keywords = c.keywords && c.keywords.length > 0 ? `\n  关键词：${c.keywords.join('、')}` : ''
    return `- ${c.name}${role}（characterId: ${c.id}）${desc}${traits}${keywords}`
  })

  return `用户在主对话中 @ 提及了以下角色；请把它们作为创作上下文。\n\n${lines.join('\n')}\n\n---\n\n`
}

export interface BookContextEntry {
  id: string
  title: string
  description?: string | null
  category?: string | null
  tags?: string[] | null
  word_count?: number
  chapter_count?: number
  status?: string
}

export interface CharacterContextEntry {
  id: string
  name: string
  role?: string | null
  description?: string | null
  traits?: string[] | null
  keywords?: string[] | null
}
