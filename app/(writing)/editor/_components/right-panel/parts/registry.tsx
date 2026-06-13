'use client'

import type { UIMessage, UIMessagePart } from 'ai'
import type { ReactNode } from 'react'
import { AutoWriteToolPart } from './auto-write-tool-part'
import { AskUserPart } from './ask-user-part'
import { ProposeEditPart } from './propose-edit-part'
import { ReasoningPart } from './reasoning-part'
import { TextPart } from './text-part'
import { isSubagentToolName, SubagentToolPart } from './subagent-tool-part'
import { ParallelSubagentToolPart } from './parallel-subagent-tool-part'
import { isParallelSubagentToolName } from '@/lib/ai/agents/subagents/types'
import { ToolPartFallback } from './tool-part-fallback'
import { ChapterRefPart } from './chapter-ref-part'
import { VolumeRefPart } from './volume-ref-part'
import {
  isChapterRefPart,
  isCharacterRefPart,
  isInlineRefPart,
  isOutlineRefPart,
  isVolumeRefPart,
  isWorldbookRefPart,
} from '@/lib/editor/composer-message'
import { CharacterRefPart } from './character-ref-part'
import { OutlineRefPart } from './outline-ref-part'
import { WorldbookRefPart } from './worldbook-ref-part'

/**
 * AG-UI part 注册表
 *
 * 渲染原则：
 *   - text / reasoning：原有逻辑
 *   - tool-{name}：根据 toolName 派发到专属组件，未命中则用 ToolPartFallback
 *   - tool 类 part 永远独立成块（不进 bubble 合并），保留其完整上下文
 */

export type RenderablePartType = 'text' | 'reasoning' | 'tool'

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

/** 该 part 是否应在 UI 中占位（避免空 text 渲染空白气泡） */
export function hasVisibleContent(
  part: AnyPart,
  ctx: { isStreaming: boolean, index: number, lastIdx: number },
): boolean {
  if (isChapterRefPart(part) || isVolumeRefPart(part)) {
    return Boolean(part.data?.title)
  }
  if (isCharacterRefPart(part)) {
    return Boolean(part.data?.name)
  }
  if (isWorldbookRefPart(part) || isOutlineRefPart(part)) {
    return Boolean(part.data?.title)
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
  novelId: string
  message: UIMessage
  isStreaming: boolean
  index: number
  isLast: boolean
  formKey: string
}

export function renderPart(part: AnyPart, ctx: PartRenderContext): ReactNode {
  if (isChapterRefPart(part)) {
    return (
      <ChapterRefPart
        key={`ch-${ctx.index}`}
        data={part.data}
      />
    )
  }
  if (isVolumeRefPart(part)) {
    return (
      <VolumeRefPart
        key={`vol-${ctx.index}`}
        data={part.data}
      />
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
  if (isWorldbookRefPart(part)) {
    return (
      <WorldbookRefPart
        key={`wb-${ctx.index}`}
        data={part.data}
      />
    )
  }
  if (isOutlineRefPart(part)) {
    return (
      <OutlineRefPart
        key={`ol-${ctx.index}`}
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
  switch (toolName) {
    case 'propose_edit':
      return (
        <ProposeEditPart
          key={`tool-${ctx.index}`}
          partKey={`${ctx.message.id}:${ctx.index}`}
          state={part.state}
          input={part.input}
          output={part.output}
          errorText={part.errorText}
        />
      )
    case 'create_volume':
    case 'create_chapter':
    case 'append_chapter':
    case 'update_chapter':
    case 'update_volume':
    case 'delete_chapter':
    case 'delete_volume':
    case 'create_worldbook_entry':
    case 'update_worldbook_entry':
    case 'delete_worldbook_entry':
    case 'create_outline':
    case 'update_outline':
    case 'delete_outline':
    case 'create_plan_file':
    case 'update_plan_file':
    case 'delete_plan_file':
    case 'create_character_event':
    case 'update_character_event':
    case 'delete_character_event':
      return (
        <AutoWriteToolPart
          key={`tool-${ctx.index}`}
          novelId={ctx.novelId}
          partKey={`${ctx.message.id}:${ctx.index}`}
          toolName={toolName as any}
          state={part.state}
          input={part.input}
          output={part.output}
          errorText={part.errorText}
        />
      )
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
    default:
      if (isParallelSubagentToolName(toolName)) {
        return (
          <ParallelSubagentToolPart
            key={`tool-${ctx.index}`}
            novelId={ctx.novelId}
            partKey={`${ctx.message.id}:${ctx.index}`}
            state={part.state}
            output={part.output}
            errorText={part.errorText}
          />
        )
      }
      if (isSubagentToolName(toolName)) {
        return (
          <SubagentToolPart
            key={`tool-${ctx.index}`}
            novelId={ctx.novelId}
            partKey={`${ctx.message.id}:${ctx.index}`}
            toolName={toolName}
            state={part.state}
            input={part.input}
            output={part.output}
            errorText={part.errorText}
          />
        )
      }
      return <ToolPartFallback key={`tool-${ctx.index}`} part={part} />
  }
}

export function findLastRenderableIndex(parts: AnyPart[]): number {
  for (let i = parts.length - 1; i >= 0; i--) {
    if (isRenderablePart(parts[i])) return i
  }
  return -1
}

/** 消息是否已有可展示的 part（含流式中的空 text/reasoning 占位） */
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
