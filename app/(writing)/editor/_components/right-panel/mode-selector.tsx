'use client'

import type { AiMode } from './types'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
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
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 text-xs bg-background hover:bg-accent rounded-md transition-all duration-200 border border-border shadow-sm hover:shadow-md"
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
              <ChevronDown className="w-2.5 h-2.5 text-muted-foreground transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </>
          )
        })()}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full mb-1 left-0 z-20 min-w-[220px] bg-card border border-border rounded-lg shadow-xl py-1 animate-in fade-in-0 zoom-in-95 duration-200">
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
                    'w-full flex flex-col items-start gap-0.5 px-2.5 py-2 text-left hover:bg-accent transition-all duration-150',
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
          </div>
        </>
      )}
    </div>
  )
}
