'use client'

import type { Character, Relationship } from '@/lib/mockData'
import { useEffect, useId, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'

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
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-[400px] flex-col bg-background sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle>{relationship ? '编辑关系' : '新建关系'}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto py-4">
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
        <SheetFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            保存
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
