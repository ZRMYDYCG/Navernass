import { RotateCcw, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BulkActionsBarProps {
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onDeselectAll: () => void
  onBulkRestore: () => void
  onBulkDelete: () => void
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkRestore,
  onBulkDelete,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  const allSelected = selectedCount === totalCount

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
        {/* 选择信息 */}
        <div className="flex items-center gap-2 px-2">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            已选择
            {' '}
            {selectedCount}
            {' '}
            项
          </span>
          {!allSelected && (
            <>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <button
                type="button"
                onClick={onSelectAll}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                全选
              </button>
            </>
          )}
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

        {/* 批量操作按钮 */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onBulkRestore}
            variant="ghost"
            size="sm"
            className="h-8 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            恢复
          </Button>
          <Button
            onClick={onBulkDelete}
            variant="ghost"
            size="sm"
            className="h-8 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            永久删除
          </Button>
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

        {/* 取消选择 */}
        <button
          type="button"
          onClick={onDeselectAll}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label="取消选择"
        >
          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </div>
  )
}
