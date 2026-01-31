'use client'

import { X } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { conversationsApi } from '@/lib/supabase/sdk'
import type { Conversation } from '@/lib/supabase/sdk/types'
import type { Novel } from '@/lib/supabase/sdk/types'
import { novelsApi } from '@/lib/supabase/sdk'

interface SearchItem {
  id: string
  title: string
  type: 'novel' | 'chat' | 'route'
  description?: string
  path?: string
}

const ROUTES: SearchItem[] = [
  { id: 'chat', title: '创作助手', type: 'route', path: '/chat' },
  { id: 'novels', title: '我的小说', type: 'route', path: '/novels' },
  { id: 'trash', title: '回收站', type: 'route', path: '/trash' },
  { id: 'chat-news', title: '产品动态', type: 'route', path: '/chat/news' },
]

const TYPE_CONFIG = {
  novel: { label: '小说', color: 'text-muted-foreground bg-muted' },
  chat: { label: '对话', color: 'text-muted-foreground bg-muted' },
  route: { label: '页面', color: 'text-muted-foreground bg-muted' },
}

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState('')
  const [novels, setNovels] = useState<Novel[]>([])
  const [chats, setChats] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    const loadData = async () => {
      setLoading(true)
      try {
        const [novelsResult, conversationsResult] = await Promise.all([
          novelsApi.getList({ page: 1, pageSize: 50 }),
          conversationsApi.getRecent(50),
        ])
        setNovels(novelsResult.data)
        setChats(conversationsResult)
      } catch (error) {
        console.error('Failed to load search data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [open])

  useEffect(() => {
    if (!open) {
      setQuery('')
    }
  }, [open])

  const allItems = useMemo<SearchItem[]>(() => {
    const novelItems: SearchItem[] = novels.map(n => ({
      id: n.id,
      title: n.title,
      type: 'novel' as const,
      description: n.description,
      path: `/novels/${n.id}`,
    }))

    const chatItems: SearchItem[] = chats.map(c => ({
      id: c.id,
      title: c.title,
      type: 'chat' as const,
      description: new Date(c.created_at).toLocaleDateString(),
      path: `/chat/${c.id}`,
    }))

    return [...novelItems, ...chatItems, ...ROUTES]
  }, [novels, chats])

  const filteredItems = useMemo<SearchItem[]>(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) {
      return allItems.slice(0, 10)
    }
    return allItems.filter(item => {
      const inTitle = item.title.toLowerCase().includes(normalizedQuery)
      const inDescription = item.description?.toLowerCase().includes(normalizedQuery)
      return inTitle || Boolean(inDescription)
    })
  }, [query, allItems])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setQuery('')
    }
    onOpenChange(nextOpen)
  }

  const handleItemClick = (item: SearchItem) => {
    if (item.path) {
      if (item.path.startsWith('/chat/') && pathname.startsWith('/chat/')) {
        router.refresh()
      }
      router.push(item.path)
    }
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-[18%] translate-y-0 max-w-2xl p-0 gap-0 overflow-hidden shadow-2xl"
      >
        <DialogTitle className="sr-only">搜索</DialogTitle>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/20">
          <input
            autoFocus
            value={query}
            onChange={event => setQuery(event.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none h-6"
            placeholder="搜索..."
          />
          <button
            type="button"
            className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-sm flex items-center justify-center"
            onClick={() => handleOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[62vh] overflow-y-auto">
          {loading && (
            <div className="px-4 py-8 text-sm text-muted-foreground text-center">
              加载中...
            </div>
          )}
          {!loading && (
            filteredItems.length === 0
              ? (
                  <div className="px-4 py-8 text-sm text-muted-foreground text-center">
                    {query ? '未找到相关内容' : '输入关键词搜索...'}
                  </div>
                )
              : (
                  <ul className="py-2 space-y-1 px-2">
                    {filteredItems.map(item => {
                      const config = TYPE_CONFIG[item.type]
                      return (
                        <li key={`${item.type}-${item.id}`}>
                          <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
                            onClick={() => handleItemClick(item)}
                          >
                            <span className="truncate flex-1">{item.title}</span>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium',
                                config.color
                              )}
                            >
                              {config.label}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
