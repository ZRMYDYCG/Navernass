'use client'

import { Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useChaptersStore } from '@/store'

export type AutoWriteToolName =
  | 'create_volume'
  | 'create_chapter'
  | 'append_chapter'
  | 'update_chapter'
  | 'update_volume'
  | 'delete_chapter'
  | 'delete_volume'

interface AutoWriteToolPartProps {
  toolName: AutoWriteToolName
  state: string
  input?: Record<string, any>
  output?: any
  errorText?: string
}

/**
 * 自治写入/更新/删除类工具的卡片
 *
 * 工具 execute 已经返回足够信息（output.chapter / output.volume / output.chapter_id 等），
 * 前端直接同步 store，不再二次 getById（避免 N+1 网络请求）。
 *
 * - create_*  / append_chapter / update_*  → upsertChapter / upsertVolume
 * - delete_*  → removeChapter / removeVolume
 */
export function AutoWriteToolPart({ toolName, state, input, output, errorText }: AutoWriteToolPartProps) {
  const dispatchedRef = useRef(false)
  const upsertVolume = useChaptersStore(s => s.upsertVolume)
  const upsertChapter = useChaptersStore(s => s.upsertChapter)
  const removeChapter = useChaptersStore(s => s.removeChapter)
  const removeVolume = useChaptersStore(s => s.removeVolume)

  useEffect(() => {
    if (dispatchedRef.current) return
    if (state !== 'output-available') return
    dispatchedRef.current = true

    if (!output?.ok) {
      toast.error(`${TOOL_LABELS[toolName]}失败`, {
        description: output?.error || output?.hint || errorText,
      })
      return
    }

    switch (toolName) {
      case 'create_volume':
      case 'update_volume':
        if (output.volume) upsertVolume(output.volume)
        toast.success(`${TOOL_LABELS[toolName]}：${output.title || ''}`)
        break
      case 'create_chapter':
      case 'update_chapter':
        if (output.chapter) upsertChapter(output.chapter)
        toast.success(`${TOOL_LABELS[toolName]}：${output.title || ''}`)
        break
      case 'append_chapter':
        if (output.chapter) upsertChapter(output.chapter)
        toast.success(`AI 已续写：${output.chapter_title}`, {
          description: output.reasoning,
        })
        break
      case 'delete_chapter':
        if (output.chapter_id) removeChapter(output.chapter_id)
        toast.success(`已删除章节：${output.chapter_title}`, {
          description: output.reason,
        })
        break
      case 'delete_volume':
        if (output.volume_id) removeVolume(output.volume_id)
        toast.success(`已删除卷：${output.volume_title}`, {
          description: output.reason,
        })
        break
    }
  }, [state, output, toolName, errorText, upsertVolume, upsertChapter, removeChapter, removeVolume])

  const Icon = TOOL_ICONS[toolName] || Plus
  const isDelete = toolName.startsWith('delete_')
  const tone = isDelete ? 'rose' : toolName.startsWith('update_') ? 'amber' : 'sky'
  const containerClass =
    tone === 'rose'
      ? 'border-rose-500/30 bg-rose-500/5'
      : tone === 'amber'
        ? 'border-amber-500/30 bg-amber-500/5'
        : 'border-sky-500/30 bg-sky-500/5'
  const headerClass =
    tone === 'rose'
      ? 'border-rose-500/20 text-rose-700 dark:text-rose-300'
      : tone === 'amber'
        ? 'border-amber-500/20 text-amber-700 dark:text-amber-300'
        : 'border-sky-500/20 text-foreground'

  return (
    <div className={`rounded-md border ${containerClass} text-[11.5px] my-1.5 overflow-hidden`}>
      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 border-b ${headerClass}`}>
        <Icon className="w-3 h-3" />
        <span className="font-medium">{TOOL_LABELS[toolName] || toolName}</span>
        <StatusIcon state={state} ok={output?.ok} />
      </div>

      <div className="px-2.5 py-1.5 space-y-1 text-[10.5px]">
        {state !== 'output-available' && (
          <div className="text-muted-foreground">正在执行…</div>
        )}

        {output?.ok && (
          <>
            <div className="text-foreground">{describeSuccess(toolName, output)}</div>
            {(input?.reason || output?.reason || input?.reasoning || output?.reasoning) && (
              <div className="text-muted-foreground italic">
                {input?.reason || output?.reason || input?.reasoning || output?.reasoning}
              </div>
            )}
          </>
        )}

        {output && !output.ok && (
          <div className="text-destructive space-y-0.5">
            <div>{output.error || '操作失败'}</div>
            {output.hint && <div className="text-muted-foreground">{output.hint}</div>}
          </div>
        )}
        {errorText && <div className="text-destructive">{errorText}</div>}
      </div>
    </div>
  )
}

function describeSuccess(toolName: AutoWriteToolName, output: any): string {
  switch (toolName) {
    case 'create_volume': return `卷《${output.title}》已创建`
    case 'update_volume': return `卷已更新为《${output.title}》`
    case 'create_chapter': return `章节《${output.title}》已创建`
    case 'update_chapter': return `章节已更新为《${output.title}》`
    case 'append_chapter': return `已向《${output.chapter_title}》追加内容（共 ${output.new_word_count} 字）`
    case 'delete_chapter': return `章节《${output.chapter_title}》已删除`
    case 'delete_volume': return `卷《${output.volume_title}》已删除`
    default: return '操作成功'
  }
}

const TOOL_LABELS: Record<AutoWriteToolName, string> = {
  create_volume: '创建新卷',
  create_chapter: '创建新章节',
  append_chapter: '续写章节',
  update_chapter: '更新章节',
  update_volume: '更新卷',
  delete_chapter: '删除章节',
  delete_volume: '删除卷',
}

const TOOL_ICONS: Record<AutoWriteToolName, typeof Plus> = {
  create_volume: Plus,
  create_chapter: Plus,
  append_chapter: Plus,
  update_chapter: Pencil,
  update_volume: Pencil,
  delete_chapter: Trash2,
  delete_volume: Trash2,
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
