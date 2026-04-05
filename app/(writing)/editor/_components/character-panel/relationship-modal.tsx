'use client'

import type { Character, Relationship } from './types'
import { useEffect, useId, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/hooks/use-i18n'
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
  const { t } = useI18n()
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
      toast.error(t('editor.charactersPanel.relationshipModal.messages.pickBoth'))
      setSaving(false)
      return
    }
    if (sourceId === targetId) {
      toast.error(t('editor.charactersPanel.relationshipModal.messages.sameNotAllowed'))
      setSaving(false)
      return
    }
    const payload = {
      sourceId,
      targetId,
      sourceToTargetLabel: targetToSourceLabel.trim(),
      targetToSourceLabel: sourceToTargetLabel.trim(),
      note: note.trim() || undefined,
    }
    if (!payload.sourceToTargetLabel || !payload.targetToSourceLabel) {
      toast.error(t('editor.charactersPanel.relationshipModal.messages.labelsRequired'))
      setSaving(false)
      return
    }
    try {
      if (relationship) {
        await onUpdate(relationship.id, payload)
        toast.success(t('editor.charactersPanel.relationshipModal.messages.updated'))
      } else {
        await onCreate(payload)
        toast.success(t('editor.charactersPanel.relationshipModal.messages.created'))
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save relationship:', error)
      toast.error(t('editor.charactersPanel.relationshipModal.messages.saveFailedRetry'))
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
              {relationship ? t('editor.charactersPanel.relationshipModal.editTitle') : t('editor.charactersPanel.relationshipModal.createTitle')}
            </div>
          </div>
          <button
            type="button"
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            onClick={() => onOpenChange(false)}
            aria-label={t('common.cancel')}
          >
            <span className="sr-only">{t('common.cancel')}</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${formId}-source`}>{t('editor.charactersPanel.relationshipModal.fields.source')}</Label>
              <Select value={sourceId} onValueChange={setSourceId}>
                <SelectTrigger id={`${formId}-source`}>
                  <SelectValue placeholder={t('editor.charactersPanel.relationshipModal.placeholders.selectA')} />
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
              <Label htmlFor={`${formId}-target`}>{t('editor.charactersPanel.relationshipModal.fields.target')}</Label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger id={`${formId}-target`}>
                  <SelectValue placeholder={t('editor.charactersPanel.relationshipModal.placeholders.selectB')} />
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
            <Label htmlFor={`${formId}-label-a`}>{t('editor.charactersPanel.relationshipModal.fields.bidirectionalLabel')}</Label>
            <div className="grid gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{sourceName}</span>
                <span>{t('editor.charactersPanel.relationshipModal.grammar.is')}</span>
                <span className="font-medium text-foreground">{targetName}</span>
                <span>{t('editor.charactersPanel.relationshipModal.grammar.of')}</span>
                <Input
                  id={`${formId}-label-a`}
                  value={sourceToTargetLabel}
                  onChange={event => setSourceToTargetLabel(event.target.value)}
                  placeholder={t('editor.charactersPanel.relationshipModal.placeholders.labelA')}
                  className="h-8 w-40 text-xs"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{targetName}</span>
                <span>{t('editor.charactersPanel.relationshipModal.grammar.is')}</span>
                <span className="font-medium text-foreground">{sourceName}</span>
                <span>{t('editor.charactersPanel.relationshipModal.grammar.of')}</span>
                <Input
                  id={`${formId}-label-b`}
                  value={targetToSourceLabel}
                  onChange={event => setTargetToSourceLabel(event.target.value)}
                  placeholder={t('editor.charactersPanel.relationshipModal.placeholders.labelB')}
                  className="h-8 w-40 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${formId}-note`}>{t('editor.charactersPanel.relationshipModal.fields.note')}</Label>
            <Textarea
              id={`${formId}-note`}
              value={note}
              onChange={event => setNote(event.target.value)}
              placeholder={t('editor.charactersPanel.relationshipModal.placeholders.note')}
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t p-6">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('editor.charactersPanel.relationshipModal.actions.cancel')}
          </Button>
          <Button onClick={handleSubmit}>
            {t('editor.charactersPanel.relationshipModal.actions.save')}
          </Button>
        </div>
      </div>
    </div>
  )
}
