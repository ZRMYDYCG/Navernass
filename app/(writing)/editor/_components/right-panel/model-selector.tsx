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
        className="w-full flex items-center justify-between gap-2 px-2 py-1 text-xs bg-background hover:bg-accent rounded-md transition-all duration-200 border border-border shadow-sm hover:shadow-md"
      >
        <span className="text-foreground truncate font-medium flex items-center gap-1.5">
          {currentModel?.label}
          {currentModel?.isThinking && (
            <span className="px-1 py-0.5 text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
              Thinking
            </span>
          )}
        </span>
        <ChevronDown className="w-2.5 h-2.5 text-muted-foreground shrink-0 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full mb-1 left-0 right-0 z-20 bg-card border border-border rounded-lg shadow-xl py-1 animate-in fade-in-0 zoom-in-95 duration-200 max-h-48 overflow-y-auto">
            {MODEL_OPTIONS.map(model => (
              <button
                type="button"
                key={model.value}
                onClick={() => {
                  onChange(model.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-2.5 py-1.5 text-xs hover:bg-accent transition-all duration-150 flex items-center gap-1.5 ${
                  value === model.value
                    ? 'bg-accent text-foreground font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                <span className="truncate">{model.label}</span>
                {model.isThinking && (
                  <span className="px-1 py-0.5 text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded shrink-0">
                    Thinking
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
