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
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300 w-[calc(100%-2rem)] sm:w-auto max-w-2xl">
      <div className="bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 px-3 sm:px-5 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-4">
        {/* 选择信息 */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 px-1 sm:px-2">
          <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
            <span className="hidden sm:inline">已选择 </span>
            {selectedCount}
            <span className="hidden sm:inline"> 项</span>
          </span>
          {!allSelected && (
            <>
              <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">|</span>
              <button
                type="button"
                onClick={onSelectAll}
                className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors whitespace-nowrap"
              >
                全选
              </button>
            </>
          )}
        </div>

        <div className="h-5 sm:h-6 w-px bg-gray-200 dark:bg-zinc-700" />

        {/* 批量操作按钮 */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            onClick={onBulkRestore}
            variant="ghost"
            size="sm"
            className="h-7 sm:h-8 px-2 sm:px-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">恢复</span>
          </Button>
          <Button
            onClick={onBulkDelete}
            variant="ghost"
            size="sm"
            className="h-7 sm:h-8 px-2 sm:px-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">删除</span>
          </Button>
        </div>

        <div className="h-5 sm:h-6 w-px bg-gray-200 dark:bg-zinc-700" />

        {/* 取消选择 */}
        <button
          type="button"
          onClick={onDeselectAll}
          className="p-1 sm:p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors shrink-0"
          aria-label="取消选择"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </div>
  )
}
