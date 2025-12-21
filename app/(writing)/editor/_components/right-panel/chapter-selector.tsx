import type { Chapter } from '@/lib/supabase/sdk'
import { useEffect, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
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
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent showCloseButton={false} className="w-full max-w-md bg-background border border-border rounded-xl shadow-xl p-0">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">选择章节</h3>
        </div>

        <div className="p-3 border-b border-border bg-background">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索章节..."
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-sm"
          />
        </div>

        <div className="max-h-96 overflow-y-auto bg-background">
          {loading
            ? (
                <div className="p-8 flex items-center justify-center">
                  <Spinner className="w-6 h-6 text-muted-foreground" />
                </div>
              )
            : filteredChapters.length === 0
              ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
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
                          className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all mb-1 ${
                            isSelected
                              ? 'bg-accent text-foreground shadow-sm border border-border'
                              : 'hover:bg-accent text-foreground border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 border-2 rounded flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? 'border-primary bg-primary'
                                  : 'border-border'
                              }`}
                            >
                              {isSelected && (
                                <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
                              )}
                            </div>
                            <span className="truncate flex-1 font-medium">{chapter.title}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
        </div>

        <div className="p-3 border-t border-border flex items-center justify-between bg-muted/50 rounded-b-xl">
          <span className="text-xs text-muted-foreground">
            已选择
            {' '}
            {selectedChapters.length}
            {' '}
            个章节
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-colors shadow-sm"
          >
            确定
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
