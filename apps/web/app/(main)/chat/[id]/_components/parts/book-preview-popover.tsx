'use client'

import type { Novel } from '@/lib/supabase/sdk'
import { BookMarked, BookOpen, Hash, Loader2, ScrollText, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { novelsApi } from '@/lib/supabase/sdk'
import { cn } from '@/lib/utils'

interface BookPreviewPopoverProps {
  bookId: string
  title: string
  /** 触发节点（通常是一个 chip） */
  children: React.ReactNode
  className?: string
}

interface NovelCharacterLike {
  id?: string
  name?: string
  role?: string
  description?: string
  avatar?: string
}

function isPublishedStatus(status: string | undefined): boolean {
  return status === 'published'
}

function statusLabel(status: string | undefined, isZh: boolean): string {
  if (isPublishedStatus(status)) return isZh ? '已发布' : 'Published'
  if (status === 'archived') return isZh ? '已归档' : 'Archived'
  return isZh ? '草稿' : 'Draft'
}

function pickCharacters(novel: Novel | null | undefined): NovelCharacterLike[] {
  const raw = (novel as { characters?: unknown })?.characters
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (item): item is NovelCharacterLike => !!item && typeof item === 'object',
  )
}

function initials(name: string): string {
  return name.slice(0, 1).toUpperCase()
}

/**
 * Hover 书本 chip 弹出书本详情卡（封面/简介/标签/统计 + 角色头像组）。
 * 鼠标在 trigger 或内容上时保持 open，离开两侧且空闲 120ms 后关闭。
 */
export function BookPreviewPopover({
  bookId,
  title,
  children,
  className,
}: BookPreviewPopoverProps) {
  const [open, setOpen] = useState(false)
  const [novel, setNovel] = useState<Novel | null>(null)
  const [loading, setLoading] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const scheduleClose = () => {
    cancelClose()
    closeTimerRef.current = setTimeout(() => setOpen(false), 120)
  }

  const ensureLoaded = () => {
    if (loading || novel?.id === bookId) return
    setLoading(true)
    novelsApi
      .getById(bookId)
      .then((data) => {
        setNovel(data)
      })
      .catch((err) => {
        console.error('[BookPreviewPopover] getById failed:', err)
        setNovel(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => () => cancelClose(), [])

  const handleOpen = () => {
    cancelClose()
    ensureLoaded()
    setOpen(true)
  }

  const characters = pickCharacters(novel)
  const charactersToShow = characters.slice(0, 6)
  const moreCount = Math.max(0, characters.length - charactersToShow.length)

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) ensureLoaded()
        setOpen(next)
      }}
    >
      <PopoverTrigger asChild>
        <span
          className={cn('inline-block', className)}
          onMouseEnter={handleOpen}
          onMouseLeave={scheduleClose}
          onFocus={handleOpen}
          onBlur={scheduleClose}
        >
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-80 p-0 overflow-hidden"
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      >
        {loading && !novel
          ? (
              <div className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                <span>正在加载书本信息…</span>
              </div>
            )
          : novel
            ? <BookPreviewBody novel={novel} characters={charactersToShow} moreCount={moreCount} />
            : <BookPreviewFallback title={title} />}
      </PopoverContent>
    </Popover>
  )
}

function BookPreviewFallback({ title }: { title: string }) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <BookMarked className="size-4 text-amber-600" />
        <span className="truncate">{title}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">无法加载详细信息</p>
    </div>
  )
}

function BookPreviewBody({
  novel,
  characters,
  moreCount,
}: {
  novel: Novel
  characters: NovelCharacterLike[]
  moreCount: number
}) {
  const tags = (novel.tags ?? []).slice(0, 4)
  const statusTone = isPublishedStatus(novel.status)
    ? 'border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400'
    : 'border-border text-muted-foreground'
  const isZh = typeof navigator !== 'undefined' && /zh/i.test(navigator.language)

  return (
    <div className="flex flex-col">
      <div className="relative h-24 w-full bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent flex items-center justify-center overflow-hidden">
        {novel.cover
          ? (
              <img
                src={novel.cover}
                alt={novel.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )
          : (
              <BookOpen className="size-8 text-amber-600/70" />
            )}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1.5">
          <span className={cn('text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded-sm border bg-background/85 backdrop-blur-sm', statusTone)}>
            {statusLabel(novel.status, isZh)}
          </span>
          {novel.category && (
            <span className="text-[10px] text-muted-foreground/90 px-1.5 py-0.5 rounded-sm bg-background/85 backdrop-blur-sm font-serif italic">
              {novel.category}
            </span>
          )}
        </div>
      </div>

      <div className="px-3.5 py-3 space-y-2.5">
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground leading-snug line-clamp-2">
            {novel.title}
          </h3>
          {novel.description && (
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {novel.description}
            </p>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map(tag => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-[10px] text-muted-foreground/80 border border-border/60 rounded-sm bg-muted/40 font-mono"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 text-[10px] text-muted-foreground/80 font-mono tracking-wide border-t border-border/50 pt-2">
          <span className="flex items-center gap-1">
            <ScrollText className="size-3" />
            {Math.round(novel.word_count / 100) / 10}
            k 字
          </span>
          <span className="flex items-center gap-1">
            <Hash className="size-3" />
            {novel.chapter_count}
            {' '}
            章
          </span>
        </div>

        {characters.length > 0 && (
          <div className="border-t border-border/50 pt-2.5 space-y-1.5">
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
              <User className="size-3" />
              <span>主要角色</span>
              <span className="ml-auto text-muted-foreground/60">
                共
                {characters.length}
                {moreCount > 0 ? `+${moreCount}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {characters.map((c) => {
                const id = c.id ?? c.name ?? ''
                const name = c.name ?? '未命名'
                return (
                  <div
                    key={id}
                    className="flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full border border-chart-2/20 bg-chart-2/5 text-[10px] text-foreground/80"
                    title={c.description || name}
                  >
                    <Avatar className="size-4 rounded-full overflow-hidden">
                      {c.avatar
                        ? <img src={c.avatar} alt={name} className="w-full h-full object-cover" />
                        : (
                            <AvatarFallback className="bg-chart-2/20 text-chart-2 text-[9px] font-semibold rounded-full">
                              {initials(name)}
                            </AvatarFallback>
                          )}
                    </Avatar>
                    <span className="truncate max-w-[64px]">{name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
