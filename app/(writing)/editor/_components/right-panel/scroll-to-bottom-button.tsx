'use client'

import { ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ScrollToBottomButtonProps {
  onClick: () => void
  show: boolean
}

export function ScrollToBottomButton({ onClick, show }: ScrollToBottomButtonProps) {
  if (!show)
    return null

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
      <Button
        onClick={onClick}
        size="icon"
        className="h-9 w-9 rounded-full shadow-lg bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-opacity"
        variant="outline"
        title="回到底部"
      >
        <ArrowDown className="w-4 h-4" />
      </Button>
    </div>
  )
}
