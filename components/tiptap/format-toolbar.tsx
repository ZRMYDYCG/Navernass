'use client'

import type { Editor } from '@tiptap/react'
import { Bold, Italic, Underline as UnderlineIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface FormatToolbarProps {
  editor: Editor
  onAIClick?: () => void
  isAIActive?: boolean
  isAILoading?: boolean
}

export function FormatToolbar({ editor, onAIClick, isAIActive, isAILoading }: FormatToolbarProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true)
    })
  }, [])

  return (
    <div className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          editor.isActive('bold')
            ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
            : 'text-gray-700 dark:text-gray-300'
        }`}
        title="加粗"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          editor.isActive('italic')
            ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
            : 'text-gray-700 dark:text-gray-300'
        }`}
        title="斜体"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          editor.isActive('underline')
            ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
            : 'text-gray-700 dark:text-gray-300'
        }`}
        title="下划线"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>

      {onAIClick && (
        <>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          <button
            type="button"
            onClick={onAIClick}
            disabled={isAILoading}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              isAIActive || isAILoading
                ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300'
            } disabled:opacity-50`}
            title="Ask AI"
          >
            {mounted
              ? (
                  <Image
                    src={isDark ? '/assets/svg/logo-dark.svg' : '/assets/svg/logo-light.svg'}
                    alt="AI"
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                )
              : (
                  <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                )}
          </button>
        </>
      )}
    </div>
  )
}
