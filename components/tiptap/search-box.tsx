'use client'

import type { Editor } from '@tiptap/react'
import { ArrowDown, ArrowUp, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchBoxProps {
  editor: Editor
  onClose: () => void
}

export function SearchBox({ editor, onClose }: SearchBoxProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [totalMatches, setTotalMatches] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // 转义正则表达式特殊字符
  const escapeRegex = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  // 在 ProseMirror 文档中查找匹配项
  const findMatchesInDoc = (term: string) => {
    if (!term.trim()) return []

    const { state } = editor.view
    const { doc } = state
    const regex = new RegExp(escapeRegex(term), 'gi')
    const matches: Array<{ from: number, to: number }> = []

    // 遍历文档节点查找匹配
    doc.descendants((node, pos) => {
      if (!node.isText) return

      const text = node.textContent
      regex.lastIndex = 0
      let match = regex.exec(text)

      while (match !== null) {
        matches.push({
          from: pos + match.index,
          to: pos + match.index + match[0].length,
        })
        match = regex.exec(text)
      }
    })

    return matches
  }

  // 更新搜索高亮
  const updateSearchHighlight = (keyword: string | null, matches: Array<{ from: number, to: number }>, currentIdx: number) => {
    const { state, dispatch } = editor.view
    const tr = state.tr.setMeta('search-highlight', {
      keyword,
      matches,
      currentIndex: currentIdx,
    })
    dispatch(tr)
  }

  // 滚动到匹配位置
  const scrollToMatch = (match: { from: number, to: number }) => {
    const { from, to } = match
    // 选中匹配的文本
    editor.commands.setTextSelection({ from, to })

    // 滚动到选中位置
    setTimeout(() => {
      const { state } = editor.view
      const { selection } = state
      const { $from } = selection
      const dom = editor.view.nodeDOM($from.pos) as HTMLElement

      if (dom) {
        dom.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 0)
  }

  // 执行搜索
  const performSearch = () => {
    if (!searchTerm.trim()) {
      setTotalMatches(0)
      setCurrentIndex(0)
      updateSearchHighlight(null, [], -1)
      return
    }

    const matches = findMatchesInDoc(searchTerm)
    setTotalMatches(matches.length)

    if (matches.length > 0) {
      setCurrentIndex(1)
      updateSearchHighlight(searchTerm, matches, 0)
      scrollToMatch(matches[0])
    } else {
      setCurrentIndex(0)
      updateSearchHighlight(searchTerm, [], -1)
    }
  }

  // 导航到下一个匹配
  const goToNext = () => {
    if (totalMatches === 0) return

    const matches = findMatchesInDoc(searchTerm)
    if (matches.length === 0) return

    const nextIndex = currentIndex >= matches.length ? 0 : currentIndex
    setCurrentIndex(nextIndex + 1)
    updateSearchHighlight(searchTerm, matches, nextIndex)
    scrollToMatch(matches[nextIndex])
  }

  // 导航到上一个匹配
  const goToPrevious = () => {
    if (totalMatches === 0) return

    const matches = findMatchesInDoc(searchTerm)
    if (matches.length === 0) return

    const prevIndex = currentIndex <= 1 ? matches.length - 1 : currentIndex - 2
    setCurrentIndex(prevIndex + 1)
    updateSearchHighlight(searchTerm, matches, prevIndex)
    scrollToMatch(matches[prevIndex])
  }

  // 监听搜索词变化
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch()
    }, 100)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  // 监听键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter 或 F3：下一个
      if (e.key === 'Enter' || (e.key === 'F3' && !e.shiftKey)) {
        e.preventDefault()
        goToNext()
      } else if ((e.key === 'Enter' && e.shiftKey) || (e.key === 'F3' && e.shiftKey)) {
        // Shift+Enter 或 Shift+F3：上一个
        e.preventDefault()
        goToPrevious()
      } else if (e.key === 'Escape') {
        // Escape：关闭搜索框
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, currentIndex, totalMatches])

  // 组件挂载时聚焦输入框
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className="absolute top-4 right-4 z-50 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex items-center gap-2 min-w-[300px]">
      <Input
        ref={inputRef}
        type="text"
        placeholder="搜索..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="h-8 text-sm flex-1"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            goToNext()
          } else if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault()
            goToPrevious()
          }
        }}
      />
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {totalMatches > 0
          ? (
              <>
                {currentIndex}
                {' '}
                /
                {' '}
                {totalMatches}
              </>
            )
          : (
              '0 / 0'
            )}
      </div>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={goToPrevious}
          disabled={totalMatches === 0}
          className="h-7 w-7 p-0"
          title="上一个 (Shift+Enter)"
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={goToNext}
          disabled={totalMatches === 0}
          className="h-7 w-7 p-0"
          title="下一个 (Enter)"
        >
          <ArrowDown className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="h-7 w-7 p-0"
          title="关闭 (Esc)"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
