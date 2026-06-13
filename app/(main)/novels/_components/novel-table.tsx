'use client'

import type { Novel } from '@/lib/supabase/sdk'
import * as Popover from '@radix-ui/react-popover'
import { formatDistanceToNow } from 'date-fns'
import { enUS, zhCN } from 'date-fns/locale'
import { Edit2, MoreHorizontal, Play, Trash2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useI18n, useLocale } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

interface NovelTableProps {
  novels: Novel[]
  loading: boolean
  onOpenNovel: (novel: Novel) => void
  onEditNovel: (novel: Novel) => void
  onDeleteNovel: (novel: Novel) => void
  onContextMenu?: (e: React.MouseEvent, novel: Novel) => void
}

function NovelStatusBadge({ status }: { status: Novel['status'] }) {
  const { t } = useI18n()

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        status === 'published'
          ? 'border border-primary/25 bg-primary/10 text-primary'
          : 'bg-secondary text-secondary-foreground',
      )}
    >
      {status === 'published' ? t('novels.filters.published') : t('novels.filters.draft')}
    </span>
  )
}

function NovelRowMenu({
  novel,
  onOpenNovel,
  onEditNovel,
  onDeleteNovel,
}: {
  novel: Novel
  onOpenNovel: (novel: Novel) => void
  onEditNovel: (novel: Novel) => void
  onDeleteNovel: (novel: Novel) => void
}) {
  const { t } = useI18n()

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="shrink-0 rounded p-1.5 transition-colors hover:bg-accent"
          onClick={e => e.stopPropagation()}
          aria-label={t('novels.table.actions')}
        >
          <MoreHorizontal className="size-4 text-muted-foreground" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 min-w-[160px] rounded-[var(--radius)] border border-border bg-card p-1 shadow-paper-md"
          sideOffset={5}
          align="end"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpenNovel(novel)
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-[var(--radius)] px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
          >
            <Play className="size-4" />
            {t('novels.actions.startWriting')}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onEditNovel(novel)
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-[var(--radius)] px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
          >
            <Edit2 className="size-4" />
            {t('novels.actions.editInfo')}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteNovel(novel)
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-[var(--radius)] px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="size-4" />
            {t('novels.actions.delete')}
          </button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function NovelTableMobile({
  novels,
  onOpenNovel,
  onEditNovel,
  onDeleteNovel,
  onContextMenu,
}: Omit<NovelTableProps, 'loading'>) {
  const { t } = useI18n()
  const { locale } = useLocale()

  return (
    <ul className="space-y-2 md:hidden">
      {novels.map(novel => (
        <li
          key={novel.id}
          className="rounded-[var(--radius)] border border-border bg-card p-3 shadow-paper-sm"
          onContextMenu={onContextMenu ? e => onContextMenu(e, novel) : undefined}
        >
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={() => onOpenNovel(novel)}
              className="min-w-0 flex-1 text-left font-medium text-foreground transition-colors hover:text-primary"
            >
              <span className="line-clamp-2">{novel.title}</span>
            </button>
            <NovelRowMenu
              novel={novel}
              onOpenNovel={onOpenNovel}
              onEditNovel={onEditNovel}
              onDeleteNovel={onDeleteNovel}
            />
          </div>

          {novel.description ? (
            <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
              {novel.description}
            </p>
          ) : null}

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
            <NovelStatusBadge status={novel.status} />
            <span>
              {t('novels.table.chapters')}
              {' '}
              {novel.chapter_count || 0}
            </span>
            <span>
              {t('novels.table.words')}
              {' '}
              {(novel.word_count || 0).toLocaleString(locale === 'zh-CN' ? 'zh-CN' : 'en-US')}
            </span>
            <span>
              {formatDistanceToNow(new Date(novel.updated_at), {
                addSuffix: true,
                locale: locale === 'zh-CN' ? zhCN : enUS,
              })}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}

function NovelTableDesktop({
  novels,
  onOpenNovel,
  onEditNovel,
  onDeleteNovel,
  onContextMenu,
}: Omit<NovelTableProps, 'loading'>) {
  const { t } = useI18n()
  const { locale } = useLocale()

  return (
    <Table variant="ledger" className="w-full min-w-[720px]">
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[140px] px-3 text-left">{t('novels.table.title')}</TableHead>
          <TableHead className="hidden min-w-[160px] px-3 text-left lg:table-cell">{t('novels.table.description')}</TableHead>
          <TableHead className="w-[100px] px-3 text-center">{t('novels.table.status')}</TableHead>
          <TableHead className="hidden w-[80px] px-3 text-center sm:table-cell">{t('novels.table.chapters')}</TableHead>
          <TableHead className="hidden w-[100px] px-3 text-center lg:table-cell">{t('novels.table.words')}</TableHead>
          <TableHead className="hidden min-w-[120px] px-3 text-center xl:table-cell">{t('novels.table.updatedAt')}</TableHead>
          <TableHead className="w-[56px] px-2 text-center">{t('novels.table.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {novels.map(novel => (
          <TableRow
            key={novel.id}
            onContextMenu={onContextMenu ? e => onContextMenu(e, novel) : undefined}
            className="group"
          >
            <TableCell className="px-3 py-3 text-left">
              <button
                type="button"
                onClick={() => onOpenNovel(novel)}
                className="block max-w-[220px] truncate font-medium text-foreground transition-colors hover:text-primary"
                title={novel.title}
              >
                {novel.title}
              </button>
            </TableCell>

            <TableCell className="hidden px-3 py-3 text-left lg:table-cell">
              <span
                className="block max-w-[240px] truncate text-sm text-muted-foreground"
                title={novel.description || ''}
              >
                {novel.description || '—'}
              </span>
            </TableCell>

            <TableCell className="px-3 py-3 text-center">
              <NovelStatusBadge status={novel.status} />
            </TableCell>

            <TableCell className="hidden px-3 py-3 text-center sm:table-cell">
              <span className="text-sm tabular-nums">{novel.chapter_count || 0}</span>
            </TableCell>

            <TableCell className="hidden px-3 py-3 text-center lg:table-cell">
              <span className="text-sm tabular-nums">
                {(novel.word_count || 0).toLocaleString(locale === 'zh-CN' ? 'zh-CN' : 'en-US')}
              </span>
            </TableCell>

            <TableCell className="hidden px-3 py-3 text-center xl:table-cell">
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(novel.updated_at), {
                  addSuffix: true,
                  locale: locale === 'zh-CN' ? zhCN : enUS,
                })}
              </span>
            </TableCell>

            <TableCell className="px-2 py-3 text-center">
              <div className="flex items-center justify-center">
                <NovelRowMenu
                  novel={novel}
                  onOpenNovel={onOpenNovel}
                  onEditNovel={onEditNovel}
                  onDeleteNovel={onDeleteNovel}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function NovelTable({
  novels,
  loading,
  onOpenNovel,
  onEditNovel,
  onDeleteNovel,
  onContextMenu,
}: NovelTableProps) {
  const { t } = useI18n()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Spinner className="size-8" />
        <span className="text-sm text-muted-foreground">{t('novels.loading')}</span>
      </div>
    )
  }

  if (novels.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-muted-foreground">
        <p className="text-lg italic">{t('novels.table.empty')}</p>
      </div>
    )
  }

  const sharedProps = {
    novels,
    onOpenNovel,
    onEditNovel,
    onDeleteNovel,
    onContextMenu,
  }

  return (
    <>
      <NovelTableMobile {...sharedProps} />
      <div className="hidden md:block">
        <NovelTableDesktop {...sharedProps} />
      </div>
    </>
  )
}
