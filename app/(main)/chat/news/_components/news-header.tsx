'use client'

import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UI_CONFIG } from '../config'

export function NewsHeader() {
  const router = useRouter()

  return (
    <header className="relative flex flex-col items-center justify-center py-12 px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => router.back()}
        className="absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        aria-label="关闭"
      >
        <X className="w-5 h-5" />
      </Button>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {UI_CONFIG.header.title}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {UI_CONFIG.header.subtitle}
        </p>
      </div>
    </header>
  )
}
