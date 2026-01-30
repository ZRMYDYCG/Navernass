'use client'

import type { Novel } from '@/lib/supabase/sdk'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { novelsApi } from '@/lib/supabase/sdk'
import { cn } from '@/lib/utils'

interface RecentNovelsProps {
  maxItems?: number
  className?: string
}

export function RecentNovels({ maxItems = 3, className }: RecentNovelsProps) {
  const router = useRouter()
  const [novels, setNovels] = useState<Novel[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecentNovels = async () => {
      try {
        setIsLoading(true)
        // 获取第一页数据，然后客户端排序
        const result = await novelsApi.getList({ page: 1, pageSize: 10 })
        const sortedNovels = result.data
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, maxItems)

        setNovels(sortedNovels)
      } catch (error) {
        console.error('Failed to fetch recent novels:', error)
        setNovels([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentNovels()
  }, [maxItems])

  return (
    <section className={cn('mt-10', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border text-[10px]">⏱</span>
        <span>最近打开</span>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => router.push('/novels?action=create')}
          className={cn(
            'group relative aspect-[3/4] rounded-2xl border border-dashed border-border bg-background/40 hover:bg-background/60 transition-colors text-left',
          )}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-xl text-muted-foreground">+</div>
            <div className="text-sm font-medium text-foreground">新建小说</div>
            <div className="text-xs text-muted-foreground">开始你的第一章</div>
          </div>
        </button>

        {isLoading
          ? Array.from({ length: maxItems - 1 }).map((_, index) => (
              <div key={index} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
            ))
          : novels.map(novel => (
              <button
                key={novel.id}
                type="button"
                onClick={() => router.push(`/editor?id=${novel.id}`)}
                className={cn(
                  'group relative aspect-[3/4] rounded-2xl border border-border bg-card hover:bg-card/90 transition-colors text-left overflow-hidden',
                )}
              >
                <div className="h-[55%] w-full bg-secondary/60 relative">
                  {novel.cover
                    ? (
                        <img src={novel.cover} alt={novel.title} className="h-full w-full object-cover" />
                      )
                    : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground font-serif">
                          {novel.title.slice(0, 1)}
                        </div>
                      )}
                  <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[16px_16px]" />
                </div>

                <div className="p-4 flex flex-col gap-2">
                  <div className="text-base font-medium text-foreground font-serif line-clamp-2">{novel.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {novel.description || '暂无简介...'}
                  </div>
                </div>
              </button>
            ))}
      </div>
    </section>
  )
}
