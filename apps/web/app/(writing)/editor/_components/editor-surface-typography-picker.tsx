'use client'

import { AlignLeft, Focus, Minus, Type } from 'lucide-react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useI18n } from '@/hooks/use-i18n'
import {
  EDITOR_COLUMN_WIDTH_OPTIONS,
  EDITOR_LINE_HEIGHT_OPTIONS,
  type EditorColumnWidthKey,
  type EditorLineHeightKey,
  type EditorTypographySettings,
} from '@/lib/editor/typography-options'
import { cn } from '@/lib/utils'

interface EditorSurfaceTypographyPickerProps {
  value: EditorTypographySettings
  onChange: (patch: Partial<EditorTypographySettings>) => void
  className?: string
}

function ToggleRow({
  label,
  pressed,
  onPressedChange,
  onLabel,
  offLabel,
}: {
  label: string
  pressed: boolean
  onPressedChange: (next: boolean) => void
  onLabel: string
  offLabel: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-xs font-normal text-muted-foreground">{label}</Label>
      <Button
        type="button"
        variant={pressed ? 'secondary' : 'outline'}
        size="sm"
        className="h-7 min-w-14 px-2 text-xs"
        aria-pressed={pressed}
        onClick={() => onPressedChange(!pressed)}
      >
        {pressed ? onLabel : offLabel}
      </Button>
    </div>
  )
}

function OptionChipGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T, i18nKey: string }[]
  value: T
  onChange: (next: T) => void
}) {
  const { t } = useI18n()

  return (
    <div className="flex flex-wrap gap-1">
      {options.map(option => (
        <Button
          key={option.value}
          type="button"
          variant={value === option.value ? 'secondary' : 'outline'}
          size="sm"
          className="h-7 px-2 text-xs"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {t(option.i18nKey)}
        </Button>
      ))}
    </div>
  )
}

export function EditorSurfaceTypographyPicker({
  value,
  onChange,
  className,
}: EditorSurfaceTypographyPickerProps) {
  const { t } = useI18n()

  const activeCount = useMemo(() => {
    let count = 0
    if (value.firstLineIndent) count += 1
    if (value.underlinePaper) count += 1
    if (value.proseFocus) count += 1
    if (value.lineHeight !== 'normal') count += 1
    if (value.columnWidth !== 'default') count += 1
    return count
  }, [value])

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
        >
          <Type className="size-3.5" strokeWidth={1.5} />
          <span>{t('editor.typography.label')}</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] leading-none text-secondary-foreground tabular-nums">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 space-y-4 p-3">
        <ToggleRow
          label={t('editor.typography.firstLineIndent')}
          pressed={value.firstLineIndent}
          onPressedChange={next => onChange({ firstLineIndent: next })}
          onLabel={t('editor.typography.on')}
          offLabel={t('editor.typography.off')}
        />
        <ToggleRow
          label={t('editor.typography.underlinePaper')}
          pressed={value.underlinePaper}
          onPressedChange={next => onChange({ underlinePaper: next })}
          onLabel={t('editor.typography.on')}
          offLabel={t('editor.typography.off')}
        />
        <ToggleRow
          label={t('editor.typography.proseFocus')}
          pressed={value.proseFocus}
          onPressedChange={next => onChange({ proseFocus: next })}
          onLabel={t('editor.typography.on')}
          offLabel={t('editor.typography.off')}
        />
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          {t('editor.typography.proseFocusHint')}
        </p>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
            <AlignLeft className="size-3.5" strokeWidth={1.5} />
            {t('editor.typography.lineHeight')}
          </Label>
          <OptionChipGroup<EditorLineHeightKey>
            options={EDITOR_LINE_HEIGHT_OPTIONS}
            value={value.lineHeight}
            onChange={next => onChange({ lineHeight: next })}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
            <Minus className="size-3.5 rotate-90" strokeWidth={1.5} />
            {t('editor.typography.columnWidth')}
          </Label>
          <OptionChipGroup<EditorColumnWidthKey>
            options={EDITOR_COLUMN_WIDTH_OPTIONS}
            value={value.columnWidth}
            onChange={next => onChange({ columnWidth: next })}
          />
        </div>

        <p className="flex items-start gap-1.5 text-[10px] leading-relaxed text-muted-foreground">
          <Focus className="mt-0.5 size-3 shrink-0" strokeWidth={1.5} />
          {t('editor.typography.hint')}
        </p>
      </PopoverContent>
    </Popover>
  )
}
