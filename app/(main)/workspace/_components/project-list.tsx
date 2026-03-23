'use client'

import type { NovelFormData } from '../../novels/types'
import type { Novel } from '@/lib/supabase/sdk'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Book, PenTool, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { novelsApi } from '@/lib/supabase/sdk'
import { cn } from '@/lib/utils'
import { NovelDialog } from '../../novels/_components/novel-dialog'

export function ProjectList() {
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
      toast.success('创建成功')
      setOpen(false)
      router.push(`/editor?id=${novel.id}`)
    } catch (error) {
      toast.error('创建失败')
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
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button
          onClick={() => setOpen(true)}
          className="group relative flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-muted hover:border-primary/50 bg-muted/20 hover:bg-muted/40 transition-all duration-300"
        >
          <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
            <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
          </div>
          <span className="font-medium text-muted-foreground group-hover:text-foreground">新建作品</span>
        </button>

        {novels.map(novel => (
          <Link
            key={novel.id}
            href={`/editor?id=${novel.id}`}
            className="group relative flex flex-col h-48 rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <PenTool className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex-1">
              <h4 className="font-serif font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                {novel.title}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {novel.description || '暂无描述...'}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
              <span className="flex items-center gap-1.5">
                <span className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  novel.status === 'published' ? 'bg-green-500' : 'bg-amber-500',
                )}
                />
                {novel.status === 'published' ? '连载中' : '草稿'}
              </span>
              <span>
                {formatDistanceToNow(new Date(novel.updated_at), { addSuffix: true, locale: zhCN })}
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
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
