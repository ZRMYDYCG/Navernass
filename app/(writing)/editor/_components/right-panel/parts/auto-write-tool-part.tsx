'use client'

import { Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useChaptersStore, useTimelineStore, useWorldviewStore } from '@/store'

export type AutoWriteToolName =
  | 'create_volume'
  | 'create_chapter'
  | 'append_chapter'
  | 'update_chapter'
  | 'update_volume'
  | 'delete_chapter'
  | 'delete_volume'
  | 'create_worldbook_entry'
  | 'update_worldbook_entry'
  | 'delete_worldbook_entry'
  | 'create_outline'
  | 'update_outline'
  | 'delete_outline'
  | 'create_character_event'
  | 'update_character_event'
  | 'delete_character_event'

interface AutoWriteToolPartProps {
  /** 该 part 的稳定 id（messageId + part index）。用于全局副作用去重 */
  partKey: string
  toolName: AutoWriteToolName
  state: string
  input?: Record<string, any>
  output?: any
  errorText?: string
}

/**
 * 已经"处理过"的 partKey 集合（store upsert + toast）。
 * Module 级 Set，组件卸载/重挂载/历史消息回填都不会重复触发副作用。
 *
 * 这是关键：历史会话加载时，所有 tool part 的 state 都是 output-available，
 * useEffect 会立即跑——如果不去重，刷新页面会一次性弹 N 条 toast 并重复
 * upsert/remove，导致 store 状态被历史动作覆盖、左侧列表错乱、严重时阻塞渲染。
 */
const processedKeys = new Set<string>()

export function AutoWriteToolPart({ partKey, toolName, state, input, output, errorText }: AutoWriteToolPartProps) {
  const upsertVolume = useChaptersStore(s => s.upsertVolume)
  const upsertChapter = useChaptersStore(s => s.upsertChapter)
  const removeChapter = useChaptersStore(s => s.removeChapter)
  const removeVolume = useChaptersStore(s => s.removeVolume)
  const upsertWorldbookEntry = useWorldviewStore(s => s.upsertWorldbookEntry)
  const removeWorldbookEntry = useWorldviewStore(s => s.removeWorldbookEntry)
  const upsertOutline = useWorldviewStore(s => s.upsertOutline)
  const removeOutline = useWorldviewStore(s => s.removeOutline)
  const upsertEvent = useTimelineStore(s => s.upsertEvent)
  const removeEvent = useTimelineStore(s => s.removeEvent)

  useEffect(() => {
    if (state !== 'output-available') return
    if (processedKeys.has(partKey)) return
    processedKeys.add(partKey)

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
        toast.success(`${TOOL_LABELS[toolName]}:${output.title || ''}`)
        break
      case 'create_chapter':
      case 'update_chapter':
        if (output.chapter) upsertChapter(output.chapter)
        toast.success(`${TOOL_LABELS[toolName]}:${output.title || ''}`)
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
      case 'create_worldbook_entry':
      case 'update_worldbook_entry':
        if (output.entry) upsertWorldbookEntry(output.entry)
        toast.success(`${TOOL_LABELS[toolName]}:${output.title || ''}`)
        break
      case 'delete_worldbook_entry':
        if (output.entry_id) removeWorldbookEntry(output.entry_id)
        toast.success(`已删除世界观条目：${output.title}`, {
          description: output.reason,
        })
        break
      case 'create_outline':
      case 'update_outline':
        if (output.outline) upsertOutline(output.outline)
        toast.success(`${TOOL_LABELS[toolName]}:${output.title || ''}`)
        break
      case 'delete_outline':
        if (output.outline_id) removeOutline(output.outline_id)
        toast.success(`已删除大纲：${output.title}`, {
          description: output.reason,
        })
        break
      case 'create_character_event':
      case 'update_character_event':
        if (output.event) upsertEvent(output.event)
        toast.success(`${TOOL_LABELS[toolName]}:${output.title || ''}`)
        break
      case 'delete_character_event':
        if (output.event_id) removeEvent(output.event_id)
        toast.success(`已删除时间线事件：${output.title}`, {
          description: output.reason,
        })
        break
    }
  }, [
    partKey, state, output, toolName, errorText,
    upsertVolume, upsertChapter, removeChapter, removeVolume,
    upsertWorldbookEntry, removeWorldbookEntry,
    upsertOutline, removeOutline,
    upsertEvent, removeEvent,
  ])

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
    case 'create_worldbook_entry': return `世界观《${output.title}》已创建`
    case 'update_worldbook_entry': return `世界观已更新为《${output.title}》`
    case 'delete_worldbook_entry': return `世界观《${output.title}》已删除`
    case 'create_outline': return `大纲《${output.title}》已创建`
    case 'update_outline': return `大纲已更新为《${output.title}》`
    case 'delete_outline': return `大纲《${output.title}》已删除`
    case 'create_character_event': return `时间线事件《${output.title}》已添加`
    case 'update_character_event': return `时间线事件已更新为《${output.title}》`
    case 'delete_character_event': return `时间线事件《${output.title}》已删除`
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
  create_worldbook_entry: '创建世界观条目',
  update_worldbook_entry: '更新世界观条目',
  delete_worldbook_entry: '删除世界观条目',
  create_outline: '创建大纲',
  update_outline: '更新大纲',
  delete_outline: '删除大纲',
  create_character_event: '添加时间线事件',
  update_character_event: '更新时间线事件',
  delete_character_event: '删除时间线事件',
}

const TOOL_ICONS: Record<AutoWriteToolName, typeof Plus> = {
  create_volume: Plus,
  create_chapter: Plus,
  append_chapter: Plus,
  update_chapter: Pencil,
  update_volume: Pencil,
  delete_chapter: Trash2,
  delete_volume: Trash2,
  create_worldbook_entry: Plus,
  update_worldbook_entry: Pencil,
  delete_worldbook_entry: Trash2,
  create_outline: Plus,
  update_outline: Pencil,
  delete_outline: Trash2,
  create_character_event: Plus,
  update_character_event: Pencil,
  delete_character_event: Trash2,
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
