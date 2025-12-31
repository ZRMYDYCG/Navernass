'use client'

import type { ContextMenuState, NovelFilterType, NovelFormData, ViewMode } from './types'
import type { Novel } from '@/lib/supabase/sdk'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control'
import { novelsApi } from '@/lib/supabase/sdk'
import { DeleteConfirmDialog } from './_components/delete-confirm-dialog'
import { NovelContextMenu } from './_components/novel-context-menu'
import { NovelDialog } from './_components/novel-dialog'
import { NovelList } from './_components/novel-list'
import { NovelTable } from './_components/novel-table'
import { SmartPagination } from './_components/smart-pagination'
import { ViewSwitcher } from './_components/view-switcher'
import { DEFAULT_FILTER, DEFAULT_VIEW_MODE, ITEMS_PER_PAGE } from './constants'

function NovelsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [novels, setNovels] = useState<Novel[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<NovelFilterType>(DEFAULT_FILTER)
  const [viewMode, setViewMode] = useState<ViewMode>(DEFAULT_VIEW_MODE)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [novelToDelete, setNovelToDelete] = useState<Novel | null>(null)
  const [contextMenuState, setContextMenuState] = useState<ContextMenuState>({
    novel: null,
    position: null,
  })

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
      const message = error instanceof Error ? error.message : '加载小说列表失败'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [currentPage, filter])

  useEffect(() => {
    loadNovels()
  }, [loadNovels])

  const handleOpenNovel = (novel: Novel) => {
    router.push(`/editor?id=${novel.id}`)
  }

  const handleOpenCreateDialog = () => {
    setEditingNovel(null)
    setDialogOpen(true)
  }

  const handleEditNovel = (novel: Novel) => {
    setEditingNovel(novel)
    setDialogOpen(true)
  }

  async function uploadCover(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'cover')

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || '封面上传失败')
    }

    const result = await response.json()
    return result.data.url
  }

  const handleSaveNovel = async (data: NovelFormData) => {
    if (!data.title.trim()) {
      toast.error('请输入小说标题')
      return
    }

    try {
      if (editingNovel) {
        let coverUrl = editingNovel.cover
        if (data.coverFile) {
          coverUrl = await uploadCover(data.coverFile)
        }
        await novelsApi.update({
          id: editingNovel.id,
          title: data.title,
          description: data.description || undefined,
          cover: coverUrl || undefined,
        })
        toast.success('小说信息已更新！')
        setDialogOpen(false)
        loadNovels()
      } else {
        let cover: string | undefined
        if (data.coverFile) {
          cover = await uploadCover(data.coverFile)
        }
        const novel = await novelsApi.create({
          title: data.title,
          description: data.description || undefined,
          cover,
        })
        toast.success('小说创建成功！')
        setDialogOpen(false)
        router.push(`/editor?id=${novel.id}`)
      }
    } catch (error) {
      const message
        = error instanceof Error
          ? error.message
          : editingNovel
            ? '更新小说失败'
            : '创建小说失败'
      toast.error(message)
      throw error
    }
  }

  const handleDeleteNovel = (novel: Novel) => {
    setNovelToDelete(novel)
    setDeleteDialogOpen(true)
  }

  const handleContextMenu = (e: React.MouseEvent, novel: Novel) => {
    e.preventDefault()
    setContextMenuState({
      novel,
      position: {
        x: e.clientX,
        y: e.clientY,
      },
    })
  }

  const handleCloseContextMenu = () => {
    setContextMenuState({
      novel: null,
      position: null,
    })
  }

  useEffect(() => {
    if (!contextMenuState.position) return

    const handleGlobalClose = () => handleCloseContextMenu()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseContextMenu()
      }
    }

    document.addEventListener('click', handleGlobalClose)
    document.addEventListener('contextmenu', handleGlobalClose)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('click', handleGlobalClose)
      document.removeEventListener('contextmenu', handleGlobalClose)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [contextMenuState.position])

  const handleConfirmDelete = async () => {
    if (!novelToDelete) return

    try {
      await novelsApi.archive(novelToDelete.id)
      toast.success('小说已移到回收站')
      setDeleteDialogOpen(false)
      setNovelToDelete(null)
      loadNovels()
    } catch (error) {
      console.error('删除小说失败:', error)
      const message = error instanceof Error ? error.message : '删除小说失败'
      toast.error(message)
    }
  }

  const handleReorder = async (reorderedNovels: Novel[]) => {
    const previousNovels = novels
    setNovels(reorderedNovels)

    const payload = reorderedNovels.map((novel, index) => ({
      id: novel.id,
      order_index: index,
    }))

    try {
      await novelsApi.updateOrder(payload)
      toast.success('顺序已更新')
    } catch (error) {
      console.error('更新排序失败:', error)
      setNovels(previousNovels)
      const message = error instanceof Error ? error.message : '更新小说失败'
      toast.error(message)
    }
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const isCreateAction = searchParams.get('action') === 'create'
  const effectiveDialogOpen = dialogOpen || isCreateAction

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open && isCreateAction) {
      router.replace('/novels')
    }
  }

  return (
    <div className="flex flex-col bg-background transition-colors h-full font-serif">

      <div className="flex-1 py-2 px-8 overflow-y-auto flex flex-col">
        {/* 筛选器和新建按钮 */}
        <div className="mb-6 flex items-center justify-between gap-4 shrink-0">
          <SegmentedControl
            value={filter}
            onValueChange={value => setFilter(value as NovelFilterType)}
            className="bg-transparent p-1 border border-border rounded-lg"
          >
            <SegmentedControlItem value="all" className="data-[state=active]:bg-secondary data-[state=active]:shadow-sm rounded-md text-muted-foreground">全部</SegmentedControlItem>
            <SegmentedControlItem value="draft" className="data-[state=active]:bg-secondary data-[state=active]:shadow-sm rounded-md text-muted-foreground">草稿</SegmentedControlItem>
            <SegmentedControlItem value="published" className="data-[state=active]:bg-secondary data-[state=active]:shadow-sm rounded-md text-muted-foreground">已发布</SegmentedControlItem>
          </SegmentedControl>
          <button
            type="button"
            onClick={handleOpenCreateDialog}
            className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-lg transition-colors font-sans text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新建小说
          </button>
        </div>

        {/* 视图切换 */}
        <div className="mb-6 flex justify-end shrink-0">
          <ViewSwitcher value={viewMode} onChange={setViewMode} />
        </div>

        <div className="flex-1 flex flex-col">
          {viewMode === 'grid'
            ? (
                <NovelList
                  novels={novels}
                  loading={loading}
                  onOpenNovel={handleOpenNovel}
                  onEditNovel={handleEditNovel}
                  onDeleteNovel={handleDeleteNovel}
                  onContextMenu={handleContextMenu}
                  onReorder={handleReorder}
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
        </div>

        {contextMenuState.novel && contextMenuState.position && (
          <NovelContextMenu
            novel={contextMenuState.novel}
            position={{
              x: contextMenuState.position.x,
              y: contextMenuState.position.y,
            }}
            onOpen={handleOpenNovel}
            onEdit={handleEditNovel}
            onDelete={handleDeleteNovel}
            onClose={handleCloseContextMenu}
          />
        )}

      </div>

      <SmartPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="shrink-0 py-3 sm:py-4 px-4 sm:px-6 border-t border-border"
      />

      <NovelDialog
        open={effectiveDialogOpen}
        novel={editingNovel}
        onOpenChange={handleDialogOpenChange}
        onSave={handleSaveNovel}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        novel={novelToDelete}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default function Novels() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">加载中...</div>}>
      <NovelsContent />
    </Suspense>
  )
}
