'use client'

import { Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useI18n } from '@/hooks/use-i18n'
import { useChaptersStore, useNovelChatStore, usePlanStore, useTimelineStore, useWorldviewStore } from '@/store'
import { translateToolLabel, translateToolSuccess } from './tool-i18n'

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
  | 'create_plan_file'
  | 'update_plan_file'
  | 'delete_plan_file'
  | 'create_character_event'
  | 'update_character_event'
  | 'delete_character_event'

interface AutoWriteToolPartProps {
  /** 所属 project，用于避免切换 project 时后台流式 tool 写入错误 store */
  novelId: string
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
 */
const processedKeys = new Set<string>()

export function AutoWriteToolPart({ novelId, partKey, toolName, state, input, output, errorText }: AutoWriteToolPartProps) {
  const { t } = useI18n()
  const activeNovelId = useNovelChatStore(s => s.activeNovelId)
  const currentNovelId = useChaptersStore(s => s.currentNovelId)
  const upsertVolume = useChaptersStore(s => s.upsertVolume)
  const upsertChapter = useChaptersStore(s => s.upsertChapter)
  const removeChapter = useChaptersStore(s => s.removeChapter)
  const removeVolume = useChaptersStore(s => s.removeVolume)
  const upsertWorldbookEntry = useWorldviewStore(s => s.upsertWorldbookEntry)
  const removeWorldbookEntry = useWorldviewStore(s => s.removeWorldbookEntry)
  const upsertOutline = useWorldviewStore(s => s.upsertOutline)
  const removeOutline = useWorldviewStore(s => s.removeOutline)
  const upsertPlanFile = usePlanStore(s => s.upsertPlanFile)
  const removePlanFile = usePlanStore(s => s.removePlanFile)
  const upsertEvent = useTimelineStore(s => s.upsertEvent)
  const removeEvent = useTimelineStore(s => s.removeEvent)

  const label = translateToolLabel(t, toolName)

  useEffect(() => {
    if (state !== 'output-available') return
    if (processedKeys.has(partKey)) return
    // 仅当前激活 project 才执行写入副作用，避免后台流式 tool 污染其他 project
    if (activeNovelId && activeNovelId !== novelId) return

    if (!output?.ok) {
      processedKeys.add(partKey)
      toast.error(t('editor.rightPanel.tools.common.toastFailed', { label }), {
        description: output?.error || output?.hint || errorText,
      })
      return
    }

    processedKeys.add(partKey)

    switch (toolName) {
      case 'create_volume':
      case 'update_volume':
        if (output.volume) upsertVolume(output.volume)
        toast.success(t('editor.rightPanel.tools.common.toastSuccess', {
          label,
          title: output.title || '',
        }))
        break
      case 'create_chapter':
      case 'update_chapter':
        if (output.chapter) {
          if (!currentNovelId || output.chapter.novel_id === currentNovelId) {
            upsertChapter(output.chapter)
          }
        }
        toast.success(t('editor.rightPanel.tools.common.toastSuccess', {
          label,
          title: output.title || '',
        }))
        break
      case 'append_chapter':
        if (output.chapter) {
          if (!currentNovelId || output.chapter.novel_id === currentNovelId) {
            upsertChapter(output.chapter)
          }
        }
        toast.success(t('editor.rightPanel.tools.toast.appendChapter', {
          title: output.chapter_title || '',
        }), {
          description: output.reasoning,
        })
        break
      case 'delete_chapter':
        if (output.chapter_id) removeChapter(output.chapter_id)
        toast.success(t('editor.rightPanel.tools.toast.deleteChapter', {
          title: output.chapter_title || '',
        }), {
          description: output.reason,
        })
        break
      case 'delete_volume':
        if (output.volume_id) removeVolume(output.volume_id)
        toast.success(t('editor.rightPanel.tools.toast.deleteVolume', {
          title: output.volume_title || '',
        }), {
          description: output.reason,
        })
        break
      case 'create_worldbook_entry':
      case 'update_worldbook_entry':
        if (output.entry) upsertWorldbookEntry(output.entry)
        toast.success(t('editor.rightPanel.tools.common.toastSuccess', {
          label,
          title: output.title || '',
        }))
        break
      case 'delete_worldbook_entry':
        if (output.entry_id) removeWorldbookEntry(output.entry_id)
        toast.success(t('editor.rightPanel.tools.toast.deleteWorldbook', {
          title: output.title || '',
        }), {
          description: output.reason,
        })
        break
      case 'create_outline':
      case 'update_outline':
        if (output.outline) upsertOutline(output.outline)
        toast.success(t('editor.rightPanel.tools.common.toastSuccess', {
          label,
          title: output.title || '',
        }))
        break
      case 'delete_outline':
        if (output.outline_id) removeOutline(output.outline_id)
        toast.success(t('editor.rightPanel.tools.toast.deleteOutline', {
          title: output.title || '',
        }), {
          description: output.reason,
        })
        break
      case 'create_plan_file':
      case 'update_plan_file':
        if (output.plan_file) upsertPlanFile(output.plan_file)
        toast.success(t('editor.rightPanel.tools.common.toastSuccess', {
          label,
          title: output.title || output.name || '',
        }))
        break
      case 'delete_plan_file':
        if (output.plan_file_id) removePlanFile(output.plan_file_id)
        toast.success(t('editor.rightPanel.tools.toast.deletePlanFile', {
          title: output.title || '',
        }), {
          description: output.reason,
        })
        break
      case 'create_character_event':
      case 'update_character_event':
        if (output.event) upsertEvent(output.event)
        toast.success(t('editor.rightPanel.tools.common.toastSuccess', {
          label,
          title: output.title || '',
        }))
        break
      case 'delete_character_event':
        if (output.event_id) removeEvent(output.event_id)
        toast.success(t('editor.rightPanel.tools.toast.deleteEvent', {
          title: output.title || '',
        }), {
          description: output.reason,
        })
        break
    }
  }, [
    novelId, activeNovelId, currentNovelId,
    partKey, state, output, toolName, errorText, label, t,
    upsertVolume, upsertChapter, removeChapter, removeVolume,
    upsertWorldbookEntry, removeWorldbookEntry,
    upsertOutline, removeOutline,
    upsertPlanFile, removePlanFile,
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

  const successMessage = output?.ok ? translateToolSuccess(t, toolName, output) : null

  return (
    <div className={`rounded-md border ${containerClass} text-[11px] my-1.5 overflow-hidden`}>
      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 border-b ${headerClass}`}>
        <Icon className="w-3 h-3" />
        <span className="font-medium">{label}</span>
        <StatusIcon state={state} ok={output?.ok} />
      </div>

      <div className="px-2.5 py-1.5 space-y-1 text-[10.5px]">
        {state !== 'output-available' && (
          <div className="text-muted-foreground">{t('editor.rightPanel.tools.common.running')}</div>
        )}

        {output?.ok && successMessage && (
          <>
            <div className="text-foreground">{successMessage}</div>
            {(input?.reason || output?.reason || input?.reasoning || output?.reasoning) && (
              <div className="text-muted-foreground italic">
                {input?.reason || output?.reason || input?.reasoning || output?.reasoning}
              </div>
            )}
          </>
        )}

        {output && !output.ok && (
          <div className="text-destructive space-y-0.5">
            <div>{output.error || t('editor.rightPanel.tools.common.failed')}</div>
            {output.hint && <div className="text-muted-foreground">{output.hint}</div>}
          </div>
        )}
        {errorText && <div className="text-destructive">{errorText}</div>}
      </div>
    </div>
  )
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
  create_plan_file: Plus,
  update_plan_file: Pencil,
  delete_plan_file: Trash2,
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
