'use client'

import { Check, ClipboardList, Loader2, Send } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { useChatActions } from './chat-actions-context'
import type { AskUserField, AskUserOutput } from './types'

interface AskUserPartProps {
  formKey: string
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error' | string
  input?: {
    title?: string
    description?: string
    fields?: AskUserField[]
  }
  output?: AskUserOutput
  errorText?: string
}

export function AskUserPart({ formKey, state, input, output, errorText }: AskUserPartProps) {
  const { t } = useI18n()
  const chatActions = useChatActions()
  const isStreamingInput = state === 'input-streaming'
  const isReady = state === 'input-available' || state === 'output-available'
  const hasError = state === 'output-error' || (output && !output.ok)

  const formData = useMemo(() => {
    if (output?.ok) return output
    if (input?.fields?.length) return { ok: true as const, ...input }
    return null
  }, [input, output])

  // 关键：fields / title / description 都从 formData 派生，避免 ?? [] 导致每渲染新引用
  const fields = useMemo<AskUserField[]>(() => formData?.fields ?? [], [formData])
  const title = formData?.title
  const description = formData?.description

  const [values, setValues] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isSubmitted = chatActions?.isFormSubmitted(formKey) ?? false
  const isDisabled = !isReady || hasError || isSubmitted || isSubmitting || chatActions?.isChatLoading

  // 用稳定的字段 id 序列做依赖，避免 fields 数组引用变化触发死循环。
  // 同时只在"真的有新字段"时 setValues，幂等性保证不触发无谓更新。
  const fieldIdsKey = useMemo(() => fields.map(f => f.id).join(''), [fields])

  useEffect(() => {
    if (fields.length === 0) return
    setValues((prev) => {
      let changed = false
      const next: Record<string, string> = { ...prev }
      for (const field of fields) {
        if (next[field.id] === undefined) {
          next[field.id] = ''
          changed = true
        }
      }
      return changed ? next : prev
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldIdsKey])

  const setFieldValue = useCallback((id: string, value: string) => {
    setValues(prev => ({ ...prev, [id]: value }))
  }, [])

  const missingRequired = fields.some(
    f => (f.required !== false) && !values[f.id]?.trim(),
  )

  const handleSubmit = async () => {
    if (!chatActions || isDisabled || missingRequired) return
    setIsSubmitting(true)
    try {
      const labels: Record<string, string> = {}
      for (const f of fields) labels[f.id] = f.label
      await chatActions.submitFormResponse({
        formKey,
        title,
        values,
        labels,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="my-1.5 min-w-0 max-w-full overflow-hidden rounded-md border border-border bg-card text-[11.5px] shadow-paper-sm">
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-border bg-muted/40">
        <ClipboardList className="w-3 h-3 text-primary shrink-0" />
        <span className="font-medium text-foreground">
          {title || t('editor.rightPanel.askUserForm.defaultTitle')}
        </span>
        {isStreamingInput && (
          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground ml-auto shrink-0" />
        )}
        {isSubmitted && (
          <Check className="w-3 h-3 text-emerald-500 ml-auto shrink-0" />
        )}
      </div>

      <div className="min-w-0 space-y-2.5 px-2.5 py-2">
        {description && (
          <p className="text-[10.5px] text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}

        {isStreamingInput && fields.length === 0 && (
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}

        {fields.map((field, index) => (
          <FormField
            key={field.id || `field-${index}`}
            field={field}
            value={values[field.id] ?? ''}
            onChange={v => setFieldValue(field.id, v)}
            disabled={isDisabled}
            isNew={isStreamingInput && index === fields.length - 1}
          />
        ))}

        {isStreamingInput && fields.length > 0 && (
          <div className="space-y-1.5 pt-0.5 animate-in fade-in-0 duration-300">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}

        {hasError && (
          <div className="text-[10.5px] text-destructive">
            {output?.error || errorText || t('editor.rightPanel.askUserForm.error')}
          </div>
        )}

        {isSubmitted
          ? (
              <SubmittedSummary fields={fields} values={values} submittedValues={output?.submittedValues} />
            )
          : isReady && !hasError && fields.length > 0 && (
            <div className="flex justify-end pt-0.5">
              <Button
                type="button"
                size="sm"
                className="h-7 text-[11px] gap-1"
                disabled={isDisabled || missingRequired}
                onClick={() => void handleSubmit()}
              >
                {isSubmitting
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : <Send className="w-3 h-3" />}
                {t('editor.rightPanel.askUserForm.submit')}
              </Button>
            </div>
          )}
      </div>
    </div>
  )
}

/** 仅当所有选项文案较短时，才用横向 SegmentedControl */
function shouldUseCompactRadio(options: { label: string }[]) {
  return options.length <= 4 && options.every(opt => opt.label.length <= 18)
}

function RadioOptionList({
  fieldId,
  options,
  value,
  onChange,
  disabled,
}: {
  fieldId: string
  options: { label: string, value: string }[]
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {options.map(opt => {
        const selected = value === opt.value
        const optionId = `${fieldId}-${opt.value}`

        return (
          <button
            key={opt.value}
            id={optionId}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              'w-full min-w-0 rounded-lg border px-2.5 py-2 text-left text-[10.5px] leading-relaxed transition-all duration-200',
              selected
                ? 'border-border bg-background/95 text-foreground shadow-paper-sm'
                : 'border-transparent bg-muted/30 text-foreground/90 hover:bg-muted/50',
            )}
          >
            <span className="block break-words">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function FormField({
  field,
  value,
  onChange,
  disabled,
  isNew,
}: {
  field: AskUserField
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  isNew?: boolean
}) {
  const id = `ask-user-${field.id}`

  return (
    <div
      className={cn(
        'min-w-0 space-y-1',
        isNew && 'animate-in fade-in-0 slide-in-from-bottom-1 duration-300',
      )}
    >
      <Label htmlFor={id} className="text-[10.5px] text-foreground font-medium">
        {field.label}
        {field.required !== false && <span className="text-destructive ml-0.5">*</span>}
      </Label>

      {field.type === 'textarea' && (
        <Textarea
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          rows={3}
          className="text-[11px] min-h-[60px] resize-none"
        />
      )}

      {field.type === 'text' && (
        <Input
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          className="h-8 text-[11px]"
        />
      )}

      {field.type === 'select' && field.options && (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className="h-8 text-[11px]">
            <SelectValue placeholder={field.placeholder || field.label} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map(opt => (
              <SelectItem key={opt.value} value={opt.value} className="text-[11px]">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {field.type === 'radio' && field.options && (
        shouldUseCompactRadio(field.options)
          ? (
              <SegmentedControl
                value={value}
                onValueChange={onChange}
                disabled={disabled}
                className="h-auto w-full min-w-0 flex-wrap gap-1 p-1"
                size="sm"
              >
                {field.options.map(opt => (
                  <SegmentedControlItem
                    key={opt.value}
                    value={opt.value}
                    className="min-w-0 flex-1 basis-[calc(33.333%-0.25rem)] whitespace-normal px-2 py-1 text-center text-[10px] leading-snug"
                  >
                    {opt.label}
                  </SegmentedControlItem>
                ))}
              </SegmentedControl>
            )
          : field.options.length <= 8
            ? (
                <RadioOptionList
                  fieldId={id}
                  options={field.options}
                  value={value}
                  onChange={onChange}
                  disabled={disabled}
                />
              )
            : (
              <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger className="h-8 text-[11px]">
                  <SelectValue placeholder={field.placeholder || field.label} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-[11px]">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
      )}
    </div>
  )
}

function SubmittedSummary({
  fields,
  values,
  submittedValues,
}: {
  fields: AskUserField[]
  values: Record<string, string>
  submittedValues?: Record<string, string>
}) {
  const { t } = useI18n()
  // 优先用本地 values（正在编辑/刚提交），本地为空时回退到持久化的 submittedValues
  const display = (id: string) => values[id] || submittedValues?.[id] || '—'
  return (
    <div className="rounded-md bg-muted/50 border border-border px-2 py-1.5 space-y-1">
      <div className="text-[10px] text-emerald-600 flex items-center gap-1">
        <Check className="w-3 h-3" />
        {t('editor.rightPanel.askUserForm.submitted')}
      </div>
      {fields.map(f => (
        <div key={f.id} className="min-w-0 text-[10.5px]">
          <span className="text-muted-foreground">{f.label}: </span>
          <span className="break-words text-foreground">{display(f.id)}</span>
        </div>
      ))}
    </div>
  )
}
