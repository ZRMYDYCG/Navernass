'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type View = 'group' | 'wechat'

export function ContactDialog({ open, onOpenChange }: ContactDialogProps) {
  const [view, setView] = useState<View>('group')

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setView('group')
    }
    onOpenChange(next)
  }

  const isGroup = view === 'group'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>联系我们</DialogTitle>
          <DialogDescription>
            优先扫码加入群聊，和其他创作者一起交流；如果群聊二维码失效或无法进入，可以切换到微信二维码加管理员拉你进群。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isGroup
            ? (
                <section className="space-y-3">
                  <h3 className="text-sm font-medium text-foreground">群聊二维码</h3>
                  <div className="rounded-xl border bg-muted/40 p-3 flex flex-col items-center gap-3">
                    <div className="relative w-[260px] h-[360px] max-w-full">
                      <Image
                        src="/qunliao.jpg"
                        alt="Narraverse 群聊二维码"
                        fill
                        sizes="260px"
                        className="rounded-lg object-contain"
                        priority
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      扫码加入「Navernass 的朋友们」微信群聊。
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setView('wechat')}
                    >
                      如果无法进群，点这里查看管理员微信
                    </Button>
                  </div>
                </section>
              )
            : (
                <section className="space-y-3">
                  <h3 className="text-sm font-medium text-foreground">管理员微信</h3>
                  <div className="rounded-xl border bg-muted/40 p-3 flex flex-col items-center gap-3">
                    <p className="text-xs text-muted-foreground text-center">
                      如果群聊人数已满或二维码过期，可以先加管理员微信备注「Narraverse」，会尽快拉你进群。
                    </p>
                    <div className="relative w-[220px] h-[320px] max-w-full">
                      <Image
                        src="/wechat.jpg"
                        alt="微信二维码"
                        fill
                        sizes="220px"
                        className="rounded-lg object-contain"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setView('group')}
                    >
                      返回群聊二维码
                    </Button>
                  </div>
                </section>
              )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
