'use client'

import {
  ArrowDownToLine,
  Check,
  RotateCcw,
  X,
} from 'lucide-react'

interface AIResultPanelProps {
  isLoading: boolean
  content: string
  isCompleted: boolean
  onReplace: () => void
  onInsertBelow: () => void
  onCancel: () => void
  onRetry: () => void
}

export function AIResultPanel({
  isLoading,
  content,
  isCompleted,
  onReplace,
  onInsertBelow,
  onCancel,
  onRetry,
}: AIResultPanelProps) {
  return (
    <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl w-[420px] overflow-hidden">
      {/* 加载中状态 */}
      {isLoading && !content && (
        <div className="px-4 py-8 flex items-center justify-center gap-3">
          <div className="inline-block w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-gray-100 animate-spin rounded-full" />
          <span className="text-sm text-gray-600 dark:text-gray-400">加载中...</span>
        </div>
      )}

      {/* 编辑中状态（流式输出） */}
      {isLoading && content && (
        <div>
          <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700">
            <div className="inline-block w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-gray-100 animate-spin rounded-full" />
            <span className="text-sm text-gray-600 dark:text-gray-400">编辑中...</span>
          </div>
          <div className="px-4 py-3 max-h-[300px] overflow-y-auto">
            <div className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
              {content}
              <span className="inline-block w-0.5 h-4 ml-0.5 bg-gray-900 dark:bg-gray-100 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* 完成状态 */}
      {isCompleted && content && !isLoading && (
        <div>
          {/* 显示生成的内容 */}
          <div className="px-4 py-3 max-h-[300px] overflow-y-auto border-b border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="py-1">
            <button
              type="button"
              onClick={onReplace}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>替换</span>
            </button>
            <button
              type="button"
              onClick={onInsertBelow}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>在下方插入</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              <span>取消</span>
            </button>
            <button
              type="button"
              onClick={onRetry}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>再试一次</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
