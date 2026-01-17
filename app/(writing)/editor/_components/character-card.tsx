'use client'

import { BookOpen, User } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface Character {
  id: string
  name: string
  role: string
  avatar?: string
  description: string
  traits: string[]
  keywords: string[]
  chapters: string[]
  note?: string
}

interface CharacterCardProps {
  character: Character
  onClick?: () => void
  className?: string
}

export function CharacterCard({ character, onClick, className }: CharacterCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex flex-col gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-sm cursor-pointer',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0 w-10 h-10 overflow-hidden rounded-md border border-border bg-muted">
          {character.avatar
            ? (
                <Image
                  src={character.avatar}
                  alt={character.name}
                  fill
                  className="object-cover"
                />
              )
            : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <User className="w-5 h-5" />
                </div>
              )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-sm text-foreground truncate">
              {character.name}
            </h3>
            {character.chapters.length > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0 bg-muted/50 px-1.5 py-0.5 rounded-sm">
                <BookOpen className="w-3 h-3" />
                <span>{character.chapters[0]}</span>
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate mt-0.5">
            {character.role || '暂无角色定位'}
          </div>
        </div>
      </div>

      {character.description && (
        <div>
          <div className="text-[10px] text-muted-foreground/80 mb-1">人物描述</div>
          <div className="max-h-24 overflow-y-auto pr-1">
            <p className="text-xs text-muted-foreground/80 leading-relaxed whitespace-pre-wrap break-words">
              {character.description}
            </p>
          </div>
        </div>
      )}

      {(character.traits.length > 0 || character.keywords.length > 0) && (
        <div className="flex flex-col gap-1.5 pt-1">
          {character.traits.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="text-[10px] text-muted-foreground/80">关键特质</div>
              <div className="flex flex-wrap gap-1.5">
                {character.traits.slice(0, 4).map((trait, i) => (
                  <span
                    key={`trait-${i}`}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    {trait}
                  </span>
                ))}
                {character.traits.length > 4 && (
                  <span className="text-[10px] text-muted-foreground py-0.5">...</span>
                )}
              </div>
            </div>
          )}

          {character.keywords.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="text-[10px] text-muted-foreground/80">关键词</div>
              <div className="flex flex-wrap gap-1.5">
                {character.keywords.slice(0, 4).map((keyword, i) => (
                  <span
                    key={`kw-${i}`}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] text-muted-foreground bg-muted border border-border"
                  >
                    {keyword}
                  </span>
                ))}
                {character.keywords.length > 4 && (
                  <span className="text-[10px] text-muted-foreground py-0.5">...</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {character.note && (
        <div className="mt-1 pt-2 border-t border-border/50">
          <div className="text-[10px] text-muted-foreground/80 mb-1">灵感备注</div>
          <div className="max-h-16 overflow-y-auto pr-1">
            <p className="text-[10px] text-muted-foreground/70 italic whitespace-pre-wrap break-words">
              {character.note}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
