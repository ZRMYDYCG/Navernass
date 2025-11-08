'use client'

import type { Editor } from '@tiptap/react'
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Underline as UnderlineIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

interface FloatingMenuProps {
  editor: Editor | null
}

export function FloatingMenu({ editor }: FloatingMenuProps) {
  const { resolvedTheme } = useTheme()
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [showAskAI, setShowAskAI] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [isAILoading, setIsAILoading] = useState(false)
  const [aiStreamContent, setAiStreamContent] = useState('')
  const [aiCompleted, setAiCompleted] = useState(false)
  const [mounted, setMounted] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastPromptRef = useRef<string>('')

  const isDark = resolvedTheme === 'dark'

  // 重置 AI 状态
  const resetAI = () => {
    setAiStreamContent('')
    setAiCompleted(false)
  }

  // 应用 AI 结果 - 替换
  const applyReplace = () => {
    if (!editor || !aiStreamContent) return
    editor.chain().focus().deleteSelection().insertContent(aiStreamContent).run()
    resetAI()
    setShowAskAI(false)
  }

  // 应用 AI 结果 - 在下方插入
  const applyInsertBelow = () => {
    if (!editor || !aiStreamContent) return
    const { to } = editor.state.selection
    editor.chain().focus().setTextSelection(to).insertContent(`\n${aiStreamContent}`).run()
    resetAI()
    setShowAskAI(false)
  }

  // 取消
  const cancelAI = () => {
    resetAI()
    setShowAskAI(false)
  }

  // 处理 AI 操作
  const handleAI = async (customPrompt: string) => {
    if (!editor || !customPrompt.trim()) return

    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ' ',
    )

    if (!selectedText) return

    try {
      setIsAILoading(true)
      setAiStreamContent('')
      setAiCompleted(false)
      lastPromptRef.current = customPrompt

      abortControllerRef.current = new AbortController()

      const response = await fetch('/api/editor/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'custom',
          text: selectedText,
          prompt: customPrompt,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error('AI 请求失败')
      }

      // 流式响应
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('无法读取响应')
      }

      let buffer = ''
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue

          try {
            const jsonStr = trimmedLine.slice(6)
            const data = JSON.parse(jsonStr)

            if (data.type === 'content') {
              fullContent += data.data
              setAiStreamContent(fullContent)
            } else if (data.type === 'done') {
              // 流式完成，显示操作选项让用户选择
              setAiCompleted(true)
              setIsAILoading(false)
            } else if (data.type === 'error') {
              throw new Error(data.data)
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        // AI 生成已取消
      } else {
        console.error('AI 处理失败:', error)
      }
      setIsAILoading(false)
    } finally {
      abortControllerRef.current = null
    }
  }

  // 处理自定义 AI 提示
  const handleCustomAI = () => {
    if (!aiPrompt.trim()) return
    handleAI(aiPrompt)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!editor) return

    const updateMenu = () => {
      const { from, to } = editor.state.selection
      const hasSelection = from !== to

      if (!hasSelection) {
        setShow(false)
        setShowAskAI(false)
        return
      }

      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const rect = selection.getRangeAt(0).getBoundingClientRect()
        if (rect) {
          setPosition({
            top: rect.bottom + window.scrollY + 10,
            left: rect.left + rect.width / 2 + window.scrollX,
          })
          setShow(true)
        }
      }
    }

    editor.on('selectionUpdate', updateMenu)
    editor.on('update', updateMenu)

    return () => {
      editor.off('selectionUpdate', updateMenu)
      editor.off('update', updateMenu)
    }
  }, [editor])

  // 清理 AbortController
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  if (!show || !editor) return null

  return (
    <>
      {/* 主工具栏 */}
      <div
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: 'translateX(-50%)',
          zIndex: 50,
        }}
        className="flex flex-col items-center gap-2"
      >
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

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}
            title="标题 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}
            title="标题 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}
            title="标题 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Ask AI 按钮 */}
          <button
            type="button"
            onClick={() => {
              setShowAskAI(!showAskAI)
            }}
            disabled={isAILoading}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              showAskAI || isAILoading
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
        </div>

        {/* Ask AI 面板 */}
        {showAskAI && (
          <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-md shadow-xl w-[420px]">
            {/* 状态 1: 初始输入状态 */}
            {!isAILoading && !aiStreamContent && !aiCompleted && (
              <div>
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleCustomAI()
                    }
                  }}
                  placeholder="输入问题"
                  autoFocus
                  className="w-full px-4 py-2.5 text-sm border-b border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
                />

                {/* 预设选项 */}
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => handleAI('优化')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <span className="text-gray-400">✏️</span>
                    <span>优化</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAI('扩展文案')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <span className="text-gray-400">↔</span>
                    <span>扩展文案</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAI('精简文案')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <span className="text-gray-400">↔</span>
                    <span>精简文案</span>
                  </button>
                </div>
              </div>
            )}

            {/* 状态 2: 加载中 */}
            {isAILoading && !aiStreamContent && (
              <div className="px-4 py-8 flex items-center justify-center gap-3">
                <div className="inline-block w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-gray-100 animate-spin rounded-full" />
                <span className="text-sm text-gray-600 dark:text-gray-400">加载中...</span>
              </div>
            )}

            {/* 状态 3: 编辑中（流式输出） */}
            {isAILoading && aiStreamContent && (
              <div>
                <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="inline-block w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-gray-100 animate-spin rounded-full" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">编辑中...</span>
                </div>
                <div className="px-4 py-3 max-h-[300px] overflow-y-auto">
                  <div className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                    {aiStreamContent}
                    <span className="inline-block w-0.5 h-4 ml-0.5 bg-gray-900 dark:bg-gray-100 animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {/* 状态 4: 完成状态 */}
            {aiCompleted && aiStreamContent && !isAILoading && (
              <div>
                {/* 显示生成的内容 */}
                <div className="px-4 py-3 max-h-[300px] overflow-y-auto border-b border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                    {aiStreamContent}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="p-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={applyReplace}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    替换
                  </button>
                  <button
                    type="button"
                    onClick={applyInsertBelow}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    在下方插入
                  </button>
                  <button
                    type="button"
                    onClick={cancelAI}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetAI()
                      handleAI(lastPromptRef.current)
                    }}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    再试一次
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
