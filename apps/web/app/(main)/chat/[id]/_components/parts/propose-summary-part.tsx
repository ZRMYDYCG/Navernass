'use client'

import { Check, ClipboardList, Copy, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/use-i18n'
import { copyTextToClipboard } from '@/lib/utils'

interface ProposeSummaryInput {
  title: string
  content: string
}

interface ProposeSummaryOutput extends ProposeSummaryInput {
  ok: boolean
  kind: 'propose_summary'
  status?: 'pending' | 'accepted' | 'rejected' | 'error'
  error?: string
}

interface ProposeSummaryPartProps {
  toolCallId: string
  state: string
  input?: ProposeSummaryInput
  output?: ProposeSummaryOutput
  errorText?: string
}

export function ProposeSummaryPart({ state, input, output, errorText }: ProposeSummaryPartProps) {
  const { t } = useI18n()
  const [isCopying, setIsCopying] = useState(false)
  const status = output?.status || (state === 'output-available' ? 'pending' : state)
  const hasInput = input && (input.title || input.content)

  const handleCopy = async () => {
    if (!input?.content) return
    setIsCopying(true)
    try {
      await copyTextToClipboard(`# ${input.title}\n\n${input.content}`)
      toast.success(t('chat.agent.tools.proposeSummary.copied'))
    } catch (err) {
      console.error('[propose-summary] copy failed:', err)
      toast.error(t('chat.agent.tools.proposeSummary.copyFailed'))
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <div className="my-1.5 min-w-0 max-w-full overflow-hidden rounded-md border border-border bg-card text-[12px] shadow-paper-sm">
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border bg-muted/40">
        <ClipboardList className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="font-medium text-foreground">
          {t('chat.agent.tools.proposeSummary.title')}
        </span>
        {status === 'accepted' && (
          <Check className="w-3.5 h-3.5 text-emerald-500 ml-auto shrink-0" />
        )}
      </div>

      <div className="min-w-0 space-y-2 px-3 py-2">
        {hasInput
          ? (
              <div className="space-y-1.5">
                <div className="text-[13px] font-semibold text-foreground">{input.title}</div>
                <div className="text-[11.5px] text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {input.content}
                </div>
              </div>
            )
          : (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                {t('chat.agent.tools.state.thinking')}
              </div>
            )}

        {(errorText || output?.error) && (
          <div className="text-[10.5px] text-destructive">
            {errorText || output?.error}
          </div>
        )}

        {hasInput && (
          <div className="flex justify-end gap-1.5 pt-0.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] gap-1"
              disabled={isCopying}
              onClick={() => void handleCopy()}
            >
              {isCopying
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <Copy className="w-3 h-3" />}
              {t('chat.agent.tools.proposeSummary.copy')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
