'use client'

import { MousePointer2 } from 'lucide-react'
import Image from 'next/image'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useI18n } from '@/hooks/use-i18n'
import {
  EDITOR_CURSOR_OPTIONS,
  type EditorCursorValue,
} from '@/lib/editor/cursor-options'
import { cn } from '@/lib/utils'

interface EditorCursorPickerProps {
  value: EditorCursorValue
  onChange: (value: EditorCursorValue) => void
  compact?: boolean
  className?: string
}

function CursorPreview({
  value,
  size = 20,
  className,
}: {
  value: EditorCursorValue
  size?: number
  className?: string
}) {
  const option = EDITOR_CURSOR_OPTIONS.find(item => item.value === value) ?? EDITOR_CURSOR_OPTIONS[0]

  if (!option.path) {
    return (
      <MousePointer2
        className={cn('text-muted-foreground', className)}
        style={{ width: size, height: size }}
        strokeWidth={1.5}
      />
    )
  }

  return (
    <Image
      src={option.path}
      alt=""
      width={size}
      height={size}
      className={cn('pointer-events-none select-none', className)}
      aria-hidden
    />
  )
}

export function EditorCursorPicker({
  value,
  onChange,
  compact = false,
  className,
}: EditorCursorPickerProps) {
  const { t } = useI18n()

  const current = useMemo(
    () => EDITOR_CURSOR_OPTIONS.find(option => option.value === value) ?? EDITOR_CURSOR_OPTIONS[0],
    [value],
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 gap-2 px-2 text-xs font-normal text-muted-foreground hover:text-foreground',
            className,
          )}
          aria-label={t('editor.cursor.label')}
        >
          <CursorPreview value={current.value} size={compact ? 16 : 18} />
          {!compact && (
            <span className="max-w-20 truncate">
              {t(`editor.cursor.options.${current.value}`)}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="z-[120] w-[min(18rem,calc(100vw-2rem))] p-3"
      >
        <div className="mb-2 text-xs font-medium text-foreground">
          {t('editor.cursor.label')}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {EDITOR_CURSOR_OPTIONS.map((option) => {
            const isActive = option.value === value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2 transition-colors',
                  isActive
                    ? 'border-ring bg-secondary text-foreground'
                    : 'border-border text-muted-foreground hover:border-ring/60 hover:bg-accent hover:text-foreground',
                )}
                aria-pressed={isActive}
                aria-label={t(`editor.cursor.options.${option.value}`)}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-background/80">
                  <CursorPreview value={option.value} size={24} />
                </span>
                <span className="w-full truncate text-center text-[10px] leading-none">
                  {t(`editor.cursor.options.${option.value}`)}
                </span>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
