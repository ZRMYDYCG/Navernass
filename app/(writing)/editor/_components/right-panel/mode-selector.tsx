import type { AiMode } from './types'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { MODE_OPTIONS } from './constants'

interface ModeSelectorProps {
  value: AiMode
  onChange: (value: AiMode) => void
}

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentMode = MODE_OPTIONS.find(m => m.value === value)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 text-xs bg-background hover:bg-accent rounded-md transition-all duration-200 border border-border shadow-sm hover:shadow-md"
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
              <span className="text-foreground">{currentMode?.label}</span>
              <ChevronDown className="w-2.5 h-2.5 text-muted-foreground transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </>
          )
        })()}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full mb-1 left-0 z-20 min-w-[120px] bg-card border border-border rounded-lg shadow-xl py-1 animate-in fade-in-0 zoom-in-95 duration-200">
            {MODE_OPTIONS.map((mode) => {
              const IconComp = mode.icon
              return (
                <button
                  type="button"
                  key={mode.value}
                  onClick={() => {
                    onChange(mode.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs hover:bg-accent transition-all duration-150 ${
                    value === mode.value
                      ? 'bg-accent text-foreground font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {typeof IconComp === 'string'
                    ? (
                        <span className="text-[10px] opacity-70">{IconComp}</span>
                      )
                    : IconComp
                      ? (
                          <IconComp className="w-3 h-3 opacity-70" />
                        )
                      : null}
                  <span>{mode.label}</span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
