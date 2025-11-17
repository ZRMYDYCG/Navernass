'use client'

import type { Volume } from './types'
import { ChevronDown, ChevronRight, FileText } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

interface SearchResult {
  chapter: {
    id: string
    title: string
    content: string
    volume_id?: string | null
  }
  titleMatches: Array<{ start: number, end: number, text: string }>
  contentMatches: Array<{ start: number, end: number, text: string }>
  matchCount: number
}

interface SearchTabProps {
  novelId: string
  volumes: Volume[]
  selectedChapter?: string | null
  onSelectChapter?: (chapterId: string) => void
}

export function SearchTab({ novelId, volumes, selectedChapter, onSelectChapter }: SearchTabProps) {
  const [keyword, setKeyword] = useState('')
  const [targetVolumeId, setTargetVolumeId] = useState<string | null | undefined>(undefined)
  const [excludeVolumeId, setExcludeVolumeId] = useState<string | null | undefined>(undefined)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(() => new Set())
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 卷选项
  const volumeOptions = useMemo(() => {
    return volumes.map(volume => ({
      value: volume.id,
      label: volume.title,
    }))
  }, [volumes])

  // 执行搜索
  const handleSearch = useCallback(async () => {
    if (!keyword.trim() || !novelId) return

    setLoading(true)
    try {
      const response = await fetch('/api/chapters/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          novelId,
          keyword: keyword.trim(),
          volumeId: targetVolumeId,
          excludeVolumeId,
        }),
      })

      if (!response.ok) {
        throw new Error('搜索失败')
      }

      const data = await response.json()
      if (data.success) {
        setResults(data.data || [])
      } else {
        throw new Error(data.error?.message || '搜索失败')
      }
    } catch (error) {
      console.error('搜索错误:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [novelId, keyword, targetVolumeId, excludeVolumeId])

  // 防抖搜索
  useEffect(() => {
    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // 如果关键字为空，清空结果
    if (!keyword.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    // 设置新的定时器
    debounceTimerRef.current = setTimeout(() => {
      handleSearch()
    }, 300) // 300ms 防抖

    // 清理函数
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [keyword, handleSearch])

  // 当卷选择变化时也触发搜索（如果有关键字）
  useEffect(() => {
    if (keyword.trim()) {
      // 清除之前的定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      // 立即触发搜索
      handleSearch()
    }
  }, [targetVolumeId, excludeVolumeId, keyword, handleSearch])

  // 发送高亮信息的辅助函数
  const sendHighlightEvent = useCallback((chapterId: string | null, keyword: string | null, matches: Array<{ start: number, end: number, type: 'title' | 'content' }>) => {
    window.dispatchEvent(new CustomEvent('editor-highlight', {
      detail: {
        chapterId,
        keyword,
        matches,
      },
    }))
  }, [])

  // 当选中章节变化时，将搜索关键字和匹配信息传递给编辑器
  useEffect(() => {
    if (!selectedChapter || !keyword.trim()) {
      // 如果没有选中章节或没有搜索关键字，清除高亮
      sendHighlightEvent(null, null, [])
      return
    }

    // 查找当前选中章节的搜索结果
    const result = results.find(r => r.chapter.id === selectedChapter)
    if (result) {
      // 将搜索关键字和匹配信息传递给编辑器
      sendHighlightEvent(
        selectedChapter,
        keyword.trim(),
        [
          ...result.titleMatches.map(m => ({ ...m, type: 'title' as const })),
          ...result.contentMatches.map(m => ({ ...m, type: 'content' as const })),
        ],
      )
    } else {
      // 如果没有搜索结果，清除高亮
      sendHighlightEvent(selectedChapter, keyword.trim(), [])
    }
  }, [selectedChapter, keyword, results, sendHighlightEvent])

  // 监听编辑器就绪事件，重新发送高亮信息
  useEffect(() => {
    if (!selectedChapter || !keyword.trim()) return

    const handleEditorReady = (event: Event) => {
      const customEvent = event as CustomEvent<{ chapterId: string }>
      const readyChapterId = customEvent.detail?.chapterId

      // 如果就绪的编辑器章节与当前选中的章节匹配，且有搜索关键字，重新发送高亮
      if (readyChapterId === selectedChapter && keyword.trim()) {
        const result = results.find(r => r.chapter.id === selectedChapter)
        if (result) {
          sendHighlightEvent(
            selectedChapter,
            keyword.trim(),
            [
              ...result.titleMatches.map(m => ({ ...m, type: 'title' as const })),
              ...result.contentMatches.map(m => ({ ...m, type: 'content' as const })),
            ],
          )
        }
      }
    }

    window.addEventListener('editor-ready', handleEditorReady as EventListener)
    return () => {
      window.removeEventListener('editor-ready', handleEditorReady as EventListener)
    }
  }, [selectedChapter, keyword, results, sendHighlightEvent])

  // 切换章节展开状态
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev)
      if (next.has(chapterId)) {
        next.delete(chapterId)
      } else {
        next.add(chapterId)
      }
      return next
    })
  }

  // 高亮文本
  const highlightText = (text: string, keyword: string, matches: Array<{ start: number, end: number }>) => {
    if (matches.length === 0) return text

    const parts: Array<{ text: string, isHighlight: boolean }> = []
    let lastIndex = 0

    // 按位置排序匹配项
    const sortedMatches = [...matches].sort((a, b) => a.start - b.start)

    sortedMatches.forEach((match) => {
      // 添加匹配前的文本
      if (match.start > lastIndex) {
        parts.push({
          text: text.substring(lastIndex, match.start),
          isHighlight: false,
        })
      }

      // 添加高亮的匹配文本
      parts.push({
        text: text.substring(match.start, match.end),
        isHighlight: true,
      })

      lastIndex = match.end
    })

    // 添加剩余的文本
    if (lastIndex < text.length) {
      parts.push({
        text: text.substring(lastIndex),
        isHighlight: false,
      })
    }

    return parts.map((part, idx) => {
      const key = `${part.isHighlight ? 'highlight' : 'text'}-${part.text.substring(0, 10)}-${idx}`
      return part.isHighlight
        ? (
            <mark key={key} className="bg-gray-200 dark:bg-zinc-600 px-0.5 rounded">
              {part.text}
            </mark>
          )
        : (
            <span key={key}>{part.text}</span>
          )
    })
  }

  // 获取章节所属的卷标题
  const getVolumeTitle = (volumeId: string | null | undefined) => {
    if (!volumeId) return '未分类'
    const volume = volumes.find(v => v.id === volumeId)
    return volume?.title || '未知卷'
  }

  return (
    <div className="h-full flex flex-col">
      {/* 搜索输入区域 */}
      <div className="p-1.5 space-y-1.5 border-b border-gray-200 dark:border-gray-700">
        {/* 关键字输入 */}
        <div className="space-y-0.5">
          <label className="text-[10px] text-gray-600 dark:text-gray-400 px-1">
            搜索关键字
          </label>
          <Input
            type="text"
            placeholder="搜索关键字..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="h-7 text-xs focus-visible:ring-0 focus:outline-none hover:outline-none"
          />
        </div>

        {/* 检索的卷 */}
        <div className="space-y-0.5">
          <label className="text-[10px] text-gray-600 dark:text-gray-400 px-1">
            检索范围
          </label>
          <Select
            value={targetVolumeId === undefined || targetVolumeId === null ? '__all__' : targetVolumeId}
            onValueChange={(value) => {
              if (value === '__all__') {
                setTargetVolumeId(undefined)
              } else {
                setTargetVolumeId(value)
              }
            }}
          >
            <SelectTrigger className="h-7 text-xs focus:ring-0 focus-visible:ring-0 hover:ring-0 focus:outline-none hover:outline-none">
              <SelectValue placeholder="检索的卷" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">全部</SelectItem>
              {volumeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 跳过检索的卷 */}
        <div className="space-y-0.5">
          <label className="text-[10px] text-gray-600 dark:text-gray-400 px-1">
            排除范围
          </label>
          <Select
            value={excludeVolumeId === undefined || excludeVolumeId === null ? '__none__' : excludeVolumeId}
            onValueChange={(value) => {
              if (value === '__none__') {
                setExcludeVolumeId(undefined)
              } else {
                setExcludeVolumeId(value)
              }
            }}
          >
            <SelectTrigger className="h-7 text-xs focus:ring-0 focus-visible:ring-0 hover:ring-0 focus:outline-none hover:outline-none">
              <SelectValue placeholder="跳过检索的卷" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">不跳过</SelectItem>
              {volumeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 搜索结果区域 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Spinner className="w-4 h-4" />
          </div>
        ) : results.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {keyword ? '未找到匹配的章节' : '输入关键字开始搜索'}
            </p>
          </div>
        ) : (
          <div className="p-1 space-y-0.5">
            <div className="px-1.5 py-1 text-xs text-gray-500 dark:text-gray-400">
              {results.length}
              {' '}
              个结果
            </div>
            {results.map((result) => {
              const isExpanded = expandedChapters.has(result.chapter.id)
              const chapter = result.chapter

              return (
                <div
                  key={chapter.id}
                  className="border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {/* 章节标题行 */}
                  <div
                    className="flex items-center gap-1 px-1.5 py-1 cursor-pointer"
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    {isExpanded
                      ? (
                          <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        )
                      : (
                          <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        )}
                    <FileText className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                        {result.titleMatches.length > 0
                          ? (
                              highlightText(chapter.title, keyword, result.titleMatches)
                            )
                          : (
                              chapter.title
                            )}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {getVolumeTitle(chapter.volume_id)}
                        {' '}
                        ·
                        {result.matchCount}
                        {' '}
                        处匹配
                      </div>
                    </div>
                    {onSelectChapter && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation()
                          onSelectChapter(chapter.id)
                        }}
                        className="h-5 px-1.5 text-[10px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                      >
                        打开
                      </Button>
                    )}
                  </div>

                  {/* 展开的内容 */}
                  {isExpanded && (
                    <div className="px-1.5 pb-1.5 pt-0.5 border-t border-gray-200 dark:border-gray-700 space-y-1">
                      {/* 标题匹配 */}
                      {result.titleMatches.length > 0 && (
                        <div>
                          <div className="text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                            标题匹配:
                          </div>
                          <div className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800 p-1 rounded">
                            {highlightText(chapter.title, keyword, result.titleMatches)}
                          </div>
                        </div>
                      )}

                      {/* 内容匹配 */}
                      {result.contentMatches.length > 0 && (
                        <div>
                          <div className="text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                            内容匹配 (
                            {result.contentMatches.length}
                            {' '}
                            处):
                          </div>
                          <div className="space-y-0.5">
                            {result.contentMatches.map((match) => {
                              // 从上下文中提取匹配位置
                              const keywordLower = keyword.toLowerCase()
                              const matchTextLower = match.text.toLowerCase()
                              const matchIndex = matchTextLower.indexOf(keywordLower)

                              const matchKey = `match-${result.chapter.id}-${match.start}-${match.end}`

                              if (matchIndex === -1) {
                                return (
                                  <div
                                    key={matchKey}
                                    className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800 p-1 rounded"
                                  >
                                    ...
                                    {match.text}
                                    ...
                                  </div>
                                )
                              }

                              const beforeMatch = match.text.substring(0, matchIndex)
                              const matchText = match.text.substring(matchIndex, matchIndex + keyword.length)
                              const afterMatch = match.text.substring(matchIndex + keyword.length)

                              return (
                                <div
                                  key={matchKey}
                                  className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800 p-1 rounded"
                                >
                                  ...
                                  {beforeMatch}
                                  <mark className="bg-gray-200 dark:bg-zinc-600 px-0.5 rounded">
                                    {matchText}
                                  </mark>
                                  {afterMatch}
                                  ...
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
