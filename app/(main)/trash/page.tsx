'use client'

import type { Novel } from '@/lib/supabase/sdk'
import * as Popover from '@radix-ui/react-popover'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { BookOpen, MoreVertical, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { InlineLoading } from '@/components/loading'
import { novelsApi } from '@/lib/supabase/sdk'

interface ContextMenuState {
  show: boolean
  x: number
  y: number
  item: Novel | null
}

export default function Trash() {
  const [novels, setNovels] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    show: false,
    x: 0,
    y: 0,
    item: null,
  })

  // 加载数据
  useEffect(() => {
    loadTrashData()
  }, [])

  // 点击其他地方关闭右键菜单
  useEffect(() => {
    const handleClick = () => {
      if (contextMenu.show) {
        setContextMenu({ show: false, x: 0, y: 0, item: null })
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [contextMenu.show])

  const loadTrashData = async () => {
    try {
      setLoading(true)
      const novelsData = await novelsApi.getArchived()
      setNovels(novelsData)
    } catch (error) {
      console.error('加载回收站数据失败:', error)
      const message = error instanceof Error ? error.message : '加载回收站数据失败'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // 恢复小说
  const handleRestoreNovel = async (novel: Novel) => {
    try {
      await novelsApi.restore(novel.id)
      toast.success(`小说《${novel.title}》已恢复`)
      loadTrashData()
    } catch (error) {
      console.error('恢复小说失败:', error)
      const message = error instanceof Error ? error.message : '恢复小说失败'
      toast.error(message)
    }
  }

  // 永久删除小说
  const handlePermanentDeleteNovel = async (novel: Novel) => {
    if (!confirm(`确定要永久删除小说《${novel.title}》吗？此操作无法撤销！`)) {
      return
    }

    try {
      await novelsApi.delete(novel.id)
      toast.success('小说已永久删除')
      loadTrashData()
    } catch (error) {
      console.error('永久删除小说失败:', error)
      const message = error instanceof Error ? error.message : '永久删除小说失败'
      toast.error(message)
    }
  }

  // 右键菜单处理
  const handleContextMenu = (e: React.MouseEvent, item: Novel) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      item,
    })
  }

  // 处理恢复
  const handleRestore = () => {
    if (!contextMenu.item) return
    handleRestoreNovel(contextMenu.item)
    setContextMenu({ show: false, x: 0, y: 0, item: null })
  }

  // 处理永久删除
  const handlePermanentDelete = () => {
    if (!contextMenu.item) return
    handlePermanentDeleteNovel(contextMenu.item)
    setContextMenu({ show: false, x: 0, y: 0, item: null })
  }

  return (
    <div className="dark:bg-gray-900 w-full h-full">
      {/* 标题 */}
      <section className="px-6 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">回收站</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">已归档的小说会显示在这里</p>
      </section>

      {/* 内容区域 */}
      <section className="px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <InlineLoading text="加载中..." />
          </div>
        ) : novels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <Trash2 className="w-16 h-16 mb-4 opacity-40" />
            <p className="text-lg">回收站是空的</p>
            <p className="text-sm mt-2">归档的小说会保留在这里</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {novels.map(novel => (
              <div
                key={novel.id}
                onContextMenu={e => handleContextMenu(e, novel)}
                className="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all cursor-pointer"
              >
                {/* 图标和类型 */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {novel.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">小说</p>
                  </div>
                </div>

                {/* 描述 */}
                {novel.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {novel.description}
                  </p>
                )}

                {/* 统计信息 */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <span>
                    {novel.word_count.toLocaleString()}
                    {' '}
                    字
                  </span>
                  <span>
                    {novel.chapter_count}
                    {' '}
                    章节
                  </span>
                </div>

                {/* 时间信息 */}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  归档于
                  {' '}
                  {formatDistanceToNow(new Date(novel.updated_at), {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                </p>

                {/* 右上角的操作按钮 */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Popover.Root>
                    <Popover.Trigger asChild>
                      <button
                        onClick={e => e.stopPropagation()}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50 min-w-[160px]"
                        sideOffset={5}
                        align="end"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRestoreNovel(novel)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                          恢复
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePermanentDeleteNovel(novel)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          永久删除
                        </button>
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 右键菜单 */}
      {contextMenu.show && (
        <div
          className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50 min-w-[160px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={handleRestore}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            恢复
          </button>
          <button
            onClick={handlePermanentDelete}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            永久删除
          </button>
        </div>
      )}
    </div>
  )
}
