'use client'

import type { Conversation, Novel } from '@/lib/supabase/sdk/types'

import { X } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useI18n } from '@/hooks/use-i18n'
import { conversationsApi, novelsApi } from '@/lib/supabase/sdk'

import { cn } from '@/lib/utils'

interface SearchItem {
  id: string
  title: string
  type: 'novel' | 'chat' | 'route'
  description?: string
  path?: string
}

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [novels, setNovels] = useState<Novel[]>([])
  const [chats, setChats] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)

  const routes = useMemo<SearchItem[]>(() => ([
    { id: 'chat', title: t('main.search.routes.chat'), type: 'route', path: '/chat' },
    { id: 'novels', title: t('main.search.routes.novels'), type: 'route', path: '/novels' },
    { id: 'trash', title: t('main.search.routes.trash'), type: 'route', path: '/trash' },
    { id: 'chat-news', title: t('main.search.routes.news'), type: 'route', path: '/chat/news' },
  ]), [t])

  const typeConfig = useMemo(() => ({
    novel: { label: t('main.search.types.novel'), color: 'text-muted-foreground bg-muted' },
    chat: { label: t('main.search.types.chat'), color: 'text-muted-foreground bg-muted' },
    route: { label: t('main.search.types.route'), color: 'text-muted-foreground bg-muted' },
  }), [t])

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

    return [...novelItems, ...chatItems, ...routes]
  }, [novels, chats, routes])

  const filteredItems = useMemo<SearchItem[]>(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) {
      return allItems.slice(0, 10)
    }
    return allItems.filter((item) => {
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
        <DialogTitle className="sr-only">{t('main.search.title')}</DialogTitle>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/20">
          <input
            autoFocus
            value={query}
            onChange={event => setQuery(event.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none h-6"
            placeholder={t('main.search.placeholder')}
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
              {t('main.search.loading')}
            </div>
          )}
          {!loading && (
            filteredItems.length === 0
              ? (
                  <div className="px-4 py-8 text-sm text-muted-foreground text-center">
                    {query ? t('main.search.empty.noResults') : t('main.search.empty.hint')}
                  </div>
                )
              : (
                  <ul className="py-2 space-y-1 px-2">
                    {filteredItems.map((item) => {
                      const config = typeConfig[item.type]
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
                                config.color,
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
