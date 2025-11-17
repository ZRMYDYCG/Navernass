'use client'

import { useTheme } from 'next-themes'
import { Avatar } from '@/components/ui/avatar'

export function TypingIndicator() {
  const { theme } = useTheme()
  const avatarSrc = theme === 'dark' ? '/assets/svg/logo-light.svg' : '/assets/svg/logo-dark.svg'

  return (
    <div className="flex gap-2 py-1.5 animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
      <div className="shrink-0">
        <Avatar className="w-5 h-5">
          <img src={avatarSrc} alt="AI Avatar" className="w-full h-full object-cover" />
        </Avatar>
      </div>

      <div className="flex items-center">
        <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
          <div className="flex gap-1 items-center">
            <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-zinc-400 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  )
}
