'use client'

import { ChevronRight } from 'lucide-react'
import { useRef, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Volume {
  id: string
  title: string
}

interface Chapter {
  id: string
  title: string
  volume_id?: string
}

interface BreadcrumbProps {
  novelTitle: string
  chapterTitle: string
  volume?: Volume | null
  chapters?: Chapter[]
  currentChapterId?: string
  onSelectChapter?: (chapterId: string) => void
}

const EMPTY_ARRAY: never[] = []

export function Breadcrumb({
  novelTitle,
  chapterTitle,
  volume,
  chapters = EMPTY_ARRAY,
  currentChapterId,
  onSelectChapter,
}: BreadcrumbProps) {
  const [isVolumeHovered, setIsVolumeHovered] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 获取当前卷下的所有章节
  const getVolumeChapters = (volumeId: string) => {
    if (!chapters || chapters.length === 0) return []
    return chapters.filter(chapter => chapter.volume_id === volumeId)
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsVolumeHovered(true)
  }

  const handleMouseLeave = () => {
    // 延迟关闭，避免鼠标移动到下拉菜单时闪烁
    timeoutRef.current = setTimeout(() => {
      setIsVolumeHovered(false)
    }, 150)
  }

  return (
    <div className="px-6 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{novelTitle}</span>

        {/* 如果有卷，显示卷名 */}
        {volume && (
          <>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <div
              ref={containerRef}
              className="relative inline-flex items-center"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <DropdownMenu open={isVolumeHovered} onOpenChange={setIsVolumeHovered} modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer inline-flex items-center"
                  >
                    {volume.title}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-56 max-h-80 overflow-y-auto p-1"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* 显示该卷下的所有章节 */}
                  {getVolumeChapters(volume.id).length > 0
                    ? (
                        getVolumeChapters(volume.id).map(chapter => (
                          <DropdownMenuItem
                            key={chapter.id}
                            onClick={() => {
                              onSelectChapter?.(chapter.id)
                              setIsVolumeHovered(false)
                            }}
                            className={`cursor-pointer py-1 px-2 text-sm ${currentChapterId === chapter.id ? 'bg-accent' : ''}`}
                          >
                            {chapter.title}
                          </DropdownMenuItem>
                        ))
                      )
                    : (
                        <div className="px-2 py-1 text-sm text-muted-foreground">
                          该卷下暂无章节
                        </div>
                      )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}

        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs text-foreground">{chapterTitle}</span>
      </div>
    </div>
  )
}
