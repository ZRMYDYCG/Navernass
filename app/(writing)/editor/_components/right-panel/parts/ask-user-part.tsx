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

  const fields = formData?.fields ?? []
  const title = formData?.title
  const description = formData?.description

  const [values, setValues] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isSubmitted = chatActions?.isFormSubmitted(formKey) ?? false
  const isDisabled = !isReady || hasError || isSubmitted || isSubmitting || chatActions?.isChatLoading

  useEffect(() => {
    setValues((prev) => {
      const next = { ...prev }
      for (const field of fields) {
        if (next[field.id] === undefined) next[field.id] = ''
      }
      return next
    })
  }, [fields])

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
    <div className="rounded-md border border-border bg-card text-[11.5px] my-1.5 overflow-hidden shadow-paper-sm">
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

      <div className="px-2.5 py-2 space-y-2.5">
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
              <SubmittedSummary fields={fields} values={values} />
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
        'space-y-1',
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
        field.options.length <= 4
          ? (
              <SegmentedControl
                value={value}
                onValueChange={onChange}
                disabled={disabled}
                className="w-full flex-wrap h-auto gap-1 p-1"
                size="sm"
              >
                {field.options.map(opt => (
                  <SegmentedControlItem
                    key={opt.value}
                    value={opt.value}
                    className="flex-1 min-w-0 text-[10px]"
                  >
                    {opt.label}
                  </SegmentedControlItem>
                ))}
              </SegmentedControl>
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
}: {
  fields: AskUserField[]
  values: Record<string, string>
}) {
  const { t } = useI18n()
  return (
    <div className="rounded-md bg-muted/50 border border-border px-2 py-1.5 space-y-1">
      <div className="text-[10px] text-emerald-600 flex items-center gap-1">
        <Check className="w-3 h-3" />
        {t('editor.rightPanel.askUserForm.submitted')}
      </div>
      {fields.map(f => (
        <div key={f.id} className="text-[10.5px]">
          <span className="text-muted-foreground">{f.label}: </span>
          <span className="text-foreground">{values[f.id] || '—'}</span>
        </div>
      ))}
    </div>
  )
}
