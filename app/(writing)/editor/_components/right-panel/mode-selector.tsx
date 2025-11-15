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
        className="flex items-center gap-1 px-1.5 py-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:scale-105 active:scale-95"
      >
        {(() => {
          const IconComponent = currentMode?.icon
          return (
            <>
              {typeof IconComponent === 'string'
                ? (
                    <span className="text-[10px]">{IconComponent}</span>
                  )
                : IconComponent
                  ? (
                      <IconComponent className="w-3 h-3" />
                    )
                  : null}
              <span className="text-gray-900 dark:text-gray-100">{currentMode?.label}</span>
              <ChevronDown className="w-2.5 h-2.5 text-gray-500 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </>
          )
        })()}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full mb-1 left-0 z-20 min-w-[120px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg py-0.5 animate-in fade-in-0 zoom-in-95 duration-200">
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
                  className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150 ${
                    value === mode.value
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {typeof IconComp === 'string'
                    ? (
                        <span className="text-[10px]">{IconComp}</span>
                      )
                    : IconComp
                      ? (
                          <IconComp className="w-3 h-3" />
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
