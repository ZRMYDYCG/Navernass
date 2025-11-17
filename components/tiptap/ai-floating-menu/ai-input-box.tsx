'use client'

import { Star, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface AIInputBoxProps {
  show: boolean
  onToggle: () => void
  onClose: () => void
  prompt: string
  onPromptChange: (prompt: string) => void
  onSubmit: () => void
  isLoading: boolean
  hasActiveConversation: boolean
}

export function AIInputBox({
  show,
  onToggle,
  onClose,
  prompt,
  onPromptChange,
  onSubmit,
  isLoading,
  hasActiveConversation,
}: AIInputBoxProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true)
    })
  }, [])

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
  }

  if (!show) {
    return (
      <button
        type="button"
        onClick={onToggle}
        disabled={isLoading}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
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
                <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
              )}
        </div>
      </button>
    )
  }

  return (
    <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded shadow-xl w-[320px] overflow-hidden">
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-gray-200 dark:border-gray-700">
        <Star className="w-3 h-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
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
          disabled={isLoading}
          className="flex-1 bg-transparent text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none disabled:opacity-50"
          autoFocus
        />
        <div className="flex items-center gap-1.5">
          <div className="flex-shrink-0">
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
                  <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                )}
          </div>
          <button
            type="button"
            onClick={handleCloseClick}
            disabled={isLoading}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            title={hasActiveConversation ? '关闭对话（将提示确认）' : '关闭'}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
