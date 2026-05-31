import type { NovelMessage } from '@/lib/supabase/sdk'
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

function sanitizeParts(parts: unknown[]): unknown[] {
  return sanitizeUIMessagePartsForDisplay(parts)
}

export function toUIMessages(messages: NovelMessage[]): UIMessage[] {
  const out: UIMessage[] = []
  for (const m of messages) {
    try {
      const parts = safeParseParts(m.parts)
      if (parts && parts.length > 0) {
        const cleaned = sanitizeParts(parts)
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
