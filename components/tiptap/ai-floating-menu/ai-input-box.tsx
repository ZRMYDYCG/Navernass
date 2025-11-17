'use client'

import { Star } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface AIInputBoxProps {
  show: boolean
  onToggle: () => void
  prompt: string
  onPromptChange: (prompt: string) => void
  onSubmit: () => void
  isLoading: boolean
}

export function AIInputBox({
  show,
  onToggle,
  prompt,
  onPromptChange,
  onSubmit,
  isLoading,
}: AIInputBoxProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true)
    })
  }, [])

  if (!show) {
    return (
      <button
        type="button"
        onClick={onToggle}
        disabled={isLoading}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
      >
        <Star className="w-3 h-3 text-gray-500 dark:text-gray-400" />
        <span className="text-xs text-gray-700 dark:text-gray-300">向智能助手提问...</span>
        <div className="ml-auto">
          {mounted
            ? (
                <Image
                  src={isDark ? '/assets/svg/logo-dark.svg' : '/assets/svg/logo-light.svg'}
                  alt="AI"
                  width={12}
                  height={12}
                  className="object-contain"
                />
              )
            : (
                <div className="w-3 h-3 bg-gray-300 dark:bg-zinc-600 rounded animate-pulse" />
              )}
        </div>
      </button>
    )
  }

  return (
    <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded shadow-xl w-[320px] overflow-hidden">
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-gray-200 dark:border-gray-700">
        <Star className="w-3 h-3 text-gray-500 dark:text-gray-400" />
        <input
          type="text"
          value={prompt}
          onChange={e => onPromptChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSubmit()
            }
          }}
          placeholder="向智能助手提问..."
          autoFocus
          disabled={isLoading}
          className="flex-1 bg-transparent text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none disabled:opacity-50"
        />
        <div>
          {mounted
            ? (
                <Image
                  src={isDark ? '/assets/svg/logo-dark.svg' : '/assets/svg/logo-light.svg'}
                  alt="AI"
                  width={12}
                  height={12}
                  className="object-contain"
                />
              )
            : (
                <div className="w-3 h-3 bg-gray-300 dark:bg-zinc-600 rounded animate-pulse" />
              )}
        </div>
      </div>
    </div>
  )
}
