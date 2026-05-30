'use client'

import type { UIMessage, UIMessagePart } from 'ai'
import { useTheme } from 'next-themes'
import { memo, useMemo } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { findLastRenderableIndex, isBubblePart, isRenderablePart, renderPart } from './registry'

interface MessageRendererProps {
  message: UIMessage
  /** 该消息是否处于流式状态（仅最新 assistant 消息为 true） */
  isStreaming?: boolean
  /** 用户头像 URL */
  userAvatar?: string | null
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
function MessageRendererInner({ message, isStreaming = false, userAvatar }: MessageRendererProps) {
  const { t } = useI18n()
  const { theme } = useTheme()
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  const avatarSrc = useMemo(() => {
    return theme === 'dark' ? '/assets/svg/logo-light.svg' : '/assets/svg/logo-dark.svg'
  }, [theme])

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

  // 没有可渲染内容、且不在流式过程中：不渲染
  if (groups.length === 0 && !isStreaming) return null

  const hasVisibleText = parts.some(p => p.type === 'text' && (p as { text?: string }).text && (p as { text: string }).text.length > 0)

  return (
    <div className={`flex gap-1.5 py-1 animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* 头像区：只要有文本气泡就显示，避免与 reasoning 卡片重复 */}
      <div className="shrink-0 w-5">
        {hasVisibleText && isAssistant && (
          <Avatar className="w-5 h-5 transition-transform duration-200 hover:scale-110">
            <img src={avatarSrc} alt={t('editor.aiAvatarAlt')} className="w-full h-full object-cover" />
          </Avatar>
        )}
        {hasVisibleText && isUser && userAvatar && (
          <Avatar className="w-5 h-5 transition-transform duration-200 hover:scale-110">
            <img src={userAvatar} alt={t('editor.rightPanel.userAvatarAlt')} className="w-full h-full object-cover" />
          </Avatar>
        )}
      </div>

      <div
        className={cn(
          'max-w-[85%] sm:max-w-md lg:max-w-lg',
          isUser ? 'ml-auto flex justify-end' : 'min-w-0 flex-1 flex justify-start',
        )}
      >
        <div className={cn('space-y-1', isUser ? 'w-fit max-w-full' : 'w-full')}>
          {groups.map((group, gi) => {
            if (group.kind === 'bubble') {
              return (
                <div
                  key={`g-${gi}`}
                  className={cn(
                    'rounded-lg px-2.5 py-1.5 text-[12px] bg-secondary text-foreground transition-all duration-200',
                    isUser && 'w-fit max-w-full',
                  )}
                >
                  {group.items.map(({ part, index }) =>
                    renderPart(part, {
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
                  message,
                  isStreaming,
                  index: group.index,
                  isLast: group.index === lastIdx,
                  formKey: `${message.id}-${group.index}`,
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export const MessageRenderer = memo(MessageRendererInner)
