'use client'

import type { UIMessage, UIMessagePart } from 'ai'
import type { ReactNode } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useEffect, useMemo, useRef } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { ImportAnalysisToolPart, isImportToolPart } from './import-analysis-tool-part'

interface ImportCharacterAnalysisPanelProps {
  novelId: string
  importText: string
  chapterTitles: string[]
  isComplete?: boolean
  onComplete?: () => void
  onAnalysisStart?: () => void
}

type AnyPart = UIMessagePart<any, any>

function TerminalLine({
  prefix,
  children,
  className,
}: {
  prefix?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex gap-2 whitespace-pre-wrap break-words', className)}>
      {prefix != null && (
        <span className="shrink-0 select-none text-muted-foreground/70">{prefix}</span>
      )}
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  )
}

function renderTerminalPart(
  part: AnyPart,
  ctx: {
    message: UIMessage
    index: number
    novelId: string
    isStreaming: boolean
    isLast: boolean
  },
) {
  const key = `${ctx.message.id}:${ctx.index}`

  if (part.type === 'reasoning') {
    const text = ((part as { text?: string }).text || '').trim()
    if (!text && !ctx.isStreaming) return null
    return (
      <div key={key} className="space-y-0.5 text-muted-foreground/80">
        {text.split('\n').filter(Boolean).map((line, i) => (
          <TerminalLine key={`${key}-r-${i}`} prefix="#">
            {line}
            {ctx.isStreaming && ctx.isLast && i === text.split('\n').filter(Boolean).length - 1 && (
              <span className="inline-block w-[6px] h-[12px] ml-0.5 bg-muted-foreground/50 animate-pulse align-middle" />
            )}
          </TerminalLine>
        ))}
        {!text && ctx.isStreaming && (
          <TerminalLine prefix="#">
            <span className="inline-block w-[6px] h-[12px] bg-muted-foreground/50 animate-pulse" />
          </TerminalLine>
        )}
      </div>
    )
  }

  if (part.type === 'text') {
    const text = ((part as { text?: string }).text || '').trim()
    if (!text && !ctx.isStreaming) return null
    return (
      <div key={key} className="space-y-1 text-foreground/90 pt-1">
        {text.split('\n').map((line, i) => (
          <div key={`${key}-t-${i}`}>{line || '\u00A0'}</div>
        ))}
        {ctx.isStreaming && ctx.isLast && (
          <span className="inline-block w-[6px] h-[12px] bg-foreground/40 animate-pulse" />
        )}
      </div>
    )
  }

  if (isImportToolPart(part)) {
    const toolName = part.type.replace(/^tool-/, '') as 'report_analysis_step' | 'list_characters' | 'create_character' | 'create_relationship'
    return (
      <ImportAnalysisToolPart
        key={key}
        partKey={key}
        novelId={ctx.novelId}
        toolName={toolName}
        state={(part as any).state}
        input={(part as any).input}
        output={(part as any).output}
        errorText={(part as any).errorText}
        variant="terminal"
      />
    )
  }

  return null
}

function ImportTerminalLog({
  message,
  isStreaming,
  novelId,
}: {
  message: UIMessage
  isStreaming?: boolean
  novelId: string
}) {
  const parts = (message.parts || []) as AnyPart[]
  const lastIdx = parts.length - 1

  return (
    <div className="space-y-1.5">
      {parts.map((part, index) => {
        const isLast = index === lastIdx
        const node = renderTerminalPart(part, {
          message,
          index,
          novelId,
          isStreaming: !!isStreaming,
          isLast,
        })
        return node
      })}
    </div>
  )
}

export function ImportCharacterAnalysisPanel({
  novelId,
  importText,
  chapterTitles,
  isComplete = false,
  onComplete,
  onAnalysisStart,
}: ImportCharacterAnalysisPanelProps) {
  const { t } = useI18n()
  const startedRef = useRef(false)
  const completedRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/editor/import-character-analysis/stream',
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: {
            ...body,
            messages,
            novelId,
            importText,
            chapterTitles,
          },
        }),
      }),
    [novelId, importText, chapterTitles],
  )

  const { messages, sendMessage, status, error } = useChat({
    transport,
  })

  const isLoading = status === 'streaming' || status === 'submitted'
  const assistantMessages = messages.filter(m => m.role === 'assistant')
  const streamingMessageId = isLoading ? assistantMessages[assistantMessages.length - 1]?.id : null

  useEffect(() => {
    if (startedRef.current || !importText.trim()) return
    startedRef.current = true
    onAnalysisStart?.()
    sendMessage({ text: t('editor.importChapterDialog.analysis.userPrompt') })
  }, [importText, sendMessage, t, onAnalysisStart])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, status])

  useEffect(() => {
    if (status === 'ready' && startedRef.current && !completedRef.current && messages.length > 1) {
      completedRef.current = true
      onComplete?.()
    }
  }, [status, messages.length, onComplete])

  const statusLabel = isComplete
    ? 'done'
    : isLoading
      ? 'running'
      : error
        ? 'error'
        : 'idle'

  return (
    <div className="flex flex-col flex-1 min-h-0 rounded-lg border border-border overflow-hidden bg-background/80">
      {/* 终端标题栏 */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-border bg-muted/40 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-chart-4/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-chart-2/70" />
        </div>
        <span className="flex-1 text-center text-[10px] font-mono text-muted-foreground truncate">
          agui — character-import-analyzer
        </span>
        <span className={cn(
          'text-[10px] font-mono uppercase tracking-wide',
          statusLabel === 'running' && 'text-primary animate-pulse',
          statusLabel === 'done' && 'text-chart-2',
          statusLabel === 'error' && 'text-destructive',
          statusLabel === 'idle' && 'text-muted-foreground',
        )}
        >
          {statusLabel}
        </span>
      </div>

      {/* 可滚动终端输出区 */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-3 font-mono text-[11px] leading-[1.65] scrollbar-thin"
      >
        <TerminalLine prefix="$" className="text-muted-foreground mb-2">
          init --novel=
          {novelId.slice(0, 8)}
          … --chapters=
          {chapterTitles.length}
        </TerminalLine>

        {assistantMessages.map((message) => (
          <ImportTerminalLog
            key={message.id}
            message={message}
            isStreaming={message.id === streamingMessageId}
            novelId={novelId}
          />
        ))}

        {isLoading && assistantMessages.length === 0 && (
          <TerminalLine prefix=">" className="text-muted-foreground">
            {t('editor.importChapterDialog.analysis.initializing')}
            <span className="inline-block w-[6px] h-[12px] ml-1 bg-muted-foreground/50 animate-pulse align-middle" />
          </TerminalLine>
        )}

        {error && (
          <TerminalLine prefix="✗" className="text-destructive mt-2">
            {t('editor.importChapterDialog.analysis.error')}
          </TerminalLine>
        )}

        {isComplete && (
          <TerminalLine prefix="✓" className="text-chart-2 mt-3">
            {t('editor.importChapterDialog.analysis.completeTitle')}
          </TerminalLine>
        )}
      </div>
    </div>
  )
}
