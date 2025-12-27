'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CloseConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function CloseConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: CloseConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认退出</DialogTitle>
          <DialogDescription>
            确定要返回上一页吗？未保存的内容可能会丢失。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false)
              onConfirm()
            }}
          >
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
