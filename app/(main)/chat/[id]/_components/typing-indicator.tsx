'use client'

import { useTheme } from 'next-themes'
import { Avatar } from '@/components/ui/avatar'

export function TypingIndicator() {
  const { theme } = useTheme()
  const avatarSrc = theme === 'dark' ? '/assets/svg/logo-light.svg' : '/assets/svg/logo-dark.svg'

  return (
    <div className="flex gap-4 py-4 px-4 sm:px-6 flex-row">
      <div className="flex-shrink-0">
        <Avatar className="w-8 h-8">
          <img src={avatarSrc} alt="AI Avatar" className="w-full h-full object-cover" />
        </Avatar>
      </div>

      <div className="flex items-center">
        <div className="flex gap-1 items-center">
          <div className="w-2 h-2 bg-gray-500 dark:bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-gray-500 dark:bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-gray-500 dark:bg-zinc-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  )
}
