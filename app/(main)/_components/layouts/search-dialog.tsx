'use client'

import { Book, MessageSquare, Route, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

type SearchScope = 'all' | 'novels' | 'chats' | 'routes'

interface SearchItem {
  id: string
  title: string
  description?: string
}

interface SearchSection {
  id: string
  title: string
  scope: SearchScope
  icon: typeof Book
  emptyText: string
  items: SearchItem[]
}

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<SearchScope>('all')

  const sections = useMemo<SearchSection[]>(() => {
    return [
      {
        id: 'recent-novels',
        title: '最近编辑的小说',
        scope: 'novels',
        icon: Book,
        emptyText: '暂无最近编辑的小说',
        items: [],
      },
      {
        id: 'recent-chats',
        title: '最近对话',
        scope: 'chats',
        icon: MessageSquare,
        emptyText: '暂无最近对话',
        items: [],
      },
      {
        id: 'routes',
        title: '页面路由',
        scope: 'routes',
        icon: Route,
        emptyText: '暂无可搜索页面',
        items: [],
      },
    ]
  }, [])

  const visibleSections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return sections
      .filter(section => scope === 'all' || section.scope === scope)
      .map(section => {
        if (!normalizedQuery) {
          return section
        }
        const filteredItems = section.items.filter(item => {
          const inTitle = item.title.toLowerCase().includes(normalizedQuery)
          const inDescription = item.description?.toLowerCase().includes(normalizedQuery)
          return inTitle || Boolean(inDescription)
        })
        return { ...section, items: filteredItems }
      })
  }, [query, scope, sections])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setQuery('')
      setScope('all')
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-[18%] translate-y-0 max-w-2xl p-0 gap-0 overflow-hidden shadow-2xl"
      >
        <DialogTitle className="sr-only">搜索</DialogTitle>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/20">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={event => setQuery(event.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none h-6"
            placeholder="搜索小说、对话、页面..."
          />
          <button
            type="button"
            className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-sm flex items-center justify-center"
            onClick={() => handleOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-border bg-background">
          {[
            { id: 'all', label: '全部' },
            { id: 'novels', label: '小说' },
            { id: 'chats', label: '对话' },
            { id: 'routes', label: '页面' },
          ].map(item => {
            const isActive = scope === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setScope(item.id as SearchScope)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:bg-accent hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <div className="max-h-[62vh] overflow-y-auto">
          {visibleSections.map(section => {
            const Icon = section.icon
            return (
              <div key={section.id} className="py-3">
                <div className="flex items-center gap-2 px-4 text-xs font-medium text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{section.title}</span>
                </div>
                {section.items.length === 0
                  ? (
                      <div className="px-4 pt-2 text-sm text-muted-foreground">{section.emptyText}</div>
                    )
                  : (
                      <ul className="mt-2 space-y-1 px-2">
                        {section.items.map(item => (
                          <li key={item.id}>
                            <button
                              type="button"
                              className="flex w-full flex-col gap-0.5 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
                            >
                              <span className="truncate">{item.title}</span>
                              {item.description && (
                                <span className="text-xs text-muted-foreground truncate">
                                  {item.description}
                                </span>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
