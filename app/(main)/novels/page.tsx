'use client'

import type { Novel } from '@/lib/supabase/sdk'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control'
import { novelsApi } from '@/lib/supabase/sdk'
import { DeleteConfirmDialog } from './_components/delete-confirm-dialog'
import { NovelContextMenu } from './_components/novel-context-menu'
import { NovelDialog } from './_components/novel-dialog'
import { NovelList } from './_components/novel-list'

const ITEMS_PER_PAGE = 8

export default function Novels() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 列表数据状态
  const [novels, setNovels] = useState<Novel[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all')

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
      const message = error instanceof Error ? error.message : '加载小说列表失败'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [currentPage, filter])

  useEffect(() => {
    loadNovels()
  }, [loadNovels])

  // 监听 URL 参数，处理创建动作
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'create') {
      setEditingNovel(null)
      setDialogOpen(true)
      router.replace('/novels')
    }
  }, [searchParams, router])

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
  const handleSaveNovel = async (data: { title: string, description: string }) => {
    if (!data.title.trim()) {
      toast.error('请输入小说标题')
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
        toast.success('小说信息已更新！')
        setDialogOpen(false)
        loadNovels()
      } else {
        // 创建模式
        const novel = await novelsApi.create({
          title: data.title,
          description: data.description || undefined,
        })
        toast.success('小说创建成功！')
        setDialogOpen(false)
        router.push(`/editor?id=${novel.id}`)
      }
    } catch (error) {
      console.error(editingNovel ? '更新小说失败:' : '创建小说失败:', error)
      const message
        = error instanceof Error ? error.message : editingNovel ? '更新小说失败' : '创建小说失败'
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

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div className="flex flex-col dark:bg-gray-900 transition-colors h-full">
      {/* 顶部区域 */}
      <section className="flex justify-center items-center px-6 pt-6 pb-4 flex-shrink-0">
        <SegmentedControl
          value={filter}
          onValueChange={value => setFilter(value as 'all' | 'draft' | 'published')}
          className="w-fit"
        >
          <SegmentedControlItem value="all">全部</SegmentedControlItem>
          <SegmentedControlItem value="draft">草稿</SegmentedControlItem>
          <SegmentedControlItem value="published">已发布</SegmentedControlItem>
        </SegmentedControl>
      </section>

      {/* 小说列表区域 */}
      <div className="flex-1 px-6 py-2">
        <NovelList
          novels={novels}
          loading={loading}
          onOpenNovel={handleOpenNovel}
          onContextMenu={handleContextMenu}
          onCreateNovel={handleOpenCreateDialog}
        />

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

      {/* 底部分页 */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 py-4 px-6 border-t border-gray-200 dark:border-gray-800">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={
                    currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // 显示当前页、首页、末页以及当前页附近的页码
                if (
                  page === 1
                  || page === totalPages
                  || (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }
                return null
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={
                    currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

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
