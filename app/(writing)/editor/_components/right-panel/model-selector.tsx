import type { AiModel } from './types'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { MODEL_OPTIONS } from './constants'

interface ModelSelectorProps {
  value: AiModel
  onChange: (value: AiModel) => void
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentModel = MODEL_OPTIONS.find(m => m.value === value)

  return (
    <div className="relative flex-1">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-2 py-1 text-xs bg-white dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 rounded-md transition-all duration-200 border border-stone-200 dark:border-zinc-700 shadow-sm hover:shadow-md"
      >
        <span className="text-[#333333] dark:text-zinc-200 truncate font-medium">
          {currentModel?.label}
        </span>
        <ChevronDown className="w-2.5 h-2.5 text-stone-400 shrink-0 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full mb-1 left-0 right-0 z-20 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-lg shadow-xl py-1 animate-in fade-in-0 zoom-in-95 duration-200 max-h-48 overflow-y-auto">
            {MODEL_OPTIONS.map(model => (
              <button
                type="button"
                key={model.value}
                onClick={() => {
                  onChange(model.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-2.5 py-1.5 text-xs hover:bg-stone-50 dark:hover:bg-zinc-700 transition-all duration-150 ${
                  value === model.value
                    ? 'bg-stone-50 dark:bg-zinc-700 text-[#333333] dark:text-zinc-100 font-medium'
                    : 'text-stone-600 dark:text-zinc-400'
                }`}
              >
                {model.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
