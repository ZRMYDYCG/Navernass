'use client'

import { Spinner } from '@/components/ui/spinner'

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Spinner className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      <span className="text-sm text-gray-500 dark:text-gray-400">AI 正在思考...</span>
    </div>
  )
}
