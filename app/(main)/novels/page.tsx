'use client'

import type { NovelFilterType, NovelFormData, ViewMode } from './types'
import type { Novel } from '@/lib/supabase/sdk'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control'
import { novelsApi } from '@/lib/supabase/sdk'
import { supabase } from '@/lib/supabase'
import { DeleteConfirmDialog } from './_components/delete-confirm-dialog'
import { NovelContextMenu } from './_components/novel-context-menu'
import { NovelDialog } from './_components/novel-dialog'
import { NovelList } from './_components/novel-list'
import { NovelTable } from './_components/novel-table'
import { ViewSwitcher } from './_components/view-switcher'
import { SmartPagination } from './_components/smart-pagination'
import { DEFAULT_FILTER, DEFAULT_VIEW_MODE, ITEMS_PER_PAGE, TOAST_MESSAGES } from './config'

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

  const [contextMenuNovel, setContextMenuNovel] = useState<Novel | null>(null)
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number, y: number } | null>(
    null,
  )

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

  const handleCreateAction = useCallback(() => {
    setEditingNovel(null)
    setDialogOpen(true)
    router.replace('/novels')
  }, [router])

  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'create') {
      handleCreateAction()
    }
  }, [searchParams, handleCreateAction])

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

  const handleOpenNovel = (novel: Novel) => {
    router.push(`/editor?id=${novel.id}`)
  }

  const handleContextMenu = (e: React.MouseEvent, novel: Novel) => {
    e.preventDefault()
    setContextMenuPosition({ x: e.clientX, y: e.clientY })
    setContextMenuNovel(novel)
  }

  const handleOpenCreateDialog = () => {
    setEditingNovel(null)
    setDialogOpen(true)
  }

  const handleEditNovel = (novel: Novel) => {
    setEditingNovel(novel)
    setDialogOpen(true)
  }

  const uploadCover = useCallback(async (file: File) => {
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error } = await supabase.storage.from('narraverse').upload(`covers/${fileName}`, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (error) {
      throw error
    }
    const { data: publicData } = supabase.storage.from('narraverse').getPublicUrl(data.path)
    return publicData.publicUrl
  }, [])

  const handleSaveNovel = async (data: NovelFormData) => {
    if (!data.title.trim()) {
      toast.error(TOAST_MESSAGES.TITLE_REQUIRED)
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
        toast.success(TOAST_MESSAGES.UPDATE_SUCCESS)
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

  const handleDeleteNovel = (novel: Novel) => {
    setNovelToDelete(novel)
    setDeleteDialogOpen(true)
  }

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
      const message = error instanceof Error ? error.message : TOAST_MESSAGES.UPDATE_ERROR
      toast.error(message)
    }
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div className="flex flex-col bg-[#F9F8F4] dark:bg-zinc-900 transition-colors h-full font-serif">
      <section className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 px-8 pt-8 pb-6 shrink-0">
        <div className="flex-1 hidden sm:block" />
        <SegmentedControl
          value={filter}
          onValueChange={value => setFilter(value as NovelFilterType)}
          className="w-full sm:w-fit bg-transparent p-1 border border-stone-200 dark:border-zinc-800 rounded-lg"
        >
          <SegmentedControlItem value="all" className="data-[state=active]:bg-stone-200 dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm rounded-md text-stone-600 dark:text-zinc-400">全部</SegmentedControlItem>
          <SegmentedControlItem value="draft" className="data-[state=active]:bg-stone-200 dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm rounded-md text-stone-600 dark:text-zinc-400">草稿</SegmentedControlItem>
          <SegmentedControlItem value="published" className="data-[state=active]:bg-stone-200 dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm rounded-md text-stone-600 dark:text-zinc-400">已发布</SegmentedControlItem>
        </SegmentedControl>
        <div className="flex-1 flex justify-end">
          <ViewSwitcher value={viewMode} onChange={setViewMode} />
        </div>
      </section>

      <div className="flex-1 py-2 px-8 overflow-y-auto">
        {viewMode === 'grid'
          ? (
              <NovelList
                novels={novels}
                loading={loading}
                onOpenNovel={handleOpenNovel}
                onContextMenu={handleContextMenu}
                onCreateNovel={handleOpenCreateDialog}
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

      <NovelDialog
        open={dialogOpen}
        novel={editingNovel}
        onOpenChange={setDialogOpen}
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
