'use client'

import type { NovelFilterType, NovelFormData, ViewMode } from './types'
import type { Novel } from '@/lib/supabase/sdk'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control'
import { novelsApi } from '@/lib/supabase/sdk'
import { DeleteConfirmDialog } from './_components/delete-confirm-dialog'
import { NovelContextMenu } from './_components/novel-context-menu'
import { NovelDialog } from './_components/novel-dialog'
import { NovelList } from './_components/novel-list'
import { NovelTable } from './_components/novel-table'
import { ViewSwitcher } from './_components/view-switcher'
import { SmartPagination } from './_components/smart-pagination'
import { DEFAULT_FILTER, DEFAULT_VIEW_MODE, ITEMS_PER_PAGE, TOAST_MESSAGES } from './config'

export default function Novels() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 列表数据状态
  const [novels, setNovels] = useState<Novel[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<NovelFilterType>(DEFAULT_FILTER)
  const [viewMode, setViewMode] = useState<ViewMode>(DEFAULT_VIEW_MODE)

  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [novelToDelete, setNovelToDelete] = useState<Novel | null>(null)

  // 右键菜单状态
  const [contextMenuNovel, setContextMenuNovel] = useState<Novel | null>(null)
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number, y: number } | null>(
    null,
  )

  // 加载小说列表
  const loadNovels = useCallback(async () => {
    try {
      setLoading(true)
      const result = await novelsApi.getList({
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
        status: filter === 'all' ? undefined : filter,
      })
      setNovels(result.data)
      setTotal(result.total)
    } catch (error) {
      console.error('加载小说失败:', error)
      const message = error instanceof Error ? error.message : TOAST_MESSAGES.LOAD_ERROR
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [currentPage, filter])

  useEffect(() => {
    loadNovels()
  }, [loadNovels])

  // 处理创建对话框
  const handleCreateAction = useCallback(() => {
    setEditingNovel(null)
    setDialogOpen(true)
    router.replace('/novels')
  }, [router])

  // 监听 URL 参数，处理创建动作
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'create') {
      handleCreateAction()
    }
  }, [searchParams, handleCreateAction])

  // 点击其他地方关闭右键菜单
  useEffect(() => {
    const handleClick = () => {
      if (contextMenuNovel) {
        setContextMenuNovel(null)
        setContextMenuPosition(null)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [contextMenuNovel])

  // 打开小说编辑器
  const handleOpenNovel = (novel: Novel) => {
    router.push(`/editor?id=${novel.id}`)
  }

  // 处理右键菜单
  const handleContextMenu = (e: React.MouseEvent, novel: Novel) => {
    e.preventDefault()
    setContextMenuPosition({ x: e.clientX, y: e.clientY })
    setContextMenuNovel(novel)
  }

  // 打开创建对话框
  const handleOpenCreateDialog = () => {
    setEditingNovel(null)
    setDialogOpen(true)
  }

  // 打开编辑对话框
  const handleEditNovel = (novel: Novel) => {
    setEditingNovel(novel)
    setDialogOpen(true)
  }

  // 保存小说（创建或更新）
  const handleSaveNovel = async (data: NovelFormData) => {
    if (!data.title.trim()) {
      toast.error(TOAST_MESSAGES.TITLE_REQUIRED)
      return
    }

    try {
      if (editingNovel) {
        // 更新模式
        await novelsApi.update({
          id: editingNovel.id,
          title: data.title,
          description: data.description || undefined,
        })
        toast.success(TOAST_MESSAGES.UPDATE_SUCCESS)
        setDialogOpen(false)
        loadNovels()
      } else {
        // 创建模式
        const novel = await novelsApi.create({
          title: data.title,
          description: data.description || undefined,
        })
        toast.success(TOAST_MESSAGES.CREATE_SUCCESS)
        setDialogOpen(false)
        router.push(`/editor?id=${novel.id}`)
      }
    } catch (error) {
      console.error(editingNovel ? '更新小说失败:' : '创建小说失败:', error)
      const message
        = error instanceof Error
          ? error.message
          : editingNovel
            ? TOAST_MESSAGES.UPDATE_ERROR
            : TOAST_MESSAGES.CREATE_ERROR
      toast.error(message)
      throw error
    }
  }

  // 删除小说（移到回收站）
  const handleDeleteNovel = (novel: Novel) => {
    setNovelToDelete(novel)
    setDeleteDialogOpen(true)
  }

  // 确认删除小说
  const handleConfirmDelete = async () => {
    if (!novelToDelete) return

    try {
      await novelsApi.archive(novelToDelete.id)
      toast.success(TOAST_MESSAGES.DELETE_SUCCESS)
      setDeleteDialogOpen(false)
      setNovelToDelete(null)
      loadNovels()
    } catch (error) {
      console.error('删除小说失败:', error)
      const message = error instanceof Error ? error.message : TOAST_MESSAGES.DELETE_ERROR
      toast.error(message)
    }
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div className="flex flex-col dark:bg-zinc-900 transition-colors h-full">
      {/* 顶部区域 */}
      <section className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 shrink-0">
        <div className="flex-1 hidden sm:block" />
        <SegmentedControl
          value={filter}
          onValueChange={value => setFilter(value as NovelFilterType)}
          className="w-full sm:w-fit"
        >
          <SegmentedControlItem value="all">全部</SegmentedControlItem>
          <SegmentedControlItem value="draft">草稿</SegmentedControlItem>
          <SegmentedControlItem value="published">已发布</SegmentedControlItem>
        </SegmentedControl>
        <div className="flex-1 flex justify-end">
          <ViewSwitcher value={viewMode} onChange={setViewMode} />
        </div>
      </section>

      {/* 小说列表区域 */}
      <div className="flex-1 py-2 px-4 sm:px-6">
        {viewMode === 'grid'
          ? (
              <NovelList
                novels={novels}
                loading={loading}
                onOpenNovel={handleOpenNovel}
                onContextMenu={handleContextMenu}
                onCreateNovel={handleOpenCreateDialog}
              />
            )
          : (
              <NovelTable
                novels={novels}
                loading={loading}
                onOpenNovel={handleOpenNovel}
                onEditNovel={handleEditNovel}
                onDeleteNovel={handleDeleteNovel}
                onContextMenu={handleContextMenu}
              />
            )}

        {/* 右键菜单 */}
        {contextMenuNovel && contextMenuPosition && (
          <NovelContextMenu
            novel={contextMenuNovel}
            position={contextMenuPosition}
            onOpen={handleOpenNovel}
            onEdit={handleEditNovel}
            onDelete={handleDeleteNovel}
            onClose={() => {
              setContextMenuNovel(null)
              setContextMenuPosition(null)
            }}
          />
        )}
      </div>

      <SmartPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="shrink-0 py-3 sm:py-4 px-4 sm:px-6 border-t border-gray-200 dark:border-gray-800"
      />

      {/* 创建/编辑小说对话框 */}
      <NovelDialog
        open={dialogOpen}
        novel={editingNovel}
        onOpenChange={setDialogOpen}
        onSave={handleSaveNovel}
      />

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        novel={novelToDelete}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
