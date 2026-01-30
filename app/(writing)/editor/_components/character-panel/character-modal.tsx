'use client'

import type { NovelCharacter } from '@/lib/supabase/sdk'
import { Camera, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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
import { chaptersApi } from '@/lib/supabase/sdk/chapters'
import { charactersApi } from '@/lib/supabase/sdk/characters'
import { cn } from '@/lib/utils'
import { useCharacterMaterialStore } from '@/store/characterMaterialStore'

interface CharacterFormValues {
  name: string
  role: string
  avatar: string
  color: string
  description: string
  traits: string[]
  keywords: string[]
  first_appearance: string
  note: string
}

interface CharacterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  character?: NovelCharacter | null
  novelId: string | null
}

const COLOR_PRESETS = [
  { id: 'cobalt', name: 'Cobalt', value: '#4C6FFF' },
  { id: 'teal', name: 'Teal', value: '#22C3A6' },
  { id: 'emerald', name: 'Emerald', value: '#16A34A' },
  { id: 'amber', name: 'Amber', value: '#F59E0B' },
  { id: 'coral', name: 'Coral', value: '#F97316' },
  { id: 'rose', name: 'Rose', value: '#F43F5E' },
  { id: 'violet', name: 'Violet', value: '#8B5CF6' },
  { id: 'slate', name: 'Slate', value: '#64748B' },
]

function lighten(hex: string, amount = 0.18) {
  const safe = hex.replace('#', '')
  const num = Number.parseInt(safe, 16)
  if (Number.isNaN(num) || safe.length !== 6) return hex
  const r = Math.min(255, Math.round(((num >> 16) & 0xFF) + (255 - ((num >> 16) & 0xFF)) * amount))
  const g = Math.min(255, Math.round(((num >> 8) & 0xFF) + (255 - ((num >> 8) & 0xFF)) * amount))
  const b = Math.min(255, Math.round((num & 0xFF) + (255 - (num & 0xFF)) * amount))
  return `#${[r, g, b].map(value => value.toString(16).padStart(2, '0')).join('')}`
}

function darken(hex: string, amount = 0.2) {
  const safe = hex.replace('#', '')
  const num = Number.parseInt(safe, 16)
  if (Number.isNaN(num) || safe.length !== 6) return hex
  const r = Math.max(0, Math.round(((num >> 16) & 0xFF) * (1 - amount)))
  const g = Math.max(0, Math.round(((num >> 8) & 0xFF) * (1 - amount)))
  const b = Math.max(0, Math.round((num & 0xFF) * (1 - amount)))
  return `#${[r, g, b].map(value => value.toString(16).padStart(2, '0')).join('')}`
}

const buildGradient = (hex: string) => `linear-gradient(135deg, ${lighten(hex, 0.22)} 0%, ${darken(hex, 0.26)} 100%)`

const defaultForm: CharacterFormValues = {
  name: '',
  role: '',
  avatar: '',
  color: COLOR_PRESETS[0].value,
  description: '',
  traits: [],
  keywords: [],
  first_appearance: '',
  note: '',
}

