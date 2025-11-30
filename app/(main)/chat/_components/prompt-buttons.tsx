'use client'

import { cn } from '@/lib/utils'
import { PROMPT_SUGGESTIONS } from '../config'

interface PromptButtonsProps {
  onPromptClick?: (prompt: string) => void
  disabled?: boolean
}

export function PromptButtons({ onPromptClick, disabled = false }: PromptButtonsProps) {
  const handleClick = (label: string) => {
    if (!disabled && onPromptClick) {
      onPromptClick(label)
    }
  }

  return (
    <section className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
        {PROMPT_SUGGESTIONS.map(({ label }) => (
          <button
            key={label}
            type="button"
            onClick={() => handleClick(label)}
            disabled={disabled}
            className={cn(
              'px-4 py-2.5 rounded-lg border text-sm transition-all font-serif',
              'bg-card border-border/60',
              'text-muted-foreground',
              'hover:border-border hover:text-foreground',
              'hover:bg-accent',
              'active:scale-[0.98]',
              disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:shadow-sm hover:-translate-y-0.5',
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  )
}
