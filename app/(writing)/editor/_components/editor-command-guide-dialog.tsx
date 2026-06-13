'use client'

import type { KeyToken } from '@/lib/editor/keyboard-labels'
import { useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useI18n } from '@/hooks/use-i18n'
import {
  COMMAND_GUIDE_SECTIONS,
  COMMAND_GUIDE_TABS,
  type CommandGuideItemDef,
  type CommandGuideTab,
} from '@/lib/editor/command-guide-registry'
import { resolveKeyTokens } from '@/lib/editor/keyboard-labels'
import { cn } from '@/lib/utils'

interface EditorCommandGuideDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ShortcutKeys({ keys }: { keys: KeyToken[] }) {
  const resolved = resolveKeyTokens(keys)

  return (
    <KbdGroup className="shrink-0">
      {resolved.map((key, index) => (
        <span key={`${key}-${index}`} className="inline-flex items-center gap-0.5">
          {index > 0 && <span className="text-muted-foreground text-[10px]">+</span>}
          <Kbd>{key}</Kbd>
        </span>
      ))}
    </KbdGroup>
  )
}

function TriggerBadge({ trigger }: { trigger: string }) {
  return (
    <KbdGroup className="shrink-0">
      <Kbd>{trigger}</Kbd>
    </KbdGroup>
  )
}

function CommandGuideItemRow({
  item,
  label,
  description,
}: {
  item: CommandGuideItemDef
  label: string
  description?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border/60 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      {item.keys && item.keys.length > 0 && <ShortcutKeys keys={item.keys} />}
      {item.trigger && !item.keys && <TriggerBadge trigger={item.trigger} />}
    </div>
  )
}

export function EditorCommandGuideDialog({ open, onOpenChange }: EditorCommandGuideDialogProps) {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<CommandGuideTab>('shortcuts')

  const sectionsByTab = useMemo(() => {
    const result = {} as Record<CommandGuideTab, typeof COMMAND_GUIDE_SECTIONS>
    for (const tab of COMMAND_GUIDE_TABS) {
      result[tab] = COMMAND_GUIDE_SECTIONS.filter(section => section.tab === tab)
    }
    return result
  }, [])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setActiveTab('shortcuts')
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle>{t('commandGuide.title')}</DialogTitle>
          <DialogDescription className="mt-1.5">
            {t('commandGuide.description')}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={value => setActiveTab(value as CommandGuideTab)}
          className="flex flex-col flex-1 min-h-0 gap-0"
        >
          <div className="px-6 py-3 border-b border-border">
            <TabsList className="w-full grid grid-cols-3">
              {COMMAND_GUIDE_TABS.map(tab => (
                <TabsTrigger key={tab} value={tab}>
                  {t(`commandGuide.tabs.${tab}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {COMMAND_GUIDE_TABS.map(tab => (
            <TabsContent
              key={tab}
              value={tab}
              className={cn('flex-1 min-h-0 mt-0 outline-none')}
            >
              <ScrollArea className="h-[min(52vh,480px)]">
                <div className="px-6 py-4 space-y-6">
                  {sectionsByTab[tab].map(section => (
                    <section key={section.id}>
                      <div className="mb-2">
                        <h3 className="text-sm font-medium text-foreground">
                          {t(section.titleKey)}
                        </h3>
                        {section.descriptionKey && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {t(section.descriptionKey)}
                          </p>
                        )}
                      </div>
                      <div className="rounded-lg border border-border bg-card/50 px-3">
                        {section.items.map(item => (
                          <CommandGuideItemRow
                            key={item.id}
                            item={item}
                            label={t(item.labelKey)}
                            description={item.descriptionKey ? t(item.descriptionKey) : undefined}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        <div className="px-6 py-3 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            {t('commandGuide.footerHint')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
