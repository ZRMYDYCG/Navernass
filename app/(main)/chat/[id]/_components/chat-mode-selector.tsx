'use client'

import type { ChatAiMode } from '@/lib/ai/agents/chat-modes'
import { Bot, ChevronDown, Lightbulb, MessageSquare, Palette, Wrench } from 'lucide-react'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

interface ChatModeSelectorProps {
  value: ChatAiMode
  onChange: (value: ChatAiMode) => void
  disabled?: boolean
}

interface ModeOption {
  value: ChatAiMode
  icon: React.ComponentType<{ className?: string }>
}

const MODE_ICONS: Record<ChatAiMode, ModeOption['icon']> = {
  ask: MessageSquare,
  brainstorm: Lightbulb,
  craft: Palette,
  polish: Wrench,
  agent: Bot,
}

const MODE_VALUES: ChatAiMode[] = ['ask', 'brainstorm', 'craft', 'polish', 'agent']

export function ChatModeSelector({ value, onChange, disabled = false }: ChatModeSelectorProps) {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const CurrentIcon = MODE_ICONS[value] || MessageSquare

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-8 items-center gap-1.5 px-2 text-xs bg-background hover:bg-accent rounded-md transition-colors duration-200 border border-border/80',
            'disabled:cursor-not-allowed disabled:opacity-60',
          )}
          aria-label={t(`chat.agent.modes.${value}.label`)}
        >
          <CurrentIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-foreground">{t(`chat.agent.modes.${value}.label`)}</span>
          <ChevronDown
            className={cn(
              'w-2.5 h-2.5 text-muted-foreground transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="min-w-[260px] p-1">
        {MODE_VALUES.map((modeValue) => {
          const Icon = MODE_ICONS[modeValue]
          const isActive = value === modeValue
          return (
            <button
              type="button"
              key={modeValue}
              onClick={() => {
                onChange(modeValue)
                setIsOpen(false)
              }}
              className={cn(
                'w-full flex flex-col items-start gap-0.5 px-2.5 py-2 text-left hover:bg-accent transition-all duration-150 rounded-sm',
                isActive ? 'bg-accent' : '',
              )}
            >
              <span
                className={cn(
                  'flex items-center gap-2 text-xs',
                  isActive ? 'text-foreground font-medium' : 'text-muted-foreground',
                )}
              >
                <Icon className="w-3 h-3 opacity-70 shrink-0" />
                <span>{t(`chat.agent.modes.${modeValue}.label`)}</span>
              </span>
              <span className="text-[10px] text-muted-foreground leading-snug pl-5 line-clamp-2">
                {t(`chat.agent.modes.${modeValue}.description`)}
              </span>
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
