'use client'

import { ChevronRight } from 'lucide-react'

interface BreadcrumbProps {
  novelTitle: string
  chapterTitle: string
}

export function Breadcrumb({ novelTitle, chapterTitle }: BreadcrumbProps) {
  return (
    <div className="px-6 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">{novelTitle}</span>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="text-xs text-gray-700 dark:text-gray-300">{chapterTitle}</span>
      </div>
    </div>
  )
}
