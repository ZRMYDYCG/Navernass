'use client'

import type { Novel } from '@/lib/supabase/sdk'
import * as Dialog from '@radix-ui/react-dialog'
import { Edit, ExternalLink, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { InlineLoading } from '@/components/loading'
import { Button } from '@/components/ui/button'
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

export default function Novels() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [novels, setNovels] = useState<Novel[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null)
  const [novelTitle, setNovelTitle] = useState('')
  const [novelDescription, setNovelDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null)
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number, y: number } | null>(
    null,
  )
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [novelToDelete, setNovelToDelete] = useState<Novel | null>(null)
  const itemsPerPage = 8

  // 加载小说列表
  const loadNovels = useCallback(async () => {
    try {
      setLoading(true)
      const result = await novelsApi.getList({
        page: currentPage,
        pageSize: itemsPerPage,
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

  // 点击其他地方关闭右键菜单
  useEffect(() => {
    const handleClick = () => {
      if (openPopoverId) {
        setOpenPopoverId(null)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [openPopoverId])

  // 打开创建对话框
  const handleOpenCreateDialog = () => {
    setEditingNovel(null)
    setNovelTitle('')
    setNovelDescription('')
    setDialogOpen(true)
  }

  // 删除小说（移到回收站）
  const handleDeleteNovel = (novel: Novel) => {
    setNovelToDelete(novel)
    setDeleteDialogOpen(true)
  }

  // 确认删除小说
  const confirmDeleteNovel = async () => {
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

  // 打开小说编辑器
  const handleOpenNovel = (novel: Novel) => {
    router.push(`/novels/editor?id=${novel.id}`)
  }

  // 打开编辑对话框
  const handleEditNovel = (novel: Novel) => {
    setEditingNovel(novel)
    setNovelTitle(novel.title)
    setNovelDescription(novel.description || '')
    setDialogOpen(true)
  }

  // 保存小说（创建或更新）
  const handleSaveNovel = async () => {
    if (!novelTitle.trim()) {
      toast.error('请输入小说标题')
      return
    }

    try {
      setIsSaving(true)
      if (editingNovel) {
        // 更新模式
        await novelsApi.update({
          id: editingNovel.id,
          title: novelTitle.trim(),
          description: novelDescription.trim() || undefined,
        })
        toast.success('小说信息已更新！')
        setDialogOpen(false)
        loadNovels()
      } else {
        // 创建模式
        const novel = await novelsApi.create({
          title: novelTitle.trim(),
          description: novelDescription.trim() || undefined,
        })
        toast.success('小说创建成功！')
        setDialogOpen(false)
        router.push(`/novels/editor?id=${novel.id}`)
      }
    } catch (error) {
      console.error(editingNovel ? '更新小说失败:' : '创建小说失败:', error)
      const message
        = error instanceof Error ? error.message : editingNovel ? '更新小说失败' : '创建小说失败'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const totalPages = Math.ceil(total / itemsPerPage)

  return (
    <div className="flex flex-col dark:bg-gray-900 transition-colors h-full">
      {/* 顶部区域 */}
      <section className="relative flex justify-center items-center px-6 pt-6 pb-4 flex-shrink-0">
        <Button
          onClick={handleOpenCreateDialog}
          className="absolute cursor-pointer left-6 bg-black dark:bg-gray-800 text-white hover:bg-gray-800 dark:hover:bg-gray-700"
        >
          <Plus className="w-4 h-4" />
          新建小说
        </Button>

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
        {loading
          ? (
              <div className="flex items-center justify-center py-20">
                <InlineLoading text="加载中..." />
              </div>
            )
          : novels.length === 0
            ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
                  <p className="text-lg mb-4">还没有小说</p>
                  <Button
                    onClick={handleOpenCreateDialog}
                    className="bg-black dark:bg-gray-800 text-white hover:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <Plus className="w-4 h-4" />
                    创建第一部小说
                  </Button>
                </div>
              )
            : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {novels.map(novel => (
                      <div
                        key={novel.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow border border-gray-100 dark:border-gray-700 relative cursor-context-menu"
                        onContextMenu={(e) => {
                          e.preventDefault()
                          setContextMenuPosition({ x: e.clientX, y: e.clientY })
                          setOpenPopoverId(novel.id)
                        }}
                      >
                        {/* 封面图片 */}
                        <div className="relative h-[280px] overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10">
                          {novel.cover
                            ? (
                                <Image src={novel.cover} alt={novel.title} fill className="object-cover" />
                              )
                            : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-6xl opacity-20">📖</span>
                                </div>
                              )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute top-2 left-2">
                            <span
                              className={`inline-block px-2.5 py-1 backdrop-blur-sm text-xs font-medium rounded-full ${
                                novel.status === 'published'
                                  ? 'bg-green-500/90 text-white'
                                  : 'bg-gray-500/90 text-white'
                              }`}
                            >
                              {novel.status === 'published' ? '已发布' : '草稿'}
                            </span>
                          </div>
                          {novel.category && (
                            <div className="absolute top-2 right-2">
                              <span className="inline-block px-2.5 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs font-medium text-gray-700 dark:text-gray-200 rounded-full">
                                {novel.category}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 内容区域 */}
                        <div className="p-4">
                          {/* 标题 */}
                          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
                            {novel.title}
                          </h3>

                          {/* 描述 */}
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {novel.description || '暂无简介'}
                          </p>

                          {/* 标签 */}
                          {novel.tags && novel.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {novel.tags.slice(0, 3).map(tag => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* 统计信息 */}
                          <div className="flex items-center justify-between mb-3 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <span>
                                {novel.chapter_count || 0}
                                {' '}
                                章
                              </span>
                              <span>·</span>
                              <span>
                                {(novel.word_count / 1000).toFixed(1)}
                                k 字
                              </span>
                            </div>
                            <span className="text-gray-500 dark:text-gray-400">
                              {new Date(novel.updated_at).toLocaleDateString()}
                            </span>
                          </div>

                          {/* 开始创作按钮 */}
                          <Button
                            className="w-full bg-black dark:bg-gray-700 text-white h-8 text-sm hover:bg-gray-800 dark:hover:bg-gray-600"
                            onClick={() => {
                              router.push(`/novels/editor?id=${novel.id}`)
                            }}
                          >
                            开始创作
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 右键菜单 */}
                  {openPopoverId && contextMenuPosition && (
                    <div
                      className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50 min-w-[160px]"
                      style={{
                        left: `${contextMenuPosition.x}px`,
                        top: `${contextMenuPosition.y}px`,
                      }}
                      onClick={() => setOpenPopoverId(null)}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          const novel = novels.find(n => n.id === openPopoverId)
                          if (novel) handleOpenNovel(novel)
                          setOpenPopoverId(null)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        打开
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          const novel = novels.find(n => n.id === openPopoverId)
                          if (novel) handleEditNovel(novel)
                          setOpenPopoverId(null)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        编辑
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          const novel = novels.find(n => n.id === openPopoverId)
                          if (novel) handleDeleteNovel(novel)
                          setOpenPopoverId(null)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        删除
                      </button>
                    </div>
                  )}
                </>
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
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {editingNovel ? '编辑小说信息' : '创建新小说'}
              </Dialog.Title>

              <div className="space-y-4">
                {/* 标题输入 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    小说标题
                    {' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={novelTitle}
                    onChange={e => setNovelTitle(e.target.value)}
                    placeholder="请输入小说标题"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                    autoFocus
                  />
                </div>

                {/* 描述输入 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    简介（可选）
                  </label>
                  <textarea
                    value={novelDescription}
                    onChange={e => setNovelDescription(e.target.value)}
                    placeholder="请输入小说简介"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 resize-none"
                  />
                </div>
              </div>

              {/* 按钮组 */}
              <div className="flex gap-3 mt-6">
                <Dialog.Close asChild>
                  <Button
                    type="button"
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                    disabled={isSaving}
                  >
                    取消
                  </Button>
                </Dialog.Close>
                <Button
                  onClick={handleSaveNovel}
                  className="flex-1 bg-black dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                  disabled={isSaving || !novelTitle.trim()}
                >
                  {isSaving
                    ? editingNovel
                      ? '保存中...'
                      : '创建中...'
                    : editingNovel
                      ? '保存'
                      : '创建'}
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* 删除确认对话框 */}
      <Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                确认删除
              </Dialog.Title>

              <Dialog.Description className="text-gray-600 dark:text-gray-400 mb-6">
                确定要将小说《
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {novelToDelete?.title}
                </span>
                》移到回收站吗？
              </Dialog.Description>

              {/* 按钮组 */}
              <div className="flex gap-3">
                <Dialog.Close asChild>
                  <Button
                    type="button"
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    取消
                  </Button>
                </Dialog.Close>
                <Button
                  onClick={confirmDeleteNovel}
                  className="flex-1 bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  删除
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
