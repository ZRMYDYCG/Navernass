import type { Chapter } from '@/lib/supabase/sdk'
import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'

interface ChapterSelectorProps {
  novelId: string
  selectedChapters: Chapter[]
  onSelectionChange: (chapters: Chapter[]) => void
  onClose: () => void
}

export function ChapterSelector({
  novelId,
  selectedChapters,
  onSelectionChange,
  onClose,
}: ChapterSelectorProps) {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/novels/${novelId}/chapters`)
        if (!response.ok) throw new Error('获取章节列表失败')
        const result = await response.json()
        setChapters(result.data || [])
      } catch (error) {
        console.error('获取章节列表失败:', error)
      } finally {
        setLoading(false)
      }
    }

    if (novelId) {
      fetchChapters()
    }
  }, [novelId])

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const filteredChapters = chapters.filter(chapter =>
    chapter.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleChapter = (chapter: Chapter) => {
    const isSelected = selectedChapters.some(c => c.id === chapter.id)
    if (isSelected) {
      onSelectionChange(selectedChapters.filter(c => c.id !== chapter.id))
    } else {
      onSelectionChange([...selectedChapters, chapter])
    }
  }

  const isChapterSelected = (chapterId: string) => {
    return selectedChapters.some(c => c.id === chapterId)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-32">
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />
      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">选择章节</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* 搜索框 */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索章节..."
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
          />
        </div>

        {/* 章节列表 */}
        <div className="max-h-96 overflow-y-auto bg-gray-100 dark:bg-gray-800">
          {loading
            ? (
                <div className="p-8 flex items-center justify-center">
                  <Spinner className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
              )
            : filteredChapters.length === 0
              ? (
                  <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery ? '未找到匹配的章节' : '暂无章节'}
                  </div>
                )
              : (
                  <div className="p-2">
                    {filteredChapters.map((chapter) => {
                      const isSelected = isChapterSelected(chapter.id)
                      return (
                        <button
                          key={chapter.id}
                          type="button"
                          onClick={() => toggleChapter(chapter)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors mb-1 ${
                            isSelected
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0 ${
                                isSelected
                                  ? 'border-gray-900 dark:border-gray-100 bg-gray-900 dark:bg-gray-100'
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2 h-2 bg-white dark:bg-gray-900 rounded-full" />
                              )}
                            </div>
                            <span className="truncate flex-1">{chapter.title}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
        </div>

        {/* 底部操作 */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-100 dark:bg-gray-800">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            已选择
            {' '}
            {selectedChapters.length}
            {' '}
            个章节
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  )
}
