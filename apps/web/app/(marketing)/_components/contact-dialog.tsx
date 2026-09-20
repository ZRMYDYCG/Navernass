'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useI18n } from '@/hooks/use-i18n'

interface ContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type View = 'group' | 'wechat'

export function ContactDialog({ open, onOpenChange }: ContactDialogProps) {
  const { t } = useI18n()
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
          <DialogTitle>{t('marketing.contactDialog.title')}</DialogTitle>
          <DialogDescription>
            {isGroup ? t('marketing.contactDialog.descriptionGroup') : t('marketing.contactDialog.descriptionWechat')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isGroup
            ? (
                <section className="space-y-3">
                  <div className="rounded-xl border bg-muted/40 p-3 flex flex-col items-center gap-3">
                    <div className="relative w-[260px] h-[360px] max-w-full">
                      <Image
                        src="/qunliao.jpg"
                        alt={t('marketing.contactDialog.groupQrAlt')}
                        fill
                        sizes="260px"
                        className="rounded-lg object-contain"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {t('marketing.contactDialog.groupCaption')}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setView('wechat')}
                    >
                      {t('marketing.contactDialog.viewAdminWechat')}
                    </Button>
                  </div>
                </section>
              )
            : (
                <section className="space-y-3">
                  <div className="rounded-xl border bg-muted/40 p-3 flex flex-col items-center gap-3">
                    <p className="text-xs text-muted-foreground text-center">
                      {t('marketing.contactDialog.descriptionWechat')}
                    </p>
                    <div className="relative w-[220px] h-[320px] max-w-full">
                      <Image
                        src="/wechat.jpg"
                        alt={t('marketing.contactDialog.adminWechatAlt')}
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
                      {t('marketing.contactDialog.backToGroup')}
                    </Button>
                  </div>
                </section>
              )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
