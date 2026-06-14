'use client'

import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import type { SkillMarketplaceItem } from '@/lib/skills/types'
import { CUSTOM_SKILL_TEMPLATE } from '@/lib/skills/custom-skill-template'

interface SkillsPanelProps {
  active: boolean
}

interface CustomSkillForm {
  id?: string
  name: string
  displayName: string
  description: string
  skillMd: string
}

const EMPTY_FORM: CustomSkillForm = {
  name: '',
  displayName: '',
  description: '',
  skillMd: '',
}

async function readApiError(res: Response, fallback: string) {
  const text = await res.text()
  try {
    const payload = JSON.parse(text) as { error?: string }
    return payload.error || fallback
  } catch {
    return text || fallback
  }
}

export function SkillsPanel({ active }: SkillsPanelProps) {
  const { t } = useI18n()
  const [skills, setSkills] = useState<SkillMarketplaceItem[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorError, setEditorError] = useState<string | null>(null)
  const [form, setForm] = useState<CustomSkillForm>(EMPTY_FORM)

  const loadSkills = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/skills')
      if (!res.ok) throw new Error(await readApiError(res, t('skills.errors.load')))
      const data = await res.json()
      setSkills(data.skills ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : t('skills.errors.load'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (active) void loadSkills()
  }, [active, loadSkills])

  const toggleSkill = async (skill: SkillMarketplaceItem) => {
    setSaving(true)
    setError(null)
    try {
      const res = skill.isCustom
        ? await fetch('/api/skills/custom', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: skill.id, enabled: !skill.enabled }),
          })
        : await fetch('/api/skills', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skillId: skill.id, enabled: !skill.enabled }),
          })
      if (!res.ok) throw new Error(await readApiError(res, t('skills.errors.update')))
      const data = await res.json()
      setSkills(data.skills ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : t('skills.errors.update'))
    } finally {
      setSaving(false)
    }
  }

  const openCreateEditor = async () => {
    setError(null)
    setEditorError(null)
    try {
      const res = await fetch('/api/skills/custom')
      const data = await res.json()
      setForm({
        ...EMPTY_FORM,
        name: 'my-writing-style',
        displayName: t('skills.custom.defaultName'),
        description: t('skills.custom.defaultDescription'),
        skillMd: data.template || CUSTOM_SKILL_TEMPLATE,
      })
    } catch {
      setForm({
        ...EMPTY_FORM,
        name: 'my-writing-style',
        displayName: t('skills.custom.defaultName'),
        description: t('skills.custom.defaultDescription'),
        skillMd: CUSTOM_SKILL_TEMPLATE,
      })
    }
    setEditorOpen(true)
  }

  const openEditEditor = async (skill: SkillMarketplaceItem) => {
    setError(null)
    setEditorError(null)
    try {
      const res = await fetch(`/api/skills/custom/${skill.id}`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      const row = data.skill
      setForm({
        id: skill.id,
        name: row.name,
        displayName: row.display_name,
        description: row.description,
        skillMd: row.skill_md,
      })
      setEditorOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('skills.errors.load'))
    }
  }

  const closeEditor = () => {
    setEditorOpen(false)
    setEditorError(null)
    setForm(EMPTY_FORM)
  }

  const saveCustomSkill = async () => {
    setSaving(true)
    setEditorError(null)
    try {
      const res = await fetch('/api/skills/custom', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || t('skills.errors.save'))
      }
      const data = await res.json()
      if (data.skills?.length) {
        setSkills(data.skills)
      } else {
        void loadSkills()
      }
      if (data.warning) {
        setError(data.warning)
      }
      closeEditor()
    } catch (err) {
      setEditorError(err instanceof Error ? err.message : t('skills.errors.save'))
    } finally {
      setSaving(false)
    }
  }

  const deleteCustomSkill = async (id: string) => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/skills/custom/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setSkills(data.skills ?? [])
      if (form.id === id) closeEditor()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('skills.errors.delete'))
    } finally {
      setSaving(false)
    }
  }

  const officialSkills = skills.filter(skill => !skill.isCustom)
  const customSkills = skills.filter(skill => skill.isCustom)

  return (
    <div className="space-y-2">
      {error ? (
        <p className="px-1 text-[11px] text-destructive">{error}</p>
      ) : null}

      {loading ? (
        <p className="px-2 py-1 text-[11px] text-muted-foreground">{t('common.loading')}</p>
      ) : (
        <>
          <div className="space-y-0.5">
            <p className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {t('skills.official')}
            </p>
            {officialSkills.map(skill => (
              <SkillRow
                key={skill.id}
                skill={skill}
                disabled={saving}
                onToggle={() => void toggleSkill(skill)}
                t={t}
              />
            ))}
          </div>

          <div className="space-y-0.5 border-t border-border/60 pt-2">
            <div className="flex items-center justify-between gap-1 px-1">
              <p className="px-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {t('skills.custom.title')}
              </p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 gap-1 px-1.5 text-[11px] text-muted-foreground"
                onClick={() => void openCreateEditor()}
                disabled={saving}
              >
                <Plus className="h-3 w-3" />
                {t('skills.custom.create')}
              </Button>
            </div>
            {customSkills.length === 0 ? (
              <p className="px-2 py-1 text-[11px] text-muted-foreground">{t('skills.custom.empty')}</p>
            ) : (
              customSkills.map(skill => (
                <SkillRow
                  key={skill.id}
                  skill={skill}
                  disabled={saving}
                  onToggle={() => void toggleSkill(skill)}
                  onEdit={() => void openEditEditor(skill)}
                  onDelete={() => void deleteCustomSkill(skill.id)}
                  selected={form.id === skill.id && editorOpen}
                  t={t}
                />
              ))
            )}
          </div>
        </>
      )}

      <Dialog open={editorOpen} onOpenChange={(open) => { if (!open) closeEditor() }}>
        <DialogContent className="sm:max-w-2xl" onOpenAutoFocus={e => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{form.id ? t('skills.custom.edit') : t('skills.custom.create')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {editorError ? (
              <p className="text-xs text-destructive rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
                {editorError}
              </p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="skill-name">{t('skills.custom.name')}</Label>
                <Input
                  id="skill-name"
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="my-writing-style"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill-display-name">{t('skills.custom.displayName')}</Label>
                <Input
                  id="skill-display-name"
                  value={form.displayName}
                  onChange={e => setForm(prev => ({ ...prev, displayName: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill-description">{t('skills.custom.description')}</Label>
              <Input
                id="skill-description"
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill-md">{t('skills.custom.skillMd')}</Label>
              <Textarea
                id="skill-md"
                value={form.skillMd}
                onChange={e => setForm(prev => ({ ...prev, skillMd: e.target.value }))}
                className="min-h-[280px] font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">{t('skills.custom.skillMdHint')}</p>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeEditor}>
                {t('common.cancel')}
              </Button>
              <Button type="button" onClick={() => void saveCustomSkill()} disabled={saving}>
                {saving ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SkillRow({
  skill,
  disabled,
  selected = false,
  onToggle,
  onEdit,
  onDelete,
  t,
}: {
  skill: SkillMarketplaceItem
  disabled: boolean
  selected?: boolean
  onToggle: () => void
  onEdit?: () => void
  onDelete?: () => void
  t: (key: string) => string
}) {
  return (
    <div
      className={cn(
        'group flex min-h-[28px] items-center gap-1 rounded-lg px-1.5 py-0.5 transition-colors',
        selected ? 'bg-background/95 shadow-paper-sm' : 'hover:bg-background/60',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] leading-snug text-foreground/90">{skill.displayName}</p>
        <p className="truncate text-[10px] text-muted-foreground">{skill.description}</p>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 opacity-80 group-hover:opacity-100">
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            disabled={disabled}
            className="flex h-6 w-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
            aria-label={t('skills.custom.edit')}
          >
            <Pencil className="h-3 w-3" />
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={disabled}
            className="flex h-6 w-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
            aria-label={t('common.delete')}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className={cn(
            'rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-colors disabled:opacity-40',
            skill.enabled
              ? 'bg-primary text-primary-foreground'
              : 'border border-border bg-background text-muted-foreground hover:text-foreground',
          )}
        >
          {skill.enabled ? t('skills.enabled') : t('skills.disabled')}
        </button>
      </div>
    </div>
  )
}
