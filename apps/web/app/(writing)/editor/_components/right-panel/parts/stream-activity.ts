import type { UIMessagePart } from 'ai'
import { findLastRenderableIndex } from './registry'

type AnyPart = UIMessagePart<any, any>

function isToolPart(part: AnyPart): boolean {
  return typeof part?.type === 'string' && part.type.startsWith('tool-')
}

/** 用于检测流式停顿：parts 结构或文本长度变化时重置计时 */
export function getMessageStreamFingerprint(parts: AnyPart[]): string {
  let fp = `${parts.length}`
  for (const part of parts) {
    if (part.type === 'text' || part.type === 'reasoning') {
      fp += `:${part.type}:${(part as { text?: string }).text?.length ?? 0}`
    } else if (isToolPart(part)) {
      fp += `:tool:${(part as { state?: string }).state ?? ''}`
    }
  }
  return fp
}

/**
 * 消息级尾部活动指示（工具完成后的空档、等待下一段输出）。
 * 进行中的 tool / 空 text 由各自 part 内 loading 承接。
 */
export function shouldShowStreamTailActivity(parts: AnyPart[], isStreaming: boolean): boolean {
  if (!isStreaming) return false

  const lastIdx = findLastRenderableIndex(parts)
  if (lastIdx < 0) return false

  const lastPart = parts[lastIdx]
  if (isToolPart(lastPart)) {
    const state = (lastPart as { state?: string }).state
    return state === 'output-available' || state === 'output-error'
  }

  return false
}
