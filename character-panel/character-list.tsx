'use client'

import type { Character } from '@/lib/mockData'
import { Pencil, Plus, Search, Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { getCharacterColor } from '@/store/characterGraphStore'

interface CharacterListProps {
  characters: Character[]
  selectedCharacterId?: string
  search: string
  onSearchChange: (value: string) => void
  onSelect: (id: string) => void
  onCreate: () => void
  onEdit: (id: string) => void
  className?: string
}

export function CharacterList({
  characters,
  selectedCharacterId,
  search,
  onSearchChange,
  onSelect,
  onCreate,
  onEdit,
  className,
}: CharacterListProps) {
  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return characters
    return characters.filter((character) => {
      const base = `${character.name} ${character.role ?? ''}`.toLowerCase()
      const extras = `${character.description ?? ''} ${(character.traits ?? []).join(' ')} ${(character.keywords ?? []).join(' ')} ${character.note ?? ''} ${character.first_appearance ?? ''}`.toLowerCase()
      return base.includes(keyword) || extras.includes(keyword)
    })
  }, [characters, search])

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="border-b border-border/60 px-4 pb-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">角色档案</h2>
            <p className="text-xs text-muted-foreground">搜索、浏览并编辑人物卡片</p>
          </div>
          <Button size="icon-sm" variant="outline" onClick={onCreate} aria-label="新建角色">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={event => onSearchChange(event.target.value)}
            placeholder="搜索角色名称 / 关键词"
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-3">
        <div className="space-y-4 pb-6">
          {filtered.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              暂无匹配角色，试试创建新角色吧。
            </div>
          )}

          {filtered.map((character) => {
            const isSelected = character.id === selectedCharacterId
            const color = getCharacterColor(character)
            const badges = [...(character.traits ?? []), ...(character.keywords ?? [])].slice(0, 4)
            return (
              <div
                key={character.id}
                className={cn(
                  'group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-primary/40 hover:shadow-md cursor-pointer',
                  isSelected && 'border-primary/60 ring-1 ring-primary/30',
                )}
                onClick={() => onSelect(character.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    onSelect(character.id)
                  }
                }}
              >
                <div
                  className="h-14 w-full"
                  style={{
                    background: `linear-gradient(135deg, ${color} 0%, rgba(255,255,255,0.2) 100%)`,
                  }}
                />
                <div className="space-y-2 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{character.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {character.role ?? '未设置角色定位'}
                      </p>
                    </div>
                    <div
                      className="h-8 w-8 rounded-full border border-white/70"
                      style={{ backgroundColor: color }}
                    />
                  </div>

                  {character.first_appearance && (
                    <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                      首次登场：
                      {character.first_appearance}
                    </span>
                  )}

                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {character.description ?? '暂无人物描述，点击编辑补充。'}
                  </p>

                  {badges.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {badges.map((tag, index) => (
                        <span key={`${tag}-${index}`} className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={(event) => {
                        event.stopPropagation()
                      }}
                    >
                      <Sparkles className="h-3 w-3" />
                      生成形象
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={(event) => {
                        event.stopPropagation()
                        onEdit(character.id)
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                      编辑
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}

          <button
            type="button"
            onClick={onCreate}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground transition hover:bg-accent/50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Plus className="h-4 w-4" />
            </div>
            新建角色档案
          </button>
        </div>
      </div>
    </div>
  )
}
