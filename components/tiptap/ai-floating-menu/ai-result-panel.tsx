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

export function AIResultPanel({ ref, isLoading, content, isCompleted, onReplace, onInsertBelow, onCancel, onRetry }: AIResultPanelProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={ref}
      className="bg-popover border border-border rounded shadow-xl w-[320px] overflow-hidden"
    >
      {isLoading && !content && (
        <div>
          <div className="px-2.5 py-2 flex items-center gap-2 border-b border-border">
            <div className="inline-block w-3 h-3 border-2 border-muted-foreground border-t-foreground animate-spin rounded-full" />
            <span className="text-xs text-muted-foreground">AI 正在思考...</span>
          </div>
          <div className="px-2.5 py-3">
            <div className="space-y-2">
              <div className="h-2 bg-muted rounded animate-pulse w-full" />
              <div className="h-2 bg-muted rounded animate-pulse w-5/6" />
              <div className="h-2 bg-muted rounded animate-pulse w-4/6" />
            </div>
          </div>
          <div className="py-0.5 border-t border-border">
            <button
              type="button"
              onClick={onCancel}
              className="w-full px-2.5 py-1.5 text-left text-xs text-popover-foreground hover:bg-accent transition-colors flex items-center gap-1.5"
            >
              <X className="w-3 h-3" />
              <span>取消</span>
            </button>
          </div>
        </div>
      )}

      {isLoading && content && (
        <div>
          <div className="px-2.5 py-2 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <div className="inline-block w-3 h-3 border-2 border-muted-foreground border-t-foreground animate-spin rounded-full" />
              <span className="text-xs text-muted-foreground">AI 正在生成...</span>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="p-1 hover:bg-accent rounded transition-colors"
              title="停止生成"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
          <div className="px-2.5 py-2 max-h-[240px] overflow-y-auto">
            <div className="text-xs text-popover-foreground leading-relaxed whitespace-pre-wrap">
              {content}
              <span className="inline-block w-0.5 h-3 ml-0.5 bg-foreground animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {isCompleted && content && !isLoading && (
        <div>
          <div className="px-2.5 py-2 max-h-[240px] overflow-y-auto border-b border-border">
            <div className="text-xs text-popover-foreground leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
          </div>

          <div className="py-0.5">
            <button
              type="button"
              onClick={onReplace}
              className="w-full px-2.5 py-1.5 text-left text-xs text-popover-foreground hover:bg-accent transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3 h-3" />
              <span>Suggest</span>
            </button>
            <button
              type="button"
              onClick={onInsertBelow}
              className="w-full px-2.5 py-1.5 text-left text-xs text-popover-foreground hover:bg-accent transition-colors flex items-center gap-1.5"
            >
              <ArrowDownToLine className="w-3 h-3" />
              <span>在下方插入</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full px-2.5 py-1.5 text-left text-xs text-popover-foreground hover:bg-accent transition-colors flex items-center gap-1.5"
            >
              <X className="w-3 h-3" />
              <span>取消</span>
            </button>
            <button
              type="button"
              onClick={onRetry}
              className="w-full px-2.5 py-1.5 text-left text-xs text-popover-foreground hover:bg-accent transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span>再试一次</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

AIResultPanel.displayName = 'AIResultPanel'





