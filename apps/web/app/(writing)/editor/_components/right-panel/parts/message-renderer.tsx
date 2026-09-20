'use client'

import type { UIMessage, UIMessagePart } from 'ai'
import { memo } from 'react'
import { cn } from '@/lib/utils'
import { TypingIndicator } from '../typing-indicator'
import { findLastRenderableIndex, hasVisibleContent, isBubblePart, isRenderablePart, renderPart } from './registry'
import { getMessageStreamFingerprint, shouldShowStreamTailActivity } from './stream-activity'
import { StreamLoading } from './stream-loading'
import { useStreamStale } from './use-stream-stale'

interface MessageRendererProps {
  novelId: string
  message: UIMessage
  /** 该消息是否处于流式状态（仅最新 assistant 消息为 true） */
  isStreaming?: boolean
}

type AnyPart = UIMessagePart<any, any>

/**
 * AG-UI 消息渲染器：按 parts 出现的时间顺序分组渲染。
 *
 * 分组规则：
 * - 连续的 bubble part（目前仅 text）合并到一个气泡块。
 * - 非 bubble part（reasoning 等）独立成块，会打断气泡分组。
 * 这样 reasoning 与 text 可以严格按到达顺序交错呈现。
 */
function MessageRendererInner({ novelId, message, isStreaming = false }: MessageRendererProps) {
  const isUser = message.role === 'user'

  const parts = (message.parts || []) as AnyPart[]
  const lastIdx = findLastRenderableIndex(parts)

  // 分组：将连续的 bubble part 合并成一个 group
  type Group =
    | { kind: 'bubble', items: { part: AnyPart, index: number }[] }
    | { kind: 'standalone', part: AnyPart, index: number }
  const groups: Group[] = []
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (!isRenderablePart(part)) continue
    if (!hasVisibleContent(part, { isStreaming, index: i, lastIdx })) continue
    if (isBubblePart(part)) {
      const tail = groups[groups.length - 1]
      if (tail && tail.kind === 'bubble') {
        tail.items.push({ part, index: i })
      } else {
        groups.push({ kind: 'bubble', items: [{ part, index: i }] })
      }
    } else {
      groups.push({ kind: 'standalone', part, index: i })
    }
  }

  const showTailActivity = !isUser && shouldShowStreamTailActivity(parts, isStreaming)
  const streamFingerprint = getMessageStreamFingerprint(parts)
  const isStreamStale = useStreamStale(isStreaming && !isUser, streamFingerprint)
  const tailTone = showTailActivity
    ? (isStreamStale ? 'thinking' as const : 'continuing' as const)
    : 'streaming' as const

  // 首字未到达：在消息位内展示落笔指示（ChatGPT/Cursor 风格）
  if (groups.length === 0) {
    if (!isStreaming || isUser) return null
    return (
      <div className="py-1 animate-in fade-in-0 slide-in-from-bottom-1 duration-200 flex justify-start">
        <TypingIndicator />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'py-1 animate-in fade-in-0 slide-in-from-bottom-1 duration-200',
        isUser ? 'flex justify-end' : 'flex justify-start',
      )}
    >
      <div
        className={cn(
          isUser
            ? 'max-w-[85%] sm:max-w-md lg:max-w-lg ml-auto flex justify-end'
            : 'w-full min-w-0 flex-1 flex justify-start',
        )}
      >
        <div className={cn('space-y-1', isUser ? 'w-fit max-w-full' : 'w-full')}>
          {groups.map((group, gi) => {
            if (group.kind === 'bubble') {
              if (group.items.length === 0) return null
              return (
                <div
                  key={`g-${gi}`}
                  className={cn(
                    'text-[12px] text-foreground transition-all duration-200',
                    isUser
                      ? 'rounded-lg px-2.5 py-1.5 bg-secondary w-fit max-w-full flex flex-wrap items-center gap-x-0.5 gap-y-1'
                      : 'px-0.5 py-0.5 agui-assistant-stream',
                  )}
                >
                  {group.items.map(({ part, index }) =>
                    renderPart(part, {
                      novelId,
                      message,
                      isStreaming,
                      index,
                      isLast: index === lastIdx,
                      formKey: `${message.id}-${index}`,
                    }),
                  )}
                </div>
              )
            }
            return (
              <div key={`g-${gi}`}>
                {renderPart(group.part, {
                  novelId,
                  message,
                  isStreaming,
                  index: group.index,
                  isLast: group.index === lastIdx,
                  formKey: `${message.id}-${group.index}`,
                })}
              </div>
            )
          })}
          {showTailActivity ? (
            <div className="pt-1 pl-0.5">
              <StreamLoading variant="card" tone={tailTone} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export const MessageRenderer = memo(MessageRendererInner)
