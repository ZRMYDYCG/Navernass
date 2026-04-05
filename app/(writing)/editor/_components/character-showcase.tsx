'use client'

import type { Character as CardCharacter } from './character-card'
import { Camera, Plus, Search, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/hooks/use-i18n'
import { chaptersApi } from '@/lib/supabase/sdk/chapters'
import { charactersApi } from '@/lib/supabase/sdk/characters'
import { CharacterCard } from './character-card'

interface TagInputProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  id?: string
}

function TagInput({ value, onChange, placeholder, id }: TagInputProps) {
  const [input, setInput] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const trimmed = input.trim().replace(/,$/, '')
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed])
        setInput('')
      }
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-wrap gap-1.5 min-h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring">
      {value.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[80px] h-6 text-sm"
        placeholder={value.length === 0 ? placeholder : ''}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}

interface CharacterShowcaseProps {
  novelId: string
}

export function CharacterShowcase({ novelId }: CharacterShowcaseProps) {
  const { t } = useI18n()
  const [characters, setCharacters] = useState<CardCharacter[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [chapterOptions, setChapterOptions] = useState<Array<{ id: string, title: string }>>([])
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [avatar, setAvatar] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [description, setDescription] = useState('')
  const [traits, setTraits] = useState<string[]>([])
  const [keywords, setKeywords] = useState<string[]>([])
  const [firstAppearance, setFirstAppearance] = useState('')
  const [note, setNote] = useState('')
  const formId = useId()

  const notifyCharactersChanged = () => {
    window.dispatchEvent(new CustomEvent('novel-characters-changed', { detail: { novelId } }))
  }

  const chapterTitleSet = useMemo(() => {
    return new Set(chapterOptions.map(c => c.title))
  }, [chapterOptions])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const data = await charactersApi.getByNovelId(novelId)
        if (cancelled) return
        const mapped: CardCharacter[] = data.map(c => ({
          id: c.id,
          name: c.name,
          role: c.role || '',
          avatar: c.avatar || undefined,
          description: c.description || '',
          traits: c.traits || [],
          keywords: c.keywords || [],
          chapters: c.first_appearance ? [c.first_appearance] : [],
          note: c.note || undefined,
        }))
        setCharacters(mapped)
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message)
        } else {
          toast.error(t('editor.characterShowcase.messages.loadCharactersFailed'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [novelId])

  useEffect(() => {
    let cancelled = false

    const loadChapters = async () => {
      try {
        const chapters = await chaptersApi.getByNovelId(novelId)
        if (cancelled) return
        const mapped = chapters
          .slice()
          .sort((a, b) => a.order_index - b.order_index)
          .map(c => ({ id: c.id, title: c.title }))
        setChapterOptions(mapped)
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message)
        } else {
          toast.error(t('editor.characterShowcase.messages.loadChaptersFailed'))
        }
      }
    }

    loadChapters()

    return () => {
      cancelled = true
    }
  }, [novelId])

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return characters

    return characters.filter((c) => {
      const base = `${c.name} ${c.role} ${c.description}`.toLowerCase()
      const traits = c.traits.join(' ').toLowerCase()
      const keywords = c.keywords.join(' ').toLowerCase()
      return base.includes(keyword) || traits.includes(keyword) || keywords.includes(keyword)
    })
  }, [characters, search])

  const handleOpenCreate = () => {
    setEditingId(null)
    setName('')
    setRole('')
    setAvatar('')
    setDescription('')
    setTraits([])
    setKeywords([])
    setFirstAppearance('')
    setNote('')
    setCreateOpen(true)
  }

  const handleDelete = async () => {
    if (!editingId) return
    try {
      setDeleting(true)
      await charactersApi.delete(editingId, novelId)
      setCharacters(prev => prev.filter(c => c.id !== editingId))
      notifyCharactersChanged()
      setCreateOpen(false)
      toast.success(t('editor.characterShowcase.messages.deleted'))
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error(t('editor.characterShowcase.messages.deleteFailed'))
      }
    } finally {
      setDeleting(false)
    }
  }

  const handleCreate = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error(t('editor.characterShowcase.messages.nameRequired'))
      return
    }
    try {
      setCreating(true)

      if (editingId) {
        const updated = await charactersApi.update(editingId, {
          novel_id: novelId,
          name: trimmedName,
          role: role.trim() || undefined,
          avatar: avatar || undefined,
          description: description.trim() || undefined,
          traits,
          keywords,
          first_appearance: firstAppearance.trim() || undefined,
          note: note.trim() || undefined,
        })
        const mapped: CardCharacter = {
          id: updated.id,
          name: updated.name,
          role: updated.role || '',
          avatar: updated.avatar || undefined,
          description: updated.description || '',
          traits: updated.traits || [],
          keywords: updated.keywords || [],
          chapters: updated.first_appearance ? [updated.first_appearance] : [],
          note: updated.note || undefined,
        }
        setCharacters(prev => prev.map(c => (c.id === mapped.id ? mapped : c)))
        notifyCharactersChanged()
      } else {
        const created = await charactersApi.create({
          novel_id: novelId,
          name: trimmedName,
          role: role.trim() || undefined,
          avatar: avatar || undefined,
          description: description.trim() || undefined,
          traits,
          keywords,
          first_appearance: firstAppearance.trim() || undefined,
          note: note.trim() || undefined,
        })
        const createdMapped: CardCharacter = {
          id: created.id,
          name: created.name,
          role: created.role || '',
          avatar: created.avatar || undefined,
          description: created.description || '',
          traits: created.traits || [],
          keywords: created.keywords || [],
          chapters: created.first_appearance ? [created.first_appearance] : [],
          note: created.note || undefined,
        }
        setCharacters(prev => [...prev, createdMapped])
        notifyCharactersChanged()
      }
      setCreateOpen(false)
      toast.success(editingId ? t('editor.characterShowcase.messages.updated') : t('editor.characterShowcase.messages.created'))
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error(t('editor.characterShowcase.messages.createFailed'))
      }
    } finally {
      setCreating(false)
    }
  }

  const handleOpenEdit = (character: CardCharacter) => {
    setEditingId(character.id)
    setName(character.name)
    setRole(character.role)
    setAvatar(character.avatar || '')
    setDescription(character.description)
    setTraits(character.traits)
    setKeywords(character.keywords)
    setFirstAppearance(character.chapters[0] || '')
    setNote(character.note || '')
    setCreateOpen(true)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('editor.characterShowcase.messages.avatarTooLarge'))
      return
    }

    try {
      setUploadingAvatar(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'avatar')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || t('editor.characterShowcase.messages.uploadFailed'))

      setAvatar(data.data.url)
      toast.success(t('editor.characterShowcase.messages.uploadSuccess'))
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error(t('editor.characterShowcase.messages.uploadFailed'))
      }
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 pb-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">{t('editor.characterShowcase.title')}</h2>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="p-1.5 hover:bg-accent rounded-md text-muted-foreground transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder={t('editor.characterShowcase.searchPlaceholder')}
            className="h-8 pl-8 bg-background border-border text-xs"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-2 scrollbar-none">
        {loading
          ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Spinner className="w-6 h-6" />
                <p className="text-xs">{t('editor.characterShowcase.loading')}</p>
              </div>
            )
          : (
              <div className="space-y-4 pb-10">
                {characters.length === 0 && (
                  <div className="text-xs text-muted-foreground px-1">{t('editor.characterShowcase.empty')}</div>
                )}

                {filtered.map(char => (
                  <CharacterCard key={char.id} character={char} onClick={() => handleOpenEdit(char)} />
                ))}

                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="w-full p-4 rounded-sm border-2 border-dashed border-border hover:border-border hover:bg-accent transition-all duration-300 group flex flex-col items-center justify-center gap-2 min-h-[120px]"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{t('editor.characterShowcase.new')}</span>
                </button>
              </div>
            )}
      </div>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? t('editor.characterShowcase.dialog.editTitle') : t('editor.characterShowcase.dialog.createTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t('editor.characterShowcase.fields.avatar')}</Label>
              <div className="flex justify-center mb-2">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
                >
                  <Avatar className="w-20 h-20 border-2 border-border group-hover:border-primary transition-colors">
                    <AvatarImage src={avatar} className="object-cover" />
                    <AvatarFallback className="bg-muted">
                      {uploadingAvatar ? <Spinner className="w-6 h-6" /> : <span className="text-2xl text-muted-foreground">{name?.[0] || 'A'}</span>}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <input
                  id={`${formId}-avatar`}
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-name`} className="text-xs text-muted-foreground">{t('editor.characterShowcase.fields.name')}</Label>
              <Input
                id={`${formId}-name`}
                placeholder={t('editor.characterShowcase.placeholders.name')}
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-role`} className="text-xs text-muted-foreground">{t('editor.characterShowcase.fields.role')}</Label>
              <Input
                id={`${formId}-role`}
                placeholder={t('editor.characterShowcase.placeholders.role')}
                value={role}
                onChange={e => setRole(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-description`} className="text-xs text-muted-foreground">{t('editor.characterShowcase.fields.description')}</Label>
              <Textarea
                id={`${formId}-description`}
                placeholder={t('editor.characterShowcase.placeholders.description')}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="min-h-[72px] resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-traits`} className="text-xs text-muted-foreground">{t('editor.characterShowcase.fields.traits')}</Label>
              <TagInput
                id={`${formId}-traits`}
                placeholder={t('editor.characterShowcase.placeholders.traits')}
                value={traits}
                onChange={setTraits}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-keywords`} className="text-xs text-muted-foreground">{t('editor.characterShowcase.fields.keywords')}</Label>
              <TagInput
                id={`${formId}-keywords`}
                placeholder={t('editor.characterShowcase.placeholders.keywords')}
                value={keywords}
                onChange={setKeywords}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-first-appearance`} className="text-xs text-muted-foreground">{t('editor.characterShowcase.fields.firstAppearance')}</Label>
              {chapterOptions.length > 0
                ? (
                    <Select
                      value={firstAppearance || '__none__'}
                      onValueChange={value => setFirstAppearance(value === '__none__' ? '' : value)}
                    >
                      <SelectTrigger id={`${formId}-first-appearance`} className="w-full">
                        <SelectValue placeholder={t('editor.characterShowcase.placeholders.firstAppearanceSelect')} />
                      </SelectTrigger>
                      <SelectContent className="z-[120]">
                        <SelectItem value="__none__">{t('editor.characterShowcase.placeholders.none')}</SelectItem>
                        {firstAppearance && !chapterTitleSet.has(firstAppearance) && (
                          <SelectItem value={firstAppearance}>{firstAppearance}</SelectItem>
                        )}
                        {chapterOptions.map(chapter => (
                          <SelectItem key={chapter.id} value={chapter.title}>
                            {chapter.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )
                : (
                    <Input
                      id={`${formId}-first-appearance`}
                      placeholder={t('editor.characterShowcase.placeholders.firstAppearance')}
                      value={firstAppearance}
                      onChange={e => setFirstAppearance(e.target.value)}
                    />
                  )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-note`} className="text-xs text-muted-foreground">{t('editor.characterShowcase.fields.note')}</Label>
              <Textarea
                id={`${formId}-note`}
                placeholder={t('editor.characterShowcase.placeholders.note')}
                value={note}
                onChange={e => setNote(e.target.value)}
                className="min-h-[60px] resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            {editingId && (
              <Button variant="destructive" onClick={handleDelete} disabled={creating || deleting}>
                {deleting ? t('editor.characterShowcase.actions.deleting') : t('common.delete')}
              </Button>
            )}
            <Button variant="ghost" onClick={() => setCreateOpen(false)} disabled={creating || deleting}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={creating || deleting}>
              {creating
                ? (editingId ? t('editor.characterShowcase.actions.saving') : t('editor.characterShowcase.actions.creating'))
                : (editingId ? t('common.save') : t('editor.characterShowcase.actions.create'))}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
