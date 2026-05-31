'use client'

import { PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/use-i18n'

interface StreamLoadingProps {
  className?: string
  /** inline：嵌在文本流里；card：等待首字时的独立块 */
  variant?: 'inline' | 'card'
}

/** 流式输出等待态：纸感墨滴 + 手写提示，替代块状光标 */
export function StreamLoading({ className, variant = 'inline' }: StreamLoadingProps) {
  const { t } = useI18n()

  if (variant === 'card') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-0.5 py-1',
          'animate-in fade-in-0 slide-in-from-bottom-1 duration-300',
          className,
        )}
        role="status"
        aria-label={t('editor.rightPanel.streaming')}
      >
        <PenLine className="w-3 h-3 text-primary agui-pen-sway shrink-0" aria-hidden />
        <span className="inline-flex items-center gap-1" aria-hidden>
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="agui-ink-drop h-1.5 w-1.5 rounded-full bg-primary"
              style={{ animationDelay: `${i * 140}ms` }}
            />
          ))}
        </span>
        <span className="font-handwriting text-[12px] text-muted-foreground leading-none">
          {t('editor.rightPanel.streaming')}
        </span>
      </div>
    )
  }

  return (
    <span
      className={cn('inline-flex items-center gap-1 align-middle', className)}
      role="status"
      aria-label={t('editor.rightPanel.streaming')}
    >
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="agui-ink-drop h-1.5 w-1.5 rounded-full bg-primary/80"
          style={{ animationDelay: `${i * 140}ms` }}
          aria-hidden
        />
      ))}
    </span>
  )
}
