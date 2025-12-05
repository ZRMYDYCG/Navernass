'use client'

import { Plus } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const isNovelsPage = pathname === '/novels'

  const handleCreateNovel = () => {
    router.push('/novels?action=create')
  }

  return (
    <header className="h-16 flex items-center justify-end px-4 sm:px-6 transition-colors">
      {isNovelsPage && (
        <Button
          onClick={handleCreateNovel}
          className="cursor-pointer bg-black dark:bg-zinc-800 text-white hover:bg-gray-800 dark:hover:bg-gray-700 h-9 px-3 sm:h-10 sm:px-4"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">新建小说</span>
        </Button>
      )}
    </header>
  )
}
