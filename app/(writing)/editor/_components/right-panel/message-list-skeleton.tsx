'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

export function MessageListSkeleton() {
  return (
    <div className="relative h-full w-full">
      <ScrollArea className="h-full w-full">
        <div className="space-y-1 pb-4">
          {/* 用户消息骨架 */}
          <div className="flex gap-3 py-3 flex-row-reverse">
            <div className="flex-1 max-w-[85%] flex justify-end">
              <div className="rounded-xl px-3 py-2 text-sm bg-stone-100 dark:bg-zinc-700 w-full max-w-[80%]">
                <Skeleton className="h-4 w-full mb-1 bg-stone-200 dark:bg-zinc-600" />
                <Skeleton className="h-4 w-[70%] bg-stone-200 dark:bg-zinc-600" />
              </div>
            </div>
          </div>

          {/* AI 消息骨架 */}
          <div className="flex gap-3 py-3 flex-row">
            <div className="shrink-0">
              <Skeleton className="w-7 h-7 rounded-full bg-stone-200 dark:bg-zinc-700" />
            </div>
            <div className="flex-1 max-w-[85%] flex justify-start">
              <div className="rounded-xl px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 w-full shadow-sm">
                <Skeleton className="h-4 w-full mb-1 bg-stone-100 dark:bg-zinc-700" />
                <Skeleton className="h-4 w-full mb-1 bg-stone-100 dark:bg-zinc-700" />
                <Skeleton className="h-4 w-[85%] bg-stone-100 dark:bg-zinc-700" />
              </div>
            </div>
          </div>

          {/* 用户消息骨架 */}
          <div className="flex gap-3 py-3 flex-row-reverse">
            <div className="flex-1 max-w-[85%] flex justify-end">
              <div className="rounded-xl px-3 py-2 text-sm bg-stone-100 dark:bg-zinc-700 w-full max-w-[75%]">
                <Skeleton className="h-4 w-full mb-1 bg-stone-200 dark:bg-zinc-600" />
                <Skeleton className="h-4 w-[60%] bg-stone-200 dark:bg-zinc-600" />
              </div>
            </div>
          </div>

          {/* AI 消息骨架 */}
          <div className="flex gap-3 py-3 flex-row">
            <div className="shrink-0">
              <Skeleton className="w-7 h-7 rounded-full bg-stone-200 dark:bg-zinc-700" />
            </div>
            <div className="flex-1 max-w-[85%] flex justify-start">
              <div className="rounded-xl px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 w-full shadow-sm">
                <Skeleton className="h-4 w-full mb-1 bg-stone-100 dark:bg-zinc-700" />
                <Skeleton className="h-4 w-full mb-1 bg-stone-100 dark:bg-zinc-700" />
                <Skeleton className="h-4 w-full mb-1 bg-stone-100 dark:bg-zinc-700" />
                <Skeleton className="h-4 w-[90%] bg-stone-100 dark:bg-zinc-700" />
              </div>
            </div>
          </div>

          {/* 用户消息骨架 */}
          <div className="flex gap-3 py-3 flex-row-reverse">
            <div className="flex-1 max-w-[85%] flex justify-end">
              <div className="rounded-xl px-3 py-2 text-sm bg-stone-100 dark:bg-zinc-700 w-full max-w-[70%]">
                <Skeleton className="h-4 w-full bg-stone-200 dark:bg-zinc-600" />
              </div>
            </div>
          </div>

          {/* AI 消息骨架 */}
          <div className="flex gap-3 py-3 flex-row">
            <div className="shrink-0">
              <Skeleton className="w-7 h-7 rounded-full bg-stone-200 dark:bg-zinc-700" />
            </div>
            <div className="flex-1 max-w-[85%] flex justify-start">
              <div className="rounded-xl px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 w-full shadow-sm">
                <Skeleton className="h-4 w-full mb-1 bg-stone-100 dark:bg-zinc-700" />
                <Skeleton className="h-4 w-[80%] bg-stone-100 dark:bg-zinc-700" />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
