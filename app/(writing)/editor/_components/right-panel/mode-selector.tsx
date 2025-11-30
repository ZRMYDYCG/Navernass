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
        className="flex items-center gap-1 px-2 py-1 text-xs bg-white dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 rounded-md transition-all duration-200 border border-stone-200 dark:border-zinc-700 shadow-sm hover:shadow-md"
      >
        {(() => {
          const IconComponent = currentMode?.icon
          return (
            <>
              {typeof IconComponent === 'string'
                ? (
                    <span className="text-[10px] text-stone-600 dark:text-zinc-400">{IconComponent}</span>
                  )
                : IconComponent
                  ? (
                      <IconComponent className="w-3 h-3 text-stone-600 dark:text-zinc-400" />
                    )
                  : null}
              <span className="text-[#333333] dark:text-zinc-200">{currentMode?.label}</span>
              <ChevronDown className="w-2.5 h-2.5 text-stone-400 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </>
          )
        })()}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full mb-1 left-0 z-20 min-w-[120px] bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg shadow-xl py-1 animate-in fade-in-0 zoom-in-95 duration-200">
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
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs hover:bg-stone-50 dark:hover:bg-zinc-700 transition-all duration-150 ${
                    value === mode.value
                      ? 'bg-stone-50 dark:bg-zinc-700 text-[#333333] dark:text-zinc-100 font-medium'
                      : 'text-stone-600 dark:text-zinc-400'
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
