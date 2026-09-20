'use client'

import type { AiMode } from './types'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/use-i18n'
import { MODE_OPTIONS } from './constants'

interface ModeSelectorProps {
  value: AiMode
  onChange: (value: AiMode) => void
}

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  const currentMode = MODE_OPTIONS.find(m => m.value === value)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-8 items-center gap-1 px-2 text-xs bg-background hover:bg-accent rounded-md transition-colors duration-200 border border-border/80"
          aria-label={t(`editor.rightPanel.mode.${value}`)}
        >
          {(() => {
            const IconComponent = currentMode?.icon
            return (
              <>
                {typeof IconComponent === 'string'
                  ? (
                      <span className="text-[10px] text-muted-foreground">{IconComponent}</span>
                    )
                  : IconComponent
                    ? (
                        <IconComponent className="w-3 h-3 text-muted-foreground" />
                      )
                    : null}
                <span className="text-foreground">{t(`editor.rightPanel.mode.${value}`)}</span>
                <ChevronDown
                  className={cn(
                    'w-2.5 h-2.5 text-muted-foreground transition-transform duration-200',
                    isOpen && 'rotate-180',
                  )}
                />
              </>
            )
          })()}
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="min-w-[220px] p-1">
        {MODE_OPTIONS.map((mode) => {
          const IconComp = mode.icon
          const isActive = value === mode.value
          return (
            <button
              type="button"
              key={mode.value}
              onClick={() => {
                onChange(mode.value)
                setIsOpen(false)
              }}
              className={cn(
                'w-full flex flex-col items-start gap-0.5 px-2.5 py-2 text-left hover:bg-accent transition-all duration-150 rounded-sm',
                isActive ? 'bg-accent' : '',
              )}
            >
              <span className={cn(
                'flex items-center gap-2 text-xs',
                isActive ? 'text-foreground font-medium' : 'text-muted-foreground',
              )}
              >
                {typeof IconComp === 'string'
                  ? (
                      <span className="text-[10px] opacity-70">{IconComp}</span>
                    )
                  : IconComp
                    ? (
                        <IconComp className="w-3 h-3 opacity-70 shrink-0" />
                      )
                    : null}
                <span>{t(`editor.rightPanel.mode.${mode.value}`)}</span>
              </span>
              <span className="text-[10px] text-muted-foreground leading-snug pl-5">
                {t(`editor.rightPanel.mode.description.${mode.value}`)}
              </span>
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
