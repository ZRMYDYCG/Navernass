'use client'

import { Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import type { SkillMarketplaceItem } from '@/lib/skills/types'
import { CUSTOM_SKILL_TEMPLATE } from '@/lib/skills/custom-skill-template'

interface SkillsMarketplaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function SkillsMarketplaceDialog({ open, onOpenChange }: SkillsMarketplaceDialogProps) {
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
    if (open) void loadSkills()
  }, [open, loadSkills])

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
      } else if (data.skill) {
        void loadSkills()
      }
      if (data.warning) {
        setError(data.warning)
      }
      setEditorOpen(false)
      setForm(EMPTY_FORM)
      void loadSkills()
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
    } catch (err) {
      setError(err instanceof Error ? err.message : t('skills.errors.delete'))
    } finally {
      setSaving(false)
    }
  }

  const officialSkills = skills.filter(skill => !skill.isCustom)
  const customSkills = skills.filter(skill => skill.isCustom)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg" onOpenAutoFocus={e => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {t('skills.title')}
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-muted-foreground">{t('skills.subtitle')}</p>

          {error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : null}

          <ScrollArea className="max-h-[420px] pr-3">
            <div className="space-y-6">
              <section className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">{t('skills.official')}</h3>
                {loading ? (
                  <p className="text-xs text-muted-foreground">{t('common.loading')}</p>
                ) : (
                  <div className="space-y-2">
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
                )}
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-medium text-foreground">{t('skills.custom.title')}</h3>
                  <Button type="button" size="sm" variant="secondary" onClick={() => void openCreateEditor()}>
                    <Plus className="h-3.5 w-3.5" />
                    {t('skills.custom.create')}
                  </Button>
                </div>
                {customSkills.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t('skills.custom.empty')}</p>
                ) : (
                  <div className="space-y-2">
                    {customSkills.map(skill => (
                      <SkillRow
                        key={skill.id}
                        skill={skill}
                        disabled={saving}
                        onToggle={() => void toggleSkill(skill)}
                        onEdit={() => void openEditEditor(skill)}
                        onDelete={() => void deleteCustomSkill(skill.id)}
                        t={t}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
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
              <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="button" onClick={() => void saveCustomSkill()} disabled={saving}>
                {saving ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SkillRow({
  skill,
  disabled,
  onToggle,
  onEdit,
  onDelete,
  t,
}: {
  skill: SkillMarketplaceItem
  disabled: boolean
  onToggle: () => void
  onEdit?: () => void
  onDelete?: () => void
  t: (key: string) => string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">{skill.displayName}</span>
          <Badge variant="secondary" className="text-[10px]">
            {t(`skills.categories.${skill.category}` as 'skills.categories.writing-style')}
          </Badge>
          {skill.isBuiltin ? (
            <Badge variant="outline" className="text-[10px]">{t('skills.badges.official')}</Badge>
          ) : null}
          {skill.isCustom ? (
            <Badge variant="outline" className="text-[10px]">{t('skills.badges.custom')}</Badge>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{skill.description}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {onEdit ? (
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={onEdit} disabled={disabled}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ) : null}
        {onDelete ? (
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={onDelete} disabled={disabled}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant={skill.enabled ? 'default' : 'outline'}
          className={cn('min-w-[72px]')}
          onClick={onToggle}
          disabled={disabled}
        >
          {skill.enabled ? t('skills.enabled') : t('skills.disabled')}
        </Button>
      </div>
    </div>
  )
}
