'use client'

import type { Character as CardCharacter } from './character-card'
import { Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { charactersApi } from '@/lib/supabase/sdk/characters'
import { CharacterCard } from './character-card'

interface CharacterShowcaseProps {
  novelId: string
}

export function CharacterShowcase({ novelId }: CharacterShowcaseProps) {
  const [characters, setCharacters] = useState<CardCharacter[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [description, setDescription] = useState('')
  const [traitsInput, setTraitsInput] = useState('')
  const [keywordsInput, setKeywordsInput] = useState('')
  const [firstAppearance, setFirstAppearance] = useState('')
  const [note, setNote] = useState('')

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
          toast.error('加载角色失败')
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
    setDescription('')
    setTraitsInput('')
    setKeywordsInput('')
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
      setCreateOpen(false)
      toast.success('角色已删除')
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

  const handleCreate = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error('请输入角色名称')
      return
    }
    try {
      setCreating(true)
      const traits = traitsInput.split(',').map(s => s.trim()).filter(Boolean)
      const keywords = keywordsInput.split(',').map(s => s.trim()).filter(Boolean)

      if (editingId) {
        const updated = await charactersApi.update(editingId, {
          novel_id: novelId,
          name: trimmedName,
          role: role.trim() || undefined,
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
      } else {
        const created = await charactersApi.create({
          novel_id: novelId,
          name: trimmedName,
          role: role.trim() || undefined,
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
      }
      setCreateOpen(false)
      toast.success(editingId ? '角色已更新' : '角色已创建')
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('创建角色失败')
      }
    } finally {
      setCreating(false)
    }
  }

  const handleOpenEdit = (character: CardCharacter) => {
    setEditingId(character.id)
    setName(character.name)
    setRole(character.role)
    setDescription(character.description)
    setTraitsInput(character.traits.join(', '))
    setKeywordsInput(character.keywords.join(', '))
    setFirstAppearance(character.chapters[0] || '')
    setNote(character.note || '')
    setCreateOpen(true)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 pb-2 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">角色档案</h2>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-md text-gray-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            placeholder="搜索角色..."
            className="h-8 pl-8 bg-white dark:bg-zinc-800/50 border-gray-200 dark:border-gray-700 text-xs"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-2">
        <div className="space-y-4 pb-10">
          {loading && characters.length === 0 && (
            <div className="text-xs text-gray-400 dark:text-gray-500 px-1">加载角色中...</div>
          )}

          {!loading && characters.length === 0 && (
            <div className="text-xs text-gray-400 dark:text-gray-500 px-1">还没有角色，先写一个吧。</div>
          )}

          {filtered.map(char => (
            <CharacterCard key={char.id} character={char} onClick={() => handleOpenEdit(char)} />
          ))}

          <button
            type="button"
            onClick={handleOpenCreate}
            className="w-full p-4 rounded-sm border-2 border-dashed border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-all duration-300 group flex flex-col items-center justify-center gap-2 min-h-[120px]"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Plus className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <span className="text-xs text-gray-400 font-medium">新建角色档案</span>
          </button>
        </div>
      </div>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? '编辑角色' : '新建角色'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="角色名称"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <Input
              placeholder="身份 / 职位"
              value={role}
              onChange={e => setRole(e.target.value)}
            />
            <textarea
              placeholder="一句话描述这个角色"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="min-h-[72px] w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-400 resize-none"
            />
            <Input
              placeholder="关键特质（用逗号分隔）"
              value={traitsInput}
              onChange={e => setTraitsInput(e.target.value)}
            />
            <Input
              placeholder="关键词（用逗号分隔）"
              value={keywordsInput}
              onChange={e => setKeywordsInput(e.target.value)}
            />
            <Input
              placeholder="首次登场章节"
              value={firstAppearance}
              onChange={e => setFirstAppearance(e.target.value)}
            />
            <textarea
              placeholder="灵感备注"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="min-h-[60px] w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-400 resize-none"
            />
          </div>
          <DialogFooter>
            {editingId && (
              <Button variant="destructive" onClick={handleDelete} disabled={creating || deleting}>
                {deleting ? '删除中...' : '删除'}
              </Button>
            )}
            <Button variant="ghost" onClick={() => setCreateOpen(false)} disabled={creating || deleting}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={creating || deleting}>
              {creating ? (editingId ? '保存中...' : '创建中...') : (editingId ? '保存' : '创建')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
