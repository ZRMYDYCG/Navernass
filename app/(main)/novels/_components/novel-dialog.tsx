import type { Novel } from '@/lib/supabase/sdk'
import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface NovelDialogProps {
  open: boolean
  novel: Novel | null
  onOpenChange: (open: boolean) => void
  onSave: (data: { title: string, description: string }) => Promise<void>
}

export function NovelDialog({ open, novel, onOpenChange, onSave }: NovelDialogProps) {
  const [title, setTitle] = useState(novel?.title || '')
  const [description, setDescription] = useState(novel?.description || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTitle(novel?.title || '')
      setDescription(novel?.description || '')
    }
    onOpenChange(newOpen)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onSave({ title: title.trim(), description: description.trim() })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {novel ? '编辑小说信息' : '创建新小说'}
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  小说标题
                  {' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="请输入小说标题"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-gray-900 dark:focus:border-gray-200 focus:ring-0 focus-visible:ring-1 focus-visible:ring-gray-900/40 dark:focus-visible:ring-gray-100/30"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  简介（可选）
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="请输入小说简介"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-gray-900 dark:focus:border-gray-200 focus:ring-0 focus-visible:ring-1 focus-visible:ring-gray-900/40 dark:focus-visible:ring-gray-100/30 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  className="flex-1 bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                  disabled={isSaving}
                >
                  取消
                </Button>
              </Dialog.Close>
              <Button
                onClick={handleSave}
                className="flex-1 bg-black dark:bg-zinc-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                disabled={isSaving || !title.trim()}
              >
                {isSaving
                  ? novel
                    ? '保存中...'
                    : '创建中...'
                  : novel
                    ? '保存'
                    : '创建'}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
