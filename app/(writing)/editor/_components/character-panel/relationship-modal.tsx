'use client'

import type { Character, Relationship } from './types'
import { useEffect, useId, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface RelationshipModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  relationship?: Relationship | null
  characters: Character[]
  defaultSourceId?: string
  defaultTargetId?: string
  onCreate: (relationship: Omit<Relationship, 'id'>) => Promise<void> | void
  onUpdate: (id: string, updates: Partial<Relationship>) => Promise<void> | void
}

export function RelationshipModal({
  open,
  onOpenChange,
  relationship,
  characters,
  defaultSourceId,
  defaultTargetId,
  onCreate,
  onUpdate,
}: RelationshipModalProps) {
  const [sourceId, setSourceId] = useState('')
  const [targetId, setTargetId] = useState('')
  const [sourceToTargetLabel, setSourceToTargetLabel] = useState('')
  const [targetToSourceLabel, setTargetToSourceLabel] = useState('')
  const [note, setNote] = useState('')
  const formId = useId()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => {
      if (relationship) {
        setSourceId(relationship.sourceId)
        setTargetId(relationship.targetId)
        setSourceToTargetLabel(relationship.sourceToTargetLabel)
        setTargetToSourceLabel(relationship.targetToSourceLabel)
        setNote(relationship.note ?? '')
      } else {
        setSourceId(defaultSourceId ?? '')
        setTargetId(defaultTargetId ?? '')
        setSourceToTargetLabel('')
        setTargetToSourceLabel('')
        setNote('')
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [open, relationship, defaultSourceId, defaultTargetId])

  const nameMap = useMemo(() => new Map(characters.map(item => [item.id, item.name])), [characters])
  const sourceName = sourceId ? nameMap.get(sourceId) : 'A'
  const targetName = targetId ? nameMap.get(targetId) : 'B'

  const handleSubmit = async () => {
    if (saving) return
    setSaving(true)
    if (!sourceId || !targetId) {
      toast.error('请选择关系双方')
      return
    }
    if (sourceId === targetId) {
      toast.error('关系双方不能相同')
      return
    }
    const payload = {
      sourceId,
      targetId,
      sourceToTargetLabel: sourceToTargetLabel.trim(),
      targetToSourceLabel: targetToSourceLabel.trim(),
      note: note.trim() || undefined,
    }
    if (!payload.sourceToTargetLabel || !payload.targetToSourceLabel) {
      toast.error('请填写双向关系标签')
      return
    }
    try {
      if (relationship) {
        await onUpdate(relationship.id, payload)
        toast.success('关系已更新')
      } else {
        await onCreate(payload)
        toast.success('关系已创建')
      }
      onOpenChange(false)
    } catch (error) {
      console.error('关系保存失败:', error)
      toast.error('关系保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onOpenChange])

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] transition-opacity duration-200',
        open ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      <div
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-sm',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={() => onOpenChange(false)}
      />

      <div
        className={cn(
          'absolute right-0 top-0 h-full w-[400px] max-w-[90vw]',
          'flex flex-col border-l bg-background shadow-2xl',
          'transform transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b p-6">
          <div className="space-y-1">
            <div id={`${formId}-title`} className="text-lg font-semibold text-foreground">
              {relationship ? '编辑关系' : '新建关系'}
            </div>
          </div>
          <button
            type="button"
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${formId}-source`}>关系 A</Label>
              <Select value={sourceId} onValueChange={setSourceId}>
                <SelectTrigger id={`${formId}-source`}>
                  <SelectValue placeholder="选择角色 A" />
                </SelectTrigger>
                <SelectContent>
                  {characters.map(character => (
                    <SelectItem key={character.id} value={character.id}>
                      {character.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${formId}-target`}>关系 B</Label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger id={`${formId}-target`}>
                  <SelectValue placeholder="选择角色 B" />
                </SelectTrigger>
                <SelectContent>
                  {characters.map(character => (
                    <SelectItem key={character.id} value={character.id} disabled={character.id === sourceId}>
                      {character.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${formId}-label-a`}>双向关系标签</Label>
            <div className="grid gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{sourceName}</span>
                <span>是</span>
                <span className="font-medium text-foreground">{targetName}</span>
                <span>的</span>
                <Input
                  id={`${formId}-label-a`}
                  value={sourceToTargetLabel}
                  onChange={event => setSourceToTargetLabel(event.target.value)}
                  placeholder="例如：师傅"
                  className="h-8 w-40 text-xs"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{targetName}</span>
                <span>是</span>
                <span className="font-medium text-foreground">{sourceName}</span>
                <span>的</span>
                <Input
                  id={`${formId}-label-b`}
                  value={targetToSourceLabel}
                  onChange={event => setTargetToSourceLabel(event.target.value)}
                  placeholder="例如：徒弟"
                  className="h-8 w-40 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${formId}-note`}>关系说明</Label>
            <Textarea
              id={`${formId}-note`}
              value={note}
              onChange={event => setNote(event.target.value)}
              placeholder="补充关系背景或关键冲突"
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t p-6">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            保存
          </Button>
        </div>
      </div>
    </div>
  )
}
