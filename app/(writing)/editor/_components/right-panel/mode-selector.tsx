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
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors border border-gray-200 dark:border-gray-700"
      >
        {(() => {
          const IconComponent = currentMode?.icon
          return (
            <>
              {typeof IconComponent === 'string'
                ? (
                    <span className="text-xs">{IconComponent}</span>
                  )
                : IconComponent
                  ? (
                      <IconComponent className="w-3.5 h-3.5" />
                    )
                  : null}
              <span className="text-gray-900 dark:text-gray-100">{currentMode?.label}</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </>
          )
        })()}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full mb-1 left-0 z-20 min-w-[140px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
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
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    value === mode.value
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {typeof IconComp === 'string'
                    ? (
                        <span className="text-xs">{IconComp}</span>
                      )
                    : IconComp
                      ? (
                          <IconComp className="w-3.5 h-3.5" />
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
