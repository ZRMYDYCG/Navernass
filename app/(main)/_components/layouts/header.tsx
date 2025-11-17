'use client'

import { Plus } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { ThemeSection } from '@/components/theme-select'
import { Button } from '@/components/ui/button'
import { AppLogo } from '../app-logo'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const isNovelsPage = pathname === '/novels'

  const handleCreateNovel = () => {
    router.push('/novels?action=create')
  }

  return (
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 transition-colors">
      <div className="flex items-center gap-3 sm:gap-4">
        <AppLogo />
        <div className="flex flex-col">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
            Narraverse
          </h2>
          <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 leading-tight">
            智能写作平台
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {isNovelsPage && (
          <Button
            onClick={handleCreateNovel}
            className="cursor-pointer bg-black dark:bg-zinc-800 text-white hover:bg-gray-800 dark:hover:bg-gray-700 h-9 px-3 sm:h-10 sm:px-4"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">新建小说</span>
          </Button>
        )}
        <ThemeSection />
      </div>
    </header>
  )
}
