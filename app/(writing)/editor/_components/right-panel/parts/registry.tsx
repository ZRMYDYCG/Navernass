'use client'

import type { UIMessage, UIMessagePart } from 'ai'
import type { ReactNode } from 'react'
import { AutoWriteToolPart } from './auto-write-tool-part'
import { AskUserPart } from './ask-user-part'
import { ProposeEditPart } from './propose-edit-part'
import { ReasoningPart } from './reasoning-part'
import { TextPart } from './text-part'
import { ToolPartFallback } from './tool-part-fallback'

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
  return part.type === 'text' || part.type === 'reasoning' || isToolPart(part)
}

/** 仅 text part 进入气泡合并 */
export function isBubblePart(part: AnyPart): boolean {
  return part.type === 'text'
}

export interface PartRenderContext {
  message: UIMessage
  isStreaming: boolean
  index: number
  isLast: boolean
  formKey: string
}

export function renderPart(part: AnyPart, ctx: PartRenderContext): ReactNode {
  if (part.type === 'text') {
    return (
      <TextPart
        key={`t-${ctx.index}`}
        part={part as Extract<AnyPart, { type: 'text' }>}
        role={ctx.message.role as 'user' | 'assistant' | 'system'}
        isStreaming={ctx.isStreaming && ctx.isLast}
        isLast={ctx.isLast}
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
      return (
        <AutoWriteToolPart
          key={`tool-${ctx.index}`}
          toolName={toolName as 'create_volume' | 'create_chapter' | 'append_chapter' | 'update_chapter' | 'update_volume' | 'delete_chapter' | 'delete_volume'}
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
      return <ToolPartFallback key={`tool-${ctx.index}`} part={part} />
  }
}

export function findLastRenderableIndex(parts: AnyPart[]): number {
  for (let i = parts.length - 1; i >= 0; i--) {
    if (isRenderablePart(parts[i])) return i
  }
  return -1
}
