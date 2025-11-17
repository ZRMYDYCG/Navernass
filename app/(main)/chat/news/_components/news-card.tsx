'use client'

import type { NewsItem } from '../types'
import { Button } from '@/components/ui/button'
import { UI_CONFIG } from '../config'

interface NewsCardProps {
  item: NewsItem
}

export function NewsCard({ item }: NewsCardProps) {
  const getStatusLabel = () => {
    if (!item.status) return null
    return UI_CONFIG.statusLabels[item.status]
  }

  const statusLabel = getStatusLabel()

  return (
    <div className="rounded-lg overflow-hidden">
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1">
            {item.title}
          </h3>
          <div className="flex items-center gap-3 shrink-0">
            {statusLabel && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs px-3 py-1 h-auto font-medium border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                {statusLabel}
              </Button>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {item.date}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
          {item.description}
        </p>
      </div>

      <div className="px-6 pb-4">
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-700">
          <img
            src={item.coverImage}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}
