'use client'

import { Check, Loader2, Pencil, X } from 'lucide-react'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAiEditsStore } from '@/store'
import type { ProposeEditOutput } from './types'

interface ProposeEditPartProps {
  /** 该 part 的稳定 id（messageId + part index）。用于 store 去重 */
  partKey: string
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error' | string
  input?: {
    chapterId?: string
    originalText?: string
    suggestedText?: string
    reasoning?: string
  }
  output?: ProposeEditOutput
  errorText?: string
}

/**
 * 已经 enqueue 过的 partKey；module 级 Set，重挂载/历史回填都不重复入队。
 * （store.enqueue 自身也按 id 去重，这里再加一层是防御性措施。）
 */
const enqueuedKeys = new Set<string>()

export function ProposeEditPart({ partKey, state, input, output, errorText }: ProposeEditPartProps) {
  const enqueue = useAiEditsStore(s => s.enqueue)

  useEffect(() => {
    if (state !== 'output-available') return
    if (!output || !output.ok) return
    if (!output.chapter_id || !output.original_text) return
    if (enqueuedKeys.has(partKey)) return
    enqueuedKeys.add(partKey)

    enqueue({
      id: partKey,
      chapterId: output.chapter_id,
      chapterTitle: output.chapter_title,
      originalText: output.original_text,
      suggestedText: output.suggested_text || '',
      reasoning: output.reasoning,
    })
  }, [state, output, partKey, enqueue])

  const title = output?.chapter_title || '修改建议'
  const reasoning = output?.reasoning || input?.reasoning

  return (
    <div className="rounded-md border border-amber-500/30 bg-amber-500/5 text-[11.5px] my-1.5 overflow-hidden">
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-amber-500/20 bg-amber-500/5">
        <Pencil className="w-3 h-3 text-amber-600" />
        <span className="font-medium text-foreground">编辑器手术刀</span>
        <span className="text-[10px] text-muted-foreground ml-1 truncate">{title}</span>
        <StatusIcon state={state} ok={output?.ok} />
      </div>

      <div className="px-2.5 py-1.5 space-y-1.5">
        {state !== 'output-available' && (
          <div className="text-muted-foreground text-[10.5px]">
            正在分析章节并生成修改建议…
          </div>
        )}

        {output && output.ok && (
          <>
            <DiffPreview before={output.original_text} after={output.suggested_text} />
            {reasoning && (
              <div className="text-[10.5px] text-muted-foreground italic">
                {reasoning}
              </div>
            )}
            <div className="text-[10px] text-emerald-600 flex items-center gap-1">
              <Check className="w-3 h-3" />
              已在编辑器中标注，请审阅后接受或拒绝
            </div>
          </>
        )}

        {output && !output.ok && (
          <div className="text-[10.5px] text-destructive">
            {output.error || '修改失败'}
            {output.hint && <div className="text-muted-foreground mt-0.5">{output.hint}</div>}
          </div>
        )}

        {errorText && (
          <div className="text-[10.5px] text-destructive">{errorText}</div>
        )}
      </div>
    </div>
  )
}

function StatusIcon({ state, ok }: { state: string, ok?: boolean }) {
  if (state === 'output-available') {
    return ok
      ? <Check className="w-3 h-3 text-emerald-500 ml-auto" />
      : <X className="w-3 h-3 text-destructive ml-auto" />
  }
  if (state === 'output-error') return <X className="w-3 h-3 text-destructive ml-auto" />
  return <Loader2 className="w-3 h-3 animate-spin text-muted-foreground ml-auto" />
}

function DiffPreview({ before, after }: { before?: string, after?: string }) {
  if (!before && !after) return null
  return (
    <div className="space-y-1 text-[10.5px] leading-relaxed">
      {before && (
        <div className={cn(
          'rounded px-2 py-1 bg-rose-500/10 text-rose-700 dark:text-rose-300 line-through decoration-rose-500/60',
        )}
        >
          {truncate(before, 200)}
        </div>
      )}
      {after && (
        <div className={cn(
          'rounded px-2 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        )}
        >
          {truncate(after, 200)}
        </div>
      )}
    </div>
  )
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text
  return `${text.slice(0, max)}…`
}
