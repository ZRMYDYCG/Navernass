'use client'

import type { ReactNode } from 'react'
import { Mic, PlaneTakeoff, Send } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

interface SendIconSwapProps {
  compact?: boolean
}

/** hover 时 Send → PlaneTakeoff 切换 */
function SendIconSwap({ compact }: SendIconSwapProps) {
  const iconClass = compact ? 'w-3.5 h-3.5' : 'w-4 h-4'

  return (
    <span className={cn('relative block shrink-0', compact ? 'size-3.5' : 'size-4')}>
      <Send
        className={cn(
          iconClass,
          'absolute inset-0 transition-all duration-300 ease-out',
          'group-hover/send:opacity-0 group-hover/send:-translate-y-1 group-hover/send:translate-x-0.5 group-hover/send:scale-75',
        )}
        aria-hidden
      />
      <PlaneTakeoff
        className={cn(
          iconClass,
          'absolute inset-0 opacity-0 scale-75 translate-y-1 -translate-x-0.5',
          'transition-all duration-300 ease-out',
          'group-hover/send:opacity-100 group-hover/send:translate-y-0 group-hover/send:translate-x-0 group-hover/send:scale-100',
        )}
        aria-hidden
      />
    </span>
  )
}

export interface AiChatInputProps {
  value?: string
  onChange?: (value: string) => void
  onSend: (message: string) => void | Promise<void>
  placeholder?: string
  disabled?: boolean
  isSending?: boolean
  /** 输入框上方引用区：章节标签、问卷引用等 */
  references?: ReactNode
  /** 卡片底部工具栏：模式、模型、章节选择等 */
  toolbar?: ReactNode
  showVoice?: boolean
  centered?: boolean
  variant?: 'default' | 'compact'
  className?: string
  maxHeight?: number
}

export function AiChatInput({
  value,
  onChange,
  onSend,
  placeholder,
  disabled = false,
  isSending = false,
  references,
  toolbar,
  showVoice = false,
  centered = false,
  variant = 'default',
  className,
  maxHeight,
}: AiChatInputProps) {
  const { t } = useI18n()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [internalValue, setInternalValue] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const isControlled = value !== undefined
  const text = isControlled ? value : internalValue
  const isCompact = variant === 'compact'
  const resolvedMaxHeight = maxHeight ?? (isCompact ? 96 : 180)
  const minTextareaHeight = isCompact ? 24 : 56
  const canSend = text.trim().length > 0 && !disabled && !isSending

  const setText = useCallback((next: string) => {
    if (!isControlled) setInternalValue(next)
    onChange?.(next)
  }, [isControlled, onChange])

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const scrollHeight = el.scrollHeight
    const newHeight = Math.max(minTextareaHeight, Math.min(scrollHeight, resolvedMaxHeight))
    el.style.height = `${newHeight}px`
    el.style.overflowY = scrollHeight > resolvedMaxHeight ? 'auto' : 'hidden'
  }, [resolvedMaxHeight, minTextareaHeight])

  useEffect(() => {
    adjustHeight()
  }, [text, adjustHeight])

  const handleSend = async () => {
    if (!canSend) return
    const message = text.trim()
    try {
      await Promise.resolve(onSend(message))
      setText('')
      requestAnimationFrame(() => adjustHeight())
    } finally {
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  return (
    <div className={cn('w-full', centered && 'mx-auto max-w-4xl', className)}>
      <div
        className={cn(
          'bg-card rounded-xl border border-border transition-all flex flex-col focus-within:border-ring focus-within:shadow-sm',
        )}
      >
        {references ? (
          <div className={cn('border-b border-border/50', isCompact ? 'px-2.5 pt-2 pb-1.5' : 'px-3 pt-3 pb-2')}>
            {references}
          </div>
        ) : null}

        <div
          className={cn(
            'flex gap-2',
            isCompact ? 'items-end px-2.5 py-2' : 'items-center px-4 py-4',
          )}
        >
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              adjustHeight()
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? t('chat.input.placeholder')}
            disabled={disabled}
            rows={1}
            className={cn(
              'input-area-scrollbar flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 p-0',
              'text-foreground placeholder:text-muted-foreground leading-relaxed',
              isCompact ? 'min-h-0 text-[13px]' : 'min-h-[56px] text-base font-serif',
            )}
            style={{ maxHeight: resolvedMaxHeight }}
          />

          <div className={cn('flex shrink-0 items-center gap-1.5', isCompact && 'pb-0.5')}>
            {showVoice ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsRecording(v => !v)}
                disabled={disabled}
                className={cn(
                  'text-muted-foreground hover:text-foreground hover:bg-accent rounded-full',
                  isCompact ? 'h-8 w-8' : 'h-9 w-9',
                  isRecording && 'text-destructive animate-pulse',
                )}
                aria-label={t('chat.input.voice')}
              >
                <Mic className={cn(isCompact ? 'w-4 h-4' : 'w-5 h-5')} />
              </Button>
            ) : null}

            <Button
              type="button"
              onClick={() => void handleSend()}
              disabled={!canSend}
              size="icon"
              className={cn(
                'group/send bg-primary text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed transition-all duration-300',
                isCompact ? 'h-8 w-8 rounded-md' : 'h-9 w-9 rounded-lg',
                canSend && [
                  'shadow-[0_0_10px_color-mix(in_oklab,var(--primary)_32%,transparent)]',
                  'hover:shadow-[0_0_16px_color-mix(in_oklab,var(--primary)_48%,transparent)]',
                ],
                isSending
                  ? 'disabled:opacity-100'
                  : 'disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none',
              )}
              aria-busy={isSending}
              aria-label={t('chat.input.send')}
              title={t('chat.input.send')}
            >
              {isSending
                ? (
                    <span className="block w-3 h-3 bg-current rounded-sm animate-pulse" />
                  )
                : (
                    <SendIconSwap compact={isCompact} />
                  )}
            </Button>
          </div>
        </div>

        {toolbar ? (
          <div
            className={cn(
              'flex flex-wrap items-center gap-2 border-t border-border/50',
              isCompact ? 'px-2.5 py-1.5' : 'px-3 py-2',
            )}
          >
            {toolbar}
          </div>
        ) : null}
      </div>
    </div>
  )
}
