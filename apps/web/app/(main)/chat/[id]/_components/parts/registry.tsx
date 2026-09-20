'use client'

import type { UIMessage, UIMessagePart } from 'ai'
import type { ReactNode } from 'react'
import { isBookRefPart, isCharacterRefPart, isInlineRefPart } from '@/lib/editor/composer-message'
import { BookPreviewPopover } from './book-preview-popover'
import { BookRefPart } from './book-ref-part'
import { CharacterRefPart } from './character-ref-part'
import { ProposeCharacterPart } from './propose-character-part'
import { ProposeNovelPart } from './propose-novel-part'
import { ProposeOutlinePart } from './propose-outline-part'
import { ProposeSummaryPart } from './propose-summary-part'
import { AskUserPart, ReasoningPart, TextPart } from './re-exports'
import { ToolPartFallback } from './tool-part-fallback'

/**
 * Chat 页 AG-UI part 注册表
 *
 * 与编辑器版的区别：
 *   - 没有 novelId（Chat 页的桥接工具 novelId 来自 tool call input）
 *   - 工具集换成 ask_user + propose_novel/character/outline/summary
 *   - book / character 引用仍保留：用户消息可以 @book（hover 弹预览卡）
 */

export type RenderablePartType = 'text' | 'reasoning' | 'tool' | 'inlineRef'

type AnyPart = UIMessagePart<any, any>

function isToolPart(part: AnyPart): boolean {
  return typeof part?.type === 'string' && part.type.startsWith('tool-')
}

export function isRenderablePart(part: AnyPart): boolean {
  return part.type === 'text' || part.type === 'reasoning' || isToolPart(part) || isInlineRefPart(part)
}

/** text / 内联引用块进入同一气泡（与输入框内联顺序一致） */
export function isBubblePart(part: AnyPart): boolean {
  return part.type === 'text' || isInlineRefPart(part)
}

export function hasVisibleContent(
  part: AnyPart,
  ctx: { isStreaming: boolean, index: number, lastIdx: number },
): boolean {
  if (isBookRefPart(part)) {
    return Boolean(part.data?.title)
  }
  if (isCharacterRefPart(part)) {
    return Boolean(part.data?.name)
  }
  if (part.type === 'text') {
    const text = ((part as { text?: string }).text || '').trim()
    const isPartStreaming = ctx.isStreaming && ctx.index === ctx.lastIdx
    return text.length > 0 || isPartStreaming
  }
  if (part.type === 'reasoning') {
    const text = ((part as { text?: string }).text || '').trim()
    const isPartStreaming = ctx.isStreaming && ctx.index === ctx.lastIdx
    return text.length > 0 || isPartStreaming
  }
  return true
}

export interface PartRenderContext {
  message: UIMessage
  isStreaming: boolean
  index: number
  isLast: boolean
  formKey: string
}

export function renderPart(part: AnyPart, ctx: PartRenderContext): ReactNode {
  if (isBookRefPart(part)) {
    return (
      <BookPreviewPopover
        key={`book-${ctx.index}`}
        bookId={part.data.id}
        title={part.data.title}
      >
        <BookRefPart data={part.data} />
      </BookPreviewPopover>
    )
  }
  if (isCharacterRefPart(part)) {
    return (
      <CharacterRefPart
        key={`char-${ctx.index}`}
        data={part.data}
      />
    )
  }
  if (part.type === 'text') {
    return (
      <TextPart
        key={`t-${ctx.index}`}
        part={part as Extract<AnyPart, { type: 'text' }>}
        role={ctx.message.role as 'user' | 'assistant' | 'system'}
        isStreaming={ctx.isStreaming && ctx.isLast}
      />
    )
  }
  if (part.type === 'reasoning') {
    return (
      <ReasoningPart
        key={`r-${ctx.index}`}
        part={part as Extract<AnyPart, { type: 'reasoning' }>}
        isStreaming={ctx.isStreaming && ctx.isLast}
      />
    )
  }
  if (isToolPart(part)) {
    return renderToolPart(part as any, ctx)
  }
  return null
}

function renderToolPart(part: any, ctx: PartRenderContext): ReactNode {
  const toolName: string = part.type.replace(/^tool-/, '')
  const toolCallId: string | undefined = part.toolCallId
  switch (toolName) {
    case 'ask_user':
      return (
        <AskUserPart
          key={`tool-${ctx.index}`}
          formKey={ctx.formKey}
          state={part.state}
          input={part.input}
          output={part.output}
          errorText={part.errorText}
        />
      )
    case 'propose_novel':
      return (
        <ProposeNovelPart
          key={`tool-${ctx.index}`}
          toolCallId={toolCallId || `${ctx.message.id}-${ctx.index}`}
          state={part.state}
          input={part.input}
          output={part.output}
          errorText={part.errorText}
        />
      )
    case 'propose_character':
      return (
        <ProposeCharacterPart
          key={`tool-${ctx.index}`}
          toolCallId={toolCallId || `${ctx.message.id}-${ctx.index}`}
          state={part.state}
          input={part.input}
          output={part.output}
          errorText={part.errorText}
        />
      )
    case 'propose_outline':
      return (
        <ProposeOutlinePart
          key={`tool-${ctx.index}`}
          toolCallId={toolCallId || `${ctx.message.id}-${ctx.index}`}
          state={part.state}
          input={part.input}
          output={part.output}
          errorText={part.errorText}
        />
      )
    case 'propose_summary':
      return (
        <ProposeSummaryPart
          key={`tool-${ctx.index}`}
          toolCallId={toolCallId || `${ctx.message.id}-${ctx.index}`}
          state={part.state}
          input={part.input}
          output={part.output}
          errorText={part.errorText}
        />
      )
    default:
      return <ToolPartFallback key={`tool-${ctx.index}`} part={part} />
  }
}

export function findLastRenderableIndex(parts: AnyPart[]): number {
  for (let i = parts.length - 1; i >= 0; i--) {
    if (isRenderablePart(parts[i])) return i
  }
  return -1
}

export function messageHasVisibleContent(message: UIMessage, messageIsStreaming: boolean): boolean {
  const parts = (message.parts || []) as AnyPart[]
  const lastIdx = findLastRenderableIndex(parts)
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (!isRenderablePart(part)) continue
    if (hasVisibleContent(part, { isStreaming: messageIsStreaming, index: i, lastIdx })) {
      return true
    }
  }
  return false
}
