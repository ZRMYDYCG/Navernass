import type { AiChatMode } from './modes'

/**
 * 用户选的模式与消息意图不一致时，注入简短提示（不自动改路由，避免惊跳）。
 */
export function buildModeMismatchHint(text: string, mode: AiChatMode): string | null {
  const t = text.trim()
  if (!t) return null

  const wantsWrite = /落库|写入|创建|更新|删除|改稿|续写|append|propose_edit|帮我写/i.test(t)
  const wantsPlan = /规划|节拍|故事弧|plan\s*文件|章节安排/i.test(t)
  const wantsOutline = /大纲|卷结构|场景大纲|outline/i.test(t)
  const wantsWorldbook = /世界观|设定库|势力|设定条目|worldbook|lore/i.test(t)
  if (mode === 'ask' && wantsWrite) {
    return '【路由提示】用户似乎在要求改稿或落库，但当前为「提问」模式。请说明需切换到「执行」或对应专用模式，勿调用写入类工具。'
  }
  if (mode === 'plan' && (wantsOutline || wantsWorldbook) && !wantsPlan) {
    return '【路由提示】用户意图更像大纲或世界观，当前为「规划」模式。若无法写入对应结构，请提示切换模式。'
  }
  if (mode === 'outline' && wantsPlan && !wantsOutline) {
    return '【路由提示】用户意图更像 Plan 规划笔记，当前为「大纲」模式。请提示切换到「规划」模式。'
  }
  if (mode === 'worldbook' && wantsOutline && !wantsWorldbook) {
    return '【路由提示】用户意图更像大纲，当前为「世界观」模式。请提示切换。'
  }
  if (mode === 'agent' && (wantsPlan || wantsOutline || wantsWorldbook) && !wantsWrite) {
    return '【路由提示】用户主要在整理结构/设定而非改正文时，可建议切换到规划/大纲/世界观专用模式，或继续在执行模式下最小帮助。'
  }

  return null
}