export function CharacterModal({
  open,
  onOpenChange,
  character,
  novelId,
}: CharacterModalProps) {
  const [form, setForm] = useState<CharacterFormValues>(defaultForm)
  const [chapterOptions, setChapterOptions] = useState<Array<{ id: string, title: string }>>([])
  const [avatar, setAvatar] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formId = useId()
  const { upsertCharacter, removeCharacter, selectCharacter } = useCharacterMaterialStore()

  const chapterTitleSet = useMemo(() => {
    return new Set(chapterOptions.map(c => c.title))
  }, [chapterOptions])

  useEffect(() => {
    if (!open || !novelId) return

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
        if (!cancelled && error instanceof Error) {
          toast.error(error.message)
        }
      }
    }

    loadChapters()

    return () => {
      cancelled = true
    }
  }, [open, novelId])

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => {
      if (character) {
        setForm({
          name: character.name,
          role: character.role ?? '',
          avatar: character.avatar ?? '',
          color: character.color ?? COLOR_PRESETS[0].value,
          description: character.description ?? '',
          traits: character.traits ?? [],
          keywords: character.keywords ?? [],
          first_appearance: character.first_appearance ?? '',
          note: character.note ?? '',
        })
        setAvatar(character.avatar ?? '')
      } else {
        setForm(defaultForm)
        setAvatar('')
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [open, character])

  const updateField = (key: keyof CharacterFormValues, value: CharacterFormValues[keyof CharacterFormValues]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB')
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
      if (!res.ok) throw new Error(data.error?.message || '上传失败')

      setAvatar(data.data.url)
      toast.success('头像上传成功')
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('上传头像失败')
      }
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async () => {
    if (!character || !novelId) return
    try {
      setDeleting(true)
      await charactersApi.delete(character.id, novelId)
      removeCharacter(character.id)
      toast.success('角色已删除')
      onOpenChange(false)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('删除角色失败')
      }
    } finally {
      setDeleting(false)
    }
  }

  const handleSubmit = async () => {
    if (!novelId) {
      toast.error('缺少小说 ID')
      return
    }

    const trimmedName = form.name.trim()
    if (!trimmedName) {
      toast.error('请输入角色名称')
      return
    }

    try {
      setCreating(true)

      if (character) {
        const updated = await charactersApi.update(character.id, {
          novel_id: novelId,
          name: trimmedName,
          role: form.role.trim() || undefined,
          avatar: avatar || undefined,
          color: form.color || undefined,
          description: form.description.trim() || undefined,
          traits: form.traits,
          keywords: form.keywords,
          first_appearance: form.first_appearance.trim() || undefined,
          note: form.note.trim() || undefined,
        })
        upsertCharacter(updated)
        selectCharacter(updated.id)
        toast.success('角色已更新')
      } else {
        const created = await charactersApi.create({
          novel_id: novelId,
          name: trimmedName,
          role: form.role.trim() || undefined,
          avatar: avatar || undefined,
          color: form.color || undefined,
          description: form.description.trim() || undefined,
          traits: form.traits,
          keywords: form.keywords,
          first_appearance: form.first_appearance.trim() || undefined,
          note: form.note.trim() || undefined,
        })
        upsertCharacter(created)
        selectCharacter(created.id)
        toast.success('角色已创建')
      }

      onOpenChange(false)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error(character ? '更新角色失败' : '创建角色失败')
      }
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onOpenChange(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  return (
    <div
      className={cn(
        'fixed inset-0 z-[110]',
        open ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
      aria-hidden={!open}
      style={{ transition: open ? undefined : 'opacity 0s 200ms' }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        style={{ opacity: open ? 1 : 0 }}
        onClick={() => onOpenChange(false)}
      />

      <div
        className={cn(
          'absolute right-0 top-0 h-full w-[420px] max-w-full bg-background shadow-2xl',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
            <h2 className="text-lg font-semibold">
              {character ? '编辑角色' : '新建角色'}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-accent"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <div className="flex flex-col items-center">
              <div
                className="relative cursor-pointer group"
                onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
              >
                <div className="relative">
                  <Avatar className="w-24 h-24 ring-2 ring-offset-2 ring-border">
                    {avatar ? <AvatarImage src={avatar} className="object-cover" /> : null}
                    <AvatarFallback className="bg-accent text-2xl">
                      {uploadingAvatar
                        ? <Spinner className="w-6 h-6" />
                        : form.name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
              <p className="mt-2 text-xs text-muted-foreground">点击上传头像</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor={`${formId}-name`} className="text-sm font-medium">角色名称</Label>
                <Input
                  id={`${formId}-name`}
                  value={form.name}
                  onChange={event => updateField('name', event.target.value)}
                  placeholder="输入角色名称"
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">角色配色</Label>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_PRESETS.map((preset) => {
                    const isActive = form.color === preset.value
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => updateField('color', preset.value)}
                        className={cn(
                          'w-6 h-6 rounded transition-all duration-200 border',
                          isActive
                            ? 'ring-1 ring-foreground ring-offset-1 scale-105'
                            : 'hover:scale-105 border-transparent',
                        )}
                        style={{ background: buildGradient(preset.value) }}
                        aria-label={preset.name}
                      />
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor={`${formId}-role`} className="text-sm font-medium">职业 / 定位</Label>
                  <Input
                    id={`${formId}-role`}
                    value={form.role}
                    onChange={event => updateField('role', event.target.value)}
                    placeholder="如：将军"
                    className="h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`${formId}-first-appearance`} className="text-sm font-medium">首次登场</Label>
                  {chapterOptions.length > 0
                    ? (
                        <Select
                          value={form.first_appearance || '__none__'}
                          onValueChange={value => updateField('first_appearance', value === '__none__' ? '' : value)}
                        >
                          <SelectTrigger id={`${formId}-first-appearance`} className="h-10">
                            <SelectValue placeholder="选择章节" />
                          </SelectTrigger>
                          <SelectContent className="z-[120]">
                            <SelectItem value="__none__">不选择</SelectItem>
                            {form.first_appearance && !chapterTitleSet.has(form.first_appearance) && (
                              <SelectItem value={form.first_appearance}>{form.first_appearance}</SelectItem>
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
                          value={form.first_appearance}
                          onChange={event => updateField('first_appearance', event.target.value)}
                          placeholder="首次出现章节"
                          className="h-10"
                        />
                      )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`${formId}-description`} className="text-sm font-medium">角色简介</Label>
                <Textarea
                  id={`${formId}-description`}
                  value={form.description}
                  onChange={event => updateField('description', event.target.value)}
                  placeholder="描述角色的背景、动机与性格..."
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`${formId}-note`} className="text-sm font-medium">备注</Label>
                <Textarea
                  id={`${formId}-note`}
                  value={form.note}
                  onChange={event => updateField('note', event.target.value)}
                  placeholder="记录背景设定、灵感或伏笔..."
                  className="min-h-[80px] resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-border/60 bg-background">
            {character
              ? (
                  <Button
                    variant="ghost"
                    onClick={handleDelete}
                    disabled={creating || deleting}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    {deleting ? '删除中...' : '删除角色'}
                  </Button>
                )
              : (
                  <div />
                )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={creating || deleting}>
                取消
              </Button>
              <Button onClick={handleSubmit} disabled={creating || deleting} className="min-w-[80px]">
                {creating
                  ? (character ? '保存中...' : '创建中...')
                  : (character ? '保存' : '创建')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
