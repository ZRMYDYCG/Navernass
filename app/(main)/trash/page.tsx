'use client'

import type { ContextMenuState, DeleteDialogState } from './types'
import type { Novel } from '@/lib/supabase/sdk'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { novelsApi } from '@/lib/supabase/sdk'
import { BulkActionsBar } from './_components/bulk-actions-bar'
import { DeleteConfirmDialog } from './_components/delete-confirm-dialog'
import { TrashContextMenu } from './_components/trash-context-menu'
import { TrashList } from './_components/trash-list'

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
    <div className="flex flex-col bg-background transition-colors h-full">

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
            ? `确定要永久删除小说《${deleteDialog.novel?.title || ''}》吗？此操作无法撤销！`
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
