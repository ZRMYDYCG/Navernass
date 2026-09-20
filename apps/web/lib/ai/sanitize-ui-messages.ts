import type { UIMessage } from 'ai'
import { collapseUserPartsForModel } from '@/lib/editor/composer-message'

function normalizeToolInput(input: unknown): Record<string, unknown> | null {
  if (input === null || input === undefined) return null

  let candidate: unknown = input

  if (typeof candidate === 'string') {
    const trimmed = candidate.trim()
    if (!trimmed) return null
    try {
      candidate = JSON.parse(trimmed) as unknown
    } catch {
      return null
    }
  }

  if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) {
    return null
  }

  try {
    JSON.stringify(candidate)
  } catch {
    return null
  }

  return candidate as Record<string, unknown>
}

function isToolPart(part: Record<string, unknown>): boolean {
  return typeof part.type === 'string' && part.type.startsWith('tool-')
}

/**
 * 清洗用于 UI 回放的 parts（保留 ask_user 的 input-available 以渲染表单）
 */
export function sanitizeUIMessagePartsForDisplay(parts: unknown[]): unknown[] {
  const out: unknown[] = []

  for (const raw of parts) {
    const part = raw as Record<string, unknown> | null
    if (!part || typeof part !== 'object' || typeof part.type !== 'string') continue

    if (
      part.type === 'data-book-ref'
      || part.type === 'data-chapter-ref'
      || part.type === 'data-volume-ref'
      || part.type === 'data-character-ref'
      || part.type === 'data-worldbook-ref'
      || part.type === 'data-outline-ref'
    ) {
      out.push(part)
      continue
    }

    if (!isToolPart(part)) {
      out.push(part)
      continue
    }

    const state = part.state as string | undefined
    if (state === 'input-streaming') continue

    const input = normalizeToolInput(part.input)
    if (!input) continue

    if (state === 'output-available' && part.output == null) continue

    out.push({ ...part, input })
  }

  return out
}

/**
 * 清洗用于 LLM 回放的 parts（MiniMax 不接受未完成的 tool call）
 */
export function sanitizeUIMessagePartsForModel(parts: unknown[]): unknown[] {
  const out: unknown[] = []

  for (const raw of parts) {
    const part = raw as Record<string, unknown> | null
    if (!part || typeof part !== 'object' || typeof part.type !== 'string') continue

    if (
      part.type === 'data-book-ref'
      || part.type === 'data-chapter-ref'
      || part.type === 'data-volume-ref'
      || part.type === 'data-character-ref'
      || part.type === 'data-worldbook-ref'
      || part.type === 'data-outline-ref'
    ) {
      continue
    }

    if (!isToolPart(part)) {
      out.push(part)
      continue
    }

    const state = part.state as string | undefined
    // MiniMax 只接受已完成的 tool call；output-error 往往伴随非法 arguments
    if (state !== 'output-available') continue

    const input = normalizeToolInput(part.input)
    if (!input) continue

    if (part.output == null) continue

    out.push({ ...part, input })
  }

  return out
}

export function sanitizeUIMessagesForModel(messages: UIMessage[]): UIMessage[] {
  return messages
    .map((message) => {
      const parts = Array.isArray(message.parts) ? message.parts : []
      const prepared = message.role === 'user'
        ? collapseUserPartsForModel(parts)
        : parts
      const cleaned = sanitizeUIMessagePartsForModel(prepared)
      if (cleaned.length === 0) return null
      return { ...message, parts: cleaned as UIMessage['parts'] }
    })
    .filter((m): m is UIMessage => m !== null)
}

/** 兜底：去掉所有 tool part，只保留 text / reasoning */
export function stripToolPartsFromMessages(messages: UIMessage[]): UIMessage[] {
  return messages
    .map((message) => {
      const parts = Array.isArray(message.parts) ? message.parts : []
      const kept = parts.filter((p: unknown) => {
        const part = p as { type?: string }
        return part?.type === 'text' || part?.type === 'reasoning'
      })
      if (kept.length === 0) return null
      return { ...message, parts: kept as UIMessage['parts'] }
    })
    .filter((m): m is UIMessage => m !== null)
}

/** @deprecated 使用 sanitizeUIMessagePartsForDisplay */
export function sanitizeUIMessageParts(parts: unknown[]): unknown[] {
  return sanitizeUIMessagePartsForDisplay(parts)
}
