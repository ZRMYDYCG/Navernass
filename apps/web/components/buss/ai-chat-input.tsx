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
  /** @deprecated 请使用 inputLeading，在输入框内部展示附件激活块 */
  references?: ReactNode
  /** 输入框内部顶部：章节激活块等（Cursor 式内嵌附件） */
  inputLeading?: ReactNode
  /** 拖放章节等到输入区 */
  onInputDrop?: (event: React.DragEvent<HTMLDivElement>) => void
  hasChapterDrop?: (dataTransfer: DataTransfer) => boolean
  isInputDropActive?: boolean
  onInputDragStateChange?: (active: boolean) => void
  /** 卡片底部工具栏：模式、模型、章节选择等 */
  toolbar?: ReactNode
  showVoice?: boolean
  centered?: boolean
  variant?: 'default' | 'compact'
  className?: string
  maxHeight?: number
  /** 自定义输入区（如内联 @ 提及编辑器），替换 textarea */
  inputSlot?: ReactNode
  canSendOverride?: boolean
}

export function AiChatInput({
  value,
  onChange,
  onSend,
  placeholder,
  disabled = false,
  isSending = false,
  references,
  inputLeading,
  onInputDrop,
  hasChapterDrop,
  isInputDropActive = false,
  onInputDragStateChange,
  toolbar,
  showVoice = false,
  centered = false,
  variant = 'default',
  className,
  maxHeight,
  inputSlot,
  canSendOverride,
}: AiChatInputProps) {
  const { t } = useI18n()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [internalValue, setInternalValue] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const isControlled = value !== undefined
  const text = isControlled ? value : internalValue
  const isCompact = variant === 'compact'
  const resolvedMaxHeight = maxHeight ?? (isCompact ? 168 : 180)
  const minTextareaHeight = isCompact ? 72 : 56
  const canSend = (canSendOverride ?? text.trim().length > 0) && !disabled && !isSending

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
    const message = inputSlot ? undefined : text.trim()
    try {
      await Promise.resolve(onSend(message ?? text.trim()))
      if (!inputSlot) {
        setText('')
        requestAnimationFrame(() => adjustHeight())
      }
    } finally {
      if (!inputSlot) textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const canAcceptDrop = Boolean(onInputDrop && hasChapterDrop)

  const handleInputDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (!canAcceptDrop || !hasChapterDrop!(e.dataTransfer)) return
    e.preventDefault()
    onInputDragStateChange?.(true)
  }

  const handleInputDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!canAcceptDrop || !hasChapterDrop!(e.dataTransfer)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    onInputDragStateChange?.(true)
  }

  const handleInputDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!canAcceptDrop) return
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    onInputDragStateChange?.(false)
  }

  const handleInputDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!canAcceptDrop || !hasChapterDrop!(e.dataTransfer)) return
    e.preventDefault()
    onInputDragStateChange?.(false)
    onInputDrop!(e)
  }

  const leading = inputLeading ?? references

  return (
    <div className={cn('w-full', centered && 'mx-auto max-w-4xl', className)}>
      <div
        className={cn(
          'bg-card rounded-xl border border-border overflow-hidden flex flex-col',
          'transition-[border-color,box-shadow] duration-200',
          'focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/25 focus-within:shadow-paper-sm',
        )}
      >
        <div
          className={cn(
            'relative',
            isCompact ? 'min-h-[96px] px-3 py-3' : 'px-4 py-4',
            canAcceptDrop && isInputDropActive && 'bg-accent/30 ring-1 ring-inset ring-ring/30',
          )}
          onDragEnter={canAcceptDrop ? handleInputDragEnter : undefined}
          onDragOver={canAcceptDrop ? handleInputDragOver : undefined}
          onDragLeave={canAcceptDrop ? handleInputDragLeave : undefined}
          onDrop={canAcceptDrop ? handleInputDrop : undefined}
        >
          {inputSlot ?? (
            <>
              {leading ? (
                <div className="mb-2">
                  {leading}
                </div>
              ) : null}
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
                rows={isCompact ? 3 : 1}
                className={cn(
                  'input-area-scrollbar w-full resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 p-0',
                  'text-foreground placeholder:text-muted-foreground/80',
                  leading ? 'mt-2' : '',
                  isCompact
                    ? 'min-h-[72px] text-sm leading-relaxed'
                    : 'min-h-[56px] text-base font-serif leading-relaxed',
                )}
                style={{ maxHeight: resolvedMaxHeight }}
              />
            </>
          )}
        </div>

        {toolbar ? (
          <div
            className={cn(
              'flex flex-wrap items-center gap-1.5 border-t border-border/60 bg-muted/25',
              isCompact ? 'px-2.5 py-2' : 'px-3 py-2',
            )}
          >
            {toolbar}
          </div>
        ) : null}

        <div
          className={cn(
            'flex items-center gap-2 border-t border-border/60',
            isCompact ? 'px-2.5 py-2' : 'px-3 py-2.5',
          )}
        >
          {showVoice ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsRecording(v => !v)}
              disabled={disabled}
              className={cn(
                'shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full',
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
            className={cn(
              'group/send flex-1 w-full min-w-0 gap-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed transition-colors duration-200',
              isCompact ? 'h-9 rounded-md text-sm' : 'h-10 rounded-lg text-sm',
              isSending
                ? 'disabled:opacity-100'
                : 'disabled:bg-muted disabled:text-muted-foreground',
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
                  <>
                    <SendIconSwap compact={isCompact} />
                    <span>{t('chat.input.sendLabel')}</span>
                  </>
                )}
          </Button>
        </div>
      </div>
    </div>
  )
}
