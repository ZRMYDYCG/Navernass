import type { Message } from '@/lib/supabase/sdk'
import type { UIMessage } from 'ai'
import { sanitizeUIMessagePartsForDisplay } from '@/lib/ai/sanitize-ui-messages'

function safeParseParts(raw: unknown): unknown[] | null {
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : null
    } catch {
      return null
    }
  }
  return null
}

/**
 * 把数据库的 Message[] 还原为 AI SDK v6 的 UIMessage[]。
 *
 * 优先级：
 *   1. parts 列（jsonb）解析后 sanitize → 完整保留 reasoning/tool/data-* 顺序
 *   2. 回退到 thinking + content → 合成 reasoning + text 两 part
 *
 * 与编辑器侧 novel-chat-messages.ts 行为一致，差异仅是底层表（messages vs novel_messages）。
 */
export function toUIMessages(messages: Message[]): UIMessage[] {
  const out: UIMessage[] = []
  for (const m of messages) {
    try {
      const parts = safeParseParts(m.parts)
      if (parts && parts.length > 0) {
        const cleaned = sanitizeUIMessagePartsForDisplay(parts)
        if (cleaned.length > 0) {
          out.push({
            id: m.id,
            role: m.role as 'user' | 'assistant' | 'system',
            parts: cleaned as UIMessage['parts'],
          } as UIMessage)
          continue
        }
      }

      const fallback: UIMessage['parts'] = []
      if (m.thinking) {
        fallback.push({ type: 'reasoning', text: m.thinking, state: 'done' } as UIMessage['parts'][number])
      }
      fallback.push({ type: 'text', text: m.content || '', state: 'done' } as UIMessage['parts'][number])
      out.push({
        id: m.id,
        role: m.role as 'user' | 'assistant' | 'system',
        parts: fallback,
      } as UIMessage)
    } catch (err) {
      console.warn('[toUIMessages] skipped one message due to:', err, m)
    }
  }
  return out
}

/**
 * 从 UIMessage 中抽取 text part 的纯文本（用于 Markdown 渲染、复制、share 等）。
 */
export function extractTextFromUIMessage(message: UIMessage | undefined): string {
  if (!message?.parts?.length) return ''
  return message.parts
    .filter((p): p is { type: 'text', text: string } =>
      p.type === 'text' && typeof p.text === 'string',
    )
    .map(p => p.text)
    .join('')
}

/**
 * 从 UIMessage 中抽取 reasoning part 的纯文本。
 */
export function extractReasoningFromUIMessage(message: UIMessage | undefined): string {
  if (!message?.parts?.length) return ''
  return message.parts
    .filter((p): p is { type: 'reasoning', text: string } =>
      p.type === 'reasoning' && typeof p.text === 'string',
    )
    .map(p => p.text)
    .join('\n')
}
