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
        className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors border border-gray-200 dark:border-gray-700"
      >
        <span className="text-gray-900 dark:text-gray-100 truncate">
          {currentModel?.label}
        </span>
        <ChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full mb-1 left-0 right-0 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
            {MODEL_OPTIONS.map(model => (
              <button
                type="button"
                key={model.value}
                onClick={() => {
                  onChange(model.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  value === model.value
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium'
                    : 'text-gray-700 dark:text-gray-300'
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
