'use client'

import type { AiModel } from './types'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { MODEL_OPTIONS } from './constants'

interface ModelSelectorProps {
  value: AiModel
  onChange: (value: AiModel) => void
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  const currentModel = MODEL_OPTIONS.find(m => m.value === value)
  const CurrentIcon = currentModel?.icon

  return (
    <div className="flex-1 min-w-0">
      <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="h-8 w-full flex items-center justify-between gap-2 px-2 text-xs bg-background hover:bg-accent rounded-md transition-colors duration-200 border border-border/80"
        >
          <span className="text-foreground truncate font-medium flex items-center gap-1.5 min-w-0">
            {CurrentIcon ? <CurrentIcon className="size-3.5" /> : null}
            <span className="truncate">{currentModel?.label}</span>
            {currentModel?.isThinking && (
              <span className="px-1 py-0.5 text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded shrink-0">
                {t('editor.rightPanel.thinkingBadge')}
              </span>
            )}
          </span>
          <ChevronDown
            className={cn(
              'w-2.5 h-2.5 text-muted-foreground shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-[var(--radix-popover-trigger-width)] p-1 max-h-48 overflow-y-auto">
        {MODEL_OPTIONS.map((model) => {
          const Icon = model.icon
          const isActive = value === model.value
          return (
            <button
              type="button"
              key={model.value}
              onClick={() => {
                onChange(model.value)
                setIsOpen(false)
              }}
              className={cn(
                'w-full text-left px-2.5 py-1.5 text-xs hover:bg-accent transition-all duration-150 flex items-center gap-2 rounded-sm',
                isActive ? 'bg-accent text-foreground font-medium' : 'text-muted-foreground',
              )}
            >
              <Icon className="size-3.5" />
              <span className="truncate flex-1 min-w-0">{model.label}</span>
              {model.isThinking && (
                <span className="px-1 py-0.5 text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded shrink-0">
                  {t('editor.rightPanel.thinkingBadge')}
                </span>
              )}
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
    </div>
  )
}
