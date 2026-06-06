'use client'

import type { CharacterEventType, CharacterTimelineEvent, NovelCharacter } from '@/lib/supabase/sdk'
import {
  Award,
  Heart,
  Loader2,
  MessageCircle,
  Plus,
  Skull,
  Sparkles,
  Sword,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { characterTimelineApi } from '@/lib/supabase/sdk'
import { cn } from '@/lib/utils'
import { selectEventsForCharacter, useAppStore } from '@/store'

const EVENT_META: Record<CharacterEventType, { label: string, icon: React.ComponentType<{ className?: string }>, color: string }> = {
  appearance: { label: '登场', icon: Sparkles, color: 'text-sky-500' },
  milestone: { label: '里程碑', icon: Award, color: 'text-amber-500' },
  relation: { label: '关系', icon: Heart, color: 'text-rose-500' },
  conflict: { label: '冲突', icon: Sword, color: 'text-orange-500' },
  growth: { label: '成长', icon: TrendingUp, color: 'text-emerald-500' },
  death: { label: '退场', icon: Skull, color: 'text-zinc-500' },
  other: { label: '其他', icon: MessageCircle, color: 'text-muted-foreground' },
}

interface TimelinePanelProps {
  novelId: string
  character: NovelCharacter | null
  onClose?: () => void
  onOpenScriptChat?: () => void
}

/**
 * 角色时间线面板（角色面板的右侧抽屉）
 *
 * 数据：useAppStore（timeline slice，按 characterId 索引），CRUD 同步 store。
 * 角色剧本 Agent 通过 AutoWriteToolPart 也写入此 store，AI 改完事件 UI 立刻同步。
 */
export function TimelinePanel({ novelId, character, onClose, onOpenScriptChat }: TimelinePanelProps) {
  const events = useAppStore(
    useShallow(character ? selectEventsForCharacter(character.id) : () => []),
  )
  const hydratedCharacters = useAppStore(s => s.timeline.hydratedCharacters)
  const hydrate = useAppStore(s => s.timelineActions.hydrateForCharacter)
  const upsert = useAppStore(s => s.timelineActions.upsertEvent)
  const remove = useAppStore(s => s.timelineActions.removeEvent)

  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!character) return
    if (hydratedCharacters.has(character.id)) return
    let cancelled = false
    setLoading(true)
    characterTimelineApi.listByCharacter(character.id)
      .then((list) => {
        if (cancelled) return
        hydrate(character.id, list)
      })
      .catch((err) => {
        console.error(err)
        toast.error('加载时间线失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [character, hydratedCharacters, hydrate])

  if (!character) {
    return (
      <div className="h-full flex items-center justify-center text-[12px] text-muted-foreground p-4">
        选择一个角色查看时间线
      </div>
    )
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条时间线事件吗？')) return
    try {
      await characterTimelineApi.delete(id)
      remove(id)
      toast.success('已删除')
    } catch (err) {
      console.error(err)
      toast.error('删除失败')
    }
  }

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-medium text-foreground truncate">
            {character.name} · 时间线
          </div>
          {character.role && (
            <div className="text-[10px] text-muted-foreground truncate">{character.role}</div>
          )}
        </div>
        {onOpenScriptChat && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-[11px] gap-1"
            onClick={onOpenScriptChat}
          >
            <MessageCircle className="w-3 h-3" />
            剧本助手
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-[11px] gap-1"
          onClick={() => setCreating(true)}
        >
          <Plus className="w-3 h-3" />
          新建
        </Button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
            title="关闭"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-none">
        {loading
          ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            )
          : events.length === 0
            ? (
                <div className="text-center text-[11px] text-muted-foreground py-8">
                  尚无时间线事件
                </div>
              )
            : (
                <div className="relative pl-5">
                  {/* 竖直时间轴 */}
                  <div className="absolute left-1.5 top-1 bottom-1 w-px bg-border" />

                  <div className="space-y-3">
                    {events.map(event => (
                      <TimelineEntry
                        key={event.id}
                        event={event}
                        isEditing={editingId === event.id}
                        novelId={novelId}
                        characterId={character.id}
                        onStartEdit={() => setEditingId(event.id)}
                        onCancelEdit={() => setEditingId(null)}
                        onSaved={(updated) => {
                          upsert(updated)
                          setEditingId(null)
                        }}
                        onDelete={() => handleDelete(event.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
      </div>

      {creating && (
        <TimelineEditor
          novelId={novelId}
          characterId={character.id}
          onSaved={(created) => {
            upsert(created)
            setCreating(false)
          }}
          onCancel={() => setCreating(false)}
        />
      )}
    </div>
  )
}

function TimelineEntry({
  event,
  isEditing,
  novelId,
  characterId,
  onStartEdit,
  onCancelEdit,
  onSaved,
  onDelete,
}: {
  event: CharacterTimelineEvent
  isEditing: boolean
  novelId: string
  characterId: string
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaved: (updated: CharacterTimelineEvent) => void
  onDelete: () => void
}) {
  if (isEditing) {
    return (
      <TimelineEditor
        novelId={novelId}
        characterId={characterId}
        initial={event}
        onSaved={onSaved}
        onCancel={onCancelEdit}
      />
    )
  }

  const meta = EVENT_META[event.event_type] || EVENT_META.other
  const Icon = meta.icon

  return (
    <div className="relative group">
      {/* 节点圆点 */}
      <div className={cn(
        'absolute -left-[14px] top-1.5 w-3 h-3 rounded-full bg-background border-2 flex items-center justify-center',
        'border-current',
        meta.color,
      )}
      >
        <Icon className="w-2 h-2" />
      </div>

      <div
        className="rounded-md border border-border bg-background hover:border-foreground/30 px-2.5 py-1.5 transition-colors cursor-pointer"
        onClick={onStartEdit}
      >
        <div className="flex items-start gap-1.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={cn('text-[9px] px-1 py-0.5 rounded bg-muted', meta.color)}>
                {meta.label}
              </span>
              {event.occurred_at_label && (
                <span className="text-[9.5px] text-muted-foreground">
                  {event.occurred_at_label}
                </span>
              )}
              <h4 className="text-[12px] font-medium text-foreground truncate">{event.title}</h4>
            </div>
            {event.description && (
              <p className="text-[10.5px] text-muted-foreground mt-0.5 line-clamp-2 whitespace-pre-wrap">
                {event.description}
              </p>
            )}
          </div>
          <button
            type="button"
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-destructive/10 rounded text-destructive transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            title="删除"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

function TimelineEditor({
  novelId,
  characterId,
  initial,
  onSaved,
  onCancel,
}: {
  novelId: string
  characterId: string
  initial?: CharacterTimelineEvent
  onSaved: (event: CharacterTimelineEvent) => void
  onCancel: () => void
}) {
  const [eventType, setEventType] = useState<CharacterEventType>(initial?.event_type || 'milestone')
  const [title, setTitle] = useState(initial?.title || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [occurredAtLabel, setOccurredAtLabel] = useState(initial?.occurred_at_label || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('标题不能为空')
      return
    }
    setSaving(true)
    try {
      const data = initial
        ? await characterTimelineApi.update(initial.id, {
            event_type: eventType,
            title,
            description,
            occurred_at_label: occurredAtLabel || null,
          })
        : await characterTimelineApi.create({
            novel_id: novelId,
            character_id: characterId,
            event_type: eventType,
            title,
            description,
            occurred_at_label: occurredAtLabel || null,
          })
      onSaved(data)
      toast.success(initial ? '已保存' : '已创建')
    } catch (err) {
      console.error(err)
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border-t border-border bg-background/95 p-2 space-y-1.5">
      <div className="flex gap-1.5">
        <Select value={eventType} onValueChange={v => setEventType(v as CharacterEventType)}>
          <SelectTrigger className="h-7 text-[11px] w-24 shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(EVENT_META) as CharacterEventType[]).map((k) => {
              const m = EVENT_META[k]
              return (
                <SelectItem key={k} value={k} className="text-[11px]">
                  {m.label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="事件标题"
          className="h-7 text-[11px] flex-1"
        />
      </div>
      <Input
        value={occurredAtLabel}
        onChange={e => setOccurredAtLabel(e.target.value)}
        placeholder="故事内时间（可选，如：第三年春）"
        className="h-7 text-[11px]"
      />
      <Textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="事件详情"
        className="text-[11px] min-h-[60px] resize-none"
        rows={3}
      />
      <div className="flex gap-1.5 justify-end pt-0.5">
        <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={onCancel}>
          取消
        </Button>
        <Button size="sm" className="h-7 text-[11px]" onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
          {initial ? '保存' : '创建'}
        </Button>
      </div>
    </div>
  )
}
