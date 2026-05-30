'use client'

import type { UIMessage, UIMessagePart } from 'ai'
import type { ReactNode } from 'react'
import { ReasoningPart } from './reasoning-part'
import { TextPart } from './text-part'

/**
 * AG-UI part 注册表
 *
 * 设计目标：
 * 1. 按 message.parts 出现的时间顺序依次渲染（reasoning 与 text 可交错）。
 * 2. 每种 part 类型由独立组件负责，新增类型（tool-call / source / file 等）时只需注册即可。
 * 3. 由 group 阶段决定连续 text part 是否合并到同一气泡，避免每个 part 都包一个气泡。
 */

export type RenderablePartType = 'text' | 'reasoning'

export interface PartRenderContext {
  message: UIMessage
  /** 该消息是否处于流式状态 */
  isStreaming: boolean
  /** 该 part 在 parts 中的索引 */
  index: number
  /** 该 part 是否是消息的最后一个可见 part（决定 cursor / 复制按钮） */
  isLast: boolean
}

type AnyPart = UIMessagePart<any, any>

/** 仅这些类型会进入渲染流水线，其它类型的 part 会被跳过 */
export function isRenderablePart(part: AnyPart): boolean {
  return part.type === 'text' || part.type === 'reasoning'
}

/** 该 part 是否应包裹在文本气泡中（连续 bubble part 会合并到同一个气泡） */
export function isBubblePart(part: AnyPart): boolean {
  return part.type === 'text'
}

/** 渲染单个 part；调用方负责决定是否包气泡 */
export function renderPart(part: AnyPart, ctx: PartRenderContext): ReactNode {
  switch (part.type) {
    case 'text':
      return (
        <TextPart
          key={`t-${ctx.index}`}
          part={part as Extract<AnyPart, { type: 'text' }>}
          role={ctx.message.role as 'user' | 'assistant' | 'system'}
          isStreaming={ctx.isStreaming && ctx.isLast}
          isLast={ctx.isLast}
        />
      )
    case 'reasoning':
      return (
        <ReasoningPart
          key={`r-${ctx.index}`}
          part={part as Extract<AnyPart, { type: 'reasoning' }>}
          isStreaming={ctx.isStreaming && ctx.isLast}
        />
      )
    default:
      return null
  }
}

/** 找到最后一个会被渲染的 part 的原始索引，便于决定 cursor 位置 */
export function findLastRenderableIndex(parts: AnyPart[]): number {
  for (let i = parts.length - 1; i >= 0; i--) {
    if (isRenderablePart(parts[i])) return i
  }
  return -1
}
