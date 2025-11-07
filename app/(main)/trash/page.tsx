'use client'

import type { Novel } from '@/lib/supabase/sdk'
import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { novelsApi } from '@/lib/supabase/sdk'
import { BulkActionsBar } from './_components/bulk-actions-bar'
import { DeleteConfirmDialog } from './_components/delete-confirm-dialog'
import { TrashContextMenu } from './_components/trash-context-menu'
import { TrashList } from './_components/trash-list'

interface ContextMenuState {
  novel: Novel | null
  position: { x: number, y: number } | null
}

interface DeleteDialogState {
  open: boolean
  type: 'single' | 'bulk'
  novel: Novel | null
  count: number
}

export default function Trash() {
  const [novels, setNovels] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState(() => new Set<string>())
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    novel: null,
    position: null,
  })
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    type: 'single',
    novel: null,
    count: 0,
  })

  const loadTrashData = async () => {
    try {
      setLoading(true)
      const novelsData = await novelsApi.getArchived()
      setNovels(novelsData)
      setSelectedIds(new Set()) // 重新加载后清空选择
    } catch (error) {
      console.error('加载回收站数据失败:', error)
      const message = error instanceof Error ? error.message : '加载回收站数据失败'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // 加载数据
  useEffect(() => {
    loadTrashData()
  }, [])

  // 点击其他地方关闭右键菜单
  useEffect(() => {
    const handleClick = () => {
      if (contextMenu.novel) {
        setContextMenu({ novel: null, position: null })
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [contextMenu.novel])

  // 切换选择
  const handleToggleSelect = (novel: Novel) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(novel.id)) {
        next.delete(novel.id)
      } else {
        next.add(novel.id)
      }
      return next
    })
  }

  // 全选
  const handleSelectAll = () => {
    setSelectedIds(new Set(novels.map(n => n.id)))
  }

  // 取消全选
  const handleDeselectAll = () => {
    setSelectedIds(new Set())
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
  const handlePermanentDeleteNovel = (novel: Novel) => {
    setDeleteDialog({
      open: true,
      type: 'single',
      novel,
      count: 1,
    })
  }

  // 确认永久删除
  const handleConfirmDelete = async () => {
    if (deleteDialog.type === 'single' && deleteDialog.novel) {
      try {
        setDeleting(true)
        await novelsApi.delete(deleteDialog.novel.id)
        toast.success('小说已永久删除')
        setDeleteDialog({ open: false, type: 'single', novel: null, count: 0 })
        loadTrashData()
      } catch (error) {
        console.error('永久删除小说失败:', error)
        const message = error instanceof Error ? error.message : '永久删除小说失败'
        toast.error(message)
      } finally {
        setDeleting(false)
      }
    } else if (deleteDialog.type === 'bulk') {
      try {
        setDeleting(true)
        await Promise.all(Array.from(selectedIds).map(id => novelsApi.delete(id)))
        toast.success(`已永久删除 ${deleteDialog.count} 部小说`)
        setDeleteDialog({ open: false, type: 'bulk', novel: null, count: 0 })
        loadTrashData()
      } catch (error) {
        console.error('批量删除失败:', error)
        const message = error instanceof Error ? error.message : '批量删除失败'
        toast.error(message)
      } finally {
        setDeleting(false)
      }
    }
  }

  // 批量恢复
  const handleBulkRestore = async () => {
    const count = selectedIds.size
    if (count === 0) return

    try {
      await Promise.all(Array.from(selectedIds).map(id => novelsApi.restore(id)))
      toast.success(`已恢复 ${count} 部小说`)
      loadTrashData()
    } catch (error) {
      console.error('批量恢复失败:', error)
      const message = error instanceof Error ? error.message : '批量恢复失败'
      toast.error(message)
    }
  }

  // 批量永久删除
  const handleBulkDelete = () => {
    const count = selectedIds.size
    if (count === 0) return

    setDeleteDialog({
      open: true,
      type: 'bulk',
      novel: null,
      count,
    })
  }

  // 右键菜单处理
  const handleContextMenu = (e: React.MouseEvent, novel: Novel) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      novel,
      position: { x: e.clientX, y: e.clientY },
    })
  }

  return (
    <div className="flex flex-col dark:bg-gray-900 transition-colors h-full">
      {/* 顶部区域 */}
      <section className="flex justify-between items-center px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 flex-shrink-0">
        {/* 左侧占位 */}
        <div className="flex-1" />

        {/* 右侧：回收站标识 */}
        <div className="flex items-center gap-3">
          {/* 回收站图标 */}
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          {/* 标题和统计 */}
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
              回收站
            </h1>
            {!loading && (
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                {novels.length > 0 ? `${novels.length} 部已归档` : '暂无归档内容'}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 列表区域 */}
      <div className="flex-1 px-4 sm:px-6 py-2">
        <TrashList
          novels={novels}
          loading={loading}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onContextMenu={handleContextMenu}
        />

        {/* 右键菜单 */}
        {contextMenu.novel && contextMenu.position && (
          <TrashContextMenu
            novel={contextMenu.novel}
            position={contextMenu.position}
            onRestore={handleRestoreNovel}
            onPermanentDelete={handlePermanentDeleteNovel}
            onClose={() => setContextMenu({ novel: null, position: null })}
          />
        )}
      </div>

      {/* 批量操作工具栏 */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        totalCount={novels.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onBulkRestore={handleBulkRestore}
        onBulkDelete={handleBulkDelete}
      />

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        title={deleteDialog.type === 'single' ? '永久删除小说' : '批量永久删除'}
        description={
          deleteDialog.type === 'single'
            ? `确定要永久删除小说《${deleteDialog.novel?.title}》吗？此操作无法撤销！`
            : `确定要永久删除选中的 ${deleteDialog.count} 部小说吗？此操作无法撤销！`
        }
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialog({ open: false, type: 'single', novel: null, count: 0 })
          }
        }}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  )
}
