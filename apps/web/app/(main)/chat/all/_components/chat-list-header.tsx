'use client'

import type { Dispatch, SetStateAction } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

interface ChatListHeaderProps {
  searchQuery: string
  setSearchQuery: Dispatch<SetStateAction<string>>
  chatCount: number
}

export function ChatListHeader({ searchQuery, setSearchQuery, chatCount }: ChatListHeaderProps) {
  const router = useRouter()
  const { t } = useI18n()

  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/chat')}
        className="text-muted-foreground hover:text-foreground cursor-pointer"
      >
        {t('chat.all.back')}
      </Button>

      <h1 className="text-sm font-medium text-foreground">
        {t('chat.all.title')}
        <span className="ml-1.5 text-xs font-normal text-muted-foreground tabular-nums">
          {chatCount}
        </span>
      </h1>

      <div className="ml-auto relative w-64 max-w-full">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder={t('chat.all.toolbar.searchPlaceholder')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className={cn('h-8 pl-8 text-sm')}
        />
      </div>
    </header>
  )
}
