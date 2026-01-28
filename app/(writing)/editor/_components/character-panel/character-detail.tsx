'use client'

import type { Character, Relationship } from '@/lib/mockData'
import { ImageIcon, Link2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatRelationshipLabel, getCharacterColor } from '@/store/characterGraphStore'

interface CharacterDetailProps {
  character?: Character | null
  characters: Character[]
  relationships: Relationship[]
  onEditCharacter: (id: string) => void
  onEditRelationship: (id: string) => void
  className?: string
}

export function CharacterDetail({
  character,
  characters,
  relationships,
  onEditCharacter,
  onEditRelationship,
  className,
}: CharacterDetailProps) {
  if (!character) {
    return (
      <div className={cn('rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground', className)}>
        选择一个角色以查看详细信息。
      </div>
    )
  }

  const characterMap = new Map(characters.map(item => [item.id, item]))
  const related = relationships.filter(rel => rel.sourceId === character.id || rel.targetId === character.id)
  const badges = [...(character.traits ?? []), ...(character.keywords ?? [])]
  const color = getCharacterColor(character)

  return (
    <div className={cn('rounded-xl border border-border bg-card p-4 shadow-sm', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">角色详情</h3>
          <p className="text-xs text-muted-foreground">查看人物设定与关系</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => onEditCharacter(character.id)}>
          <Pencil className="h-3.5 w-3.5" />
          编辑角色
        </Button>
      </div>

      <div className="mt-4 space-y-4 text-xs">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border"
            style={{ backgroundColor: character.avatar ? 'transparent' : color }}
          >
            {character.avatar
              ? (
                  <img src={character.avatar} alt={character.name} className="h-10 w-10 rounded-full object-cover" />
                )
              : (
                  <ImageIcon className="h-4 w-4 text-white" />
                )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{character.name}</p>
            <p className="text-[11px] text-muted-foreground">{character.role ?? '未设置角色定位'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/60 p-3">
            <p className="text-[11px] text-muted-foreground">角色定位</p>
            <p className="mt-1 text-sm font-medium text-foreground">{character.role ?? '未设置'}</p>
          </div>
          <div className="rounded-lg border border-border/60 p-3">
            <p className="text-[11px] text-muted-foreground">首次登场</p>
            <p className="mt-1 text-sm font-medium text-foreground">{character.first_appearance ?? '未设置'}</p>
          </div>
        </div>

        <div>
          <p className="text-[11px] text-muted-foreground">人物描述</p>
          <p className="mt-1 rounded-lg border border-border/60 bg-muted/40 p-3 text-xs leading-relaxed text-foreground">
            {character.description ?? '暂无人物描述。'}
          </p>
        </div>

        <div>
          <p className="text-[11px] text-muted-foreground">灵感备注</p>
          <p className="mt-1 rounded-lg border border-border/60 bg-muted/40 p-3 text-xs leading-relaxed text-foreground">
            {character.note ?? '暂无灵感备注。'}
          </p>
        </div>

        {badges.length > 0 && (
          <div>
            <p className="text-[11px] text-muted-foreground">特质 / 关键词</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {badges.map(tag => (
                <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2">
            <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-[11px] text-muted-foreground">相关关系</p>
          </div>
          <div className="mt-2 space-y-2">
            {related.length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-3 text-[11px] text-muted-foreground">
                暂无关系，点击画布边或右侧按钮新增。
              </div>
            )}
            {related.map((rel) => {
              const otherId = rel.sourceId === character.id ? rel.targetId : rel.sourceId
              const other = characterMap.get(otherId)
              return (
                <button
                  key={rel.id}
                  type="button"
                  onClick={() => onEditRelationship(rel.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-border/60 bg-background px-3 py-2 text-left text-xs text-foreground transition hover:border-primary/40"
                >
                  <div>
                    <p className="font-medium">{other?.name ?? '未知角色'}</p>
                    <p className="text-[11px] text-muted-foreground">{formatRelationshipLabel(rel)}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground">编辑</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
