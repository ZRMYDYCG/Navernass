'use client'

import { Plus } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { ThemeSection } from '@/components/theme-select'
import { Button } from '@/components/ui/button'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const isNovelsPage = pathname === '/novels'

  const handleCreateNovel = () => {
    router.push('/novels?action=create')
  }

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 transition-colors">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200"></h2>
      </div>
      <div className="flex items-center gap-4">
        {isNovelsPage && (
          <Button
            onClick={handleCreateNovel}
            className="cursor-pointer bg-black dark:bg-gray-800 text-white hover:bg-gray-800 dark:hover:bg-gray-700"
          >
            <Plus className="w-4 h-4" />
            新建小说
          </Button>
        )}
        <ThemeSection />
      </div>
    </header>
  )
}
