'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface EditChatTitleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTitle: string
  conversationId: string
  onSave: (conversationId: string, newTitle: string) => void
}

/**
 * 编辑对话标题弹窗组件
 */
export function EditChatTitleDialog({
  open,
  onOpenChange,
  currentTitle,
  conversationId,
  onSave,
}: EditChatTitleDialogProps) {
  const [title, setTitle] = useState(currentTitle)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      return
    }

    setIsLoading(true)
    try {
      await onSave(conversationId, title.trim())
      onOpenChange(false)
    } catch (error) {
      console.error('保存标题失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setTitle(currentTitle)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>编辑对话标题</DialogTitle>
          <DialogDescription>修改对话标题以便更好地识别和查找</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="输入对话标题"
            maxLength={100}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSave()
              }
            }}
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || isLoading}>
            {isLoading ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
