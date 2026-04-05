'use client'

import type { NovelFormData } from '../../novels/types'
import type { Novel } from '@/lib/supabase/sdk'
import { formatDistanceToNow } from 'date-fns'
import { enUS, zhCN } from 'date-fns/locale'
import { Book, PenTool, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n, useLocale } from '@/hooks/use-i18n'
import { novelsApi } from '@/lib/supabase/sdk'
import { cn } from '@/lib/utils'
import { NovelDialog } from '../../novels/_components/novel-dialog'

export function ProjectList() {
  const { t } = useI18n()
  const { locale } = useLocale()
  const [novels, setNovels] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSave = async (data: NovelFormData) => {
    try {
      const novel = await novelsApi.create({
        title: data.title,
        description: data.description,
        cover: data.cover,
      })
      toast.success(t('workspace.projectList.createSuccess'))
      setOpen(false)
      router.push(`/editor?id=${novel.id}`)
    } catch (error) {
      toast.error(t('workspace.projectList.createError'))
      console.error(error)
    }
  }

  useEffect(() => {
    novelsApi.getList({ page: 1, pageSize: 6 }).then((res) => {
      setNovels(res.data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-[220px] rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div className="mb-10 space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <h3 className="text-2xl font-serif font-medium tracking-tight text-foreground">
          {t('workspace.projectList.title')}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button
          onClick={() => setOpen(true)}
          className="group relative flex flex-col items-center justify-center h-[220px] rounded-2xl border-2 border-dashed border-border/60 hover:border-primary/50 bg-secondary/20 hover:bg-secondary/40 transition-all duration-500 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50 pointer-events-none" />
          <div className="relative z-10 h-14 w-14 rounded-full bg-background flex items-center justify-center shadow-paper-sm mb-4 group-hover:scale-110 group-hover:shadow-paper-md transition-all duration-500 border border-border/50">
            <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="relative z-10 font-serif font-medium text-muted-foreground group-hover:text-foreground tracking-wide transition-colors">{t('workspace.projectList.createNew')}</span>
        </button>

        {novels.map(novel => (
          <Link
            key={novel.id}
            href={`/editor?id=${novel.id}`}
            className="group relative flex flex-col h-[220px] rounded-2xl border border-border bg-card p-6 shadow-paper-sm hover:shadow-paper-md transition-all duration-500 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute top-4 right-4 p-2 rounded-full bg-secondary/50 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <PenTool className="h-4 w-4 text-foreground/70" />
            </div>

            <div className="flex-1 mt-2">
              <div className="flex items-center gap-2 mb-3">
                <Book className="h-4 w-4 text-primary/60" />
                <h4 className="font-serif font-bold text-xl line-clamp-1 group-hover:text-primary transition-colors duration-300">
                  {novel.title}
                </h4>
              </div>
              <p className="text-sm text-muted-foreground/80 line-clamp-3 leading-relaxed font-light">
                {novel.description || t('workspace.projectList.emptyDescription')}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground/70 border-t border-border/50 pt-4 font-mono tracking-tight">
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/50">
                <span className={cn(
                  'w-1.5 h-1.5 rounded-full animate-pulse',
                  novel.status === 'published' ? 'bg-green-500' : 'bg-amber-500',
                )}
                />
                {novel.status === 'published' ? t('workspace.projectList.statusPublished') : t('workspace.projectList.statusDraft')}
              </span>
              <span>
                {formatDistanceToNow(new Date(novel.updated_at), { addSuffix: true, locale: locale === 'zh-CN' ? zhCN : enUS })}
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </Link>
        ))}
      </div>

      <NovelDialog
        open={open}
        novel={null}
        onOpenChange={setOpen}
        onSave={handleSave}
      />
    </div>
  )
}
