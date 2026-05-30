'use client'

import { cn } from '@/lib/utils'

/** 流式输出末尾光标（ChatGPT / Claude 同款块状光标） */
export function StreamCaret({ className }: { className?: string }) {
  return (
    <span
      className={cn('agui-stream-caret', className)}
      aria-hidden
    />
  )
}
