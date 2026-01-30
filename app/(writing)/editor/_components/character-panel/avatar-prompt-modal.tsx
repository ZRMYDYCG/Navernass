'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AvatarPromptModalProps {
  open: boolean
  promptText: string
  isGenerating: boolean
  generateError: string | null
  className?: string
  onPromptChange: (value: string) => void
  onCancel: () => void
  onConfirm: () => void
}

export function AvatarPromptModal({
  open,
  promptText,
  isGenerating,
  generateError,
  className,
  onPromptChange,
  onCancel,
  onConfirm,
}: AvatarPromptModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="avatar-prompt-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'fixed inset-0 z-[10000] flex items-center justify-center bg-black/40',
            className,
          )}
          onClick={() => {
            if (!isGenerating) onCancel()
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-[520px] max-w-[92vw] rounded-xl border border-border bg-background shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="text-sm font-medium">生成角色画像</div>
              <button
                type="button"
                className="h-8 w-8 rounded-md hover:bg-muted disabled:opacity-50"
                disabled={isGenerating}
                onClick={onCancel}
              >
                ×
              </button>
            </div>

            <div className="px-4 py-3 space-y-2">
              <div className="text-xs text-muted-foreground">请输入角色描述（越具体越好）</div>
              <textarea
                value={promptText}
                onChange={e => onPromptChange(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="例如：18岁少女，银色短发，蓝色瞳孔，穿学院风制服，气质冷淡，微笑..."
                disabled={isGenerating}
              />

              {generateError && <div className="text-xs text-rose-600">{generateError}</div>}
            </div>

            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border">
              <button
                type="button"
                className="h-9 rounded-md border border-border px-3 text-sm hover:bg-muted disabled:opacity-50"
                disabled={isGenerating}
                onClick={onCancel}
              >
                取消
              </button>
              <button
                type="button"
                className="h-9 rounded-md bg-primary px-4 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                disabled={isGenerating || !promptText.trim()}
                onClick={onConfirm}
              >
                {isGenerating ? '生成中...' : '生成'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
