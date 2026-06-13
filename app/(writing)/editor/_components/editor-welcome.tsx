'use client'

import Image from 'next/image'
import { Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { useI18n } from '@/hooks/use-i18n'
import { resolveKeyTokens } from '@/lib/editor/keyboard-labels'
import { openEditorCommandGuide } from '@/lib/editor/command-guide-bus'

const WELCOME_SHORTCUTS = [
  { keys: ['mod', 'S'] as const, labelKey: 'editor.welcome.shortcuts.save' },
  { keys: ['Ctrl', 'E'] as const, labelKey: 'editor.welcome.shortcuts.toggleLeftPanel' },
  { keys: ['Ctrl', 'L'] as const, labelKey: 'editor.welcome.shortcuts.toggleRightPanel' },
  { keys: ['mod', '/'] as const, labelKey: 'commandGuide.items.openGuide.label' },
  { trigger: '/', labelKey: 'commandGuide.items.slashMenu.label' },
] as const

export function EditorWelcome() {
  const { t } = useI18n()

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="min-h-full flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-6 text-muted-foreground max-w-md w-full">
          <Image
            src="/assets/svg/pen-light.svg"
            width={120}
            height={120}
            alt={t('editor.welcome.alt')}
            className="opacity-40 dark:hidden"
            priority
          />
          <Image
            src="/assets/svg/pen-dark.svg"
            width={120}
            height={120}
            alt={t('editor.welcome.alt')}
            className="opacity-40 hidden dark:block"
            priority
          />
          <p className="text-sm text-center">{t('editor.welcome.selectChapter')}</p>

          <div className="w-full rounded-lg border border-border bg-card/50 px-4 py-3 space-y-2.5">
            <p className="text-xs font-medium text-foreground">{t('commandGuide.welcome.hint')}</p>
            {WELCOME_SHORTCUTS.map((item) => {
              const label = t(item.labelKey)
              const key = 'keys' in item ? item.keys.join('-') : item.trigger

              return (
                <div key={key} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  {'keys' in item
                    ? (
                        <KbdGroup>
                          {resolveKeyTokens([...item.keys]).map((token, index) => (
                            <span key={`${token}-${index}`} className="inline-flex items-center gap-0.5">
                              {index > 0 && <span className="text-[10px]">+</span>}
                              <Kbd>{token}</Kbd>
                            </span>
                          ))}
                        </KbdGroup>
                      )
                    : (
                        <Kbd>{item.trigger}</Kbd>
                      )}
                </div>
              )
            })}
          </div>

          <p className="text-xs text-center">{t('commandGuide.welcome.more')}</p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={openEditorCommandGuide}
          >
            <Keyboard className="w-4 h-4" />
            {t('commandGuide.viewAll')}
          </Button>
        </div>
      </div>
    </div>
  )
}
