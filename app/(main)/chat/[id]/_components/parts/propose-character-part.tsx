'use client'

import { Check, ExternalLink, Loader2, UserPlus, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/use-i18n'
import { useChatAgentActions } from '../../_hooks/chat-agent-actions-context'

interface ProposeCharacterInput {
  novelId: string
  name: string
  role?: string
  description?: string
  traits?: string[]
  keywords?: string[]
}

interface ProposeCharacterOutput extends ProposeCharacterInput {
  ok: boolean
  kind: 'propose_character'
  status?: 'pending' | 'accepted' | 'rejected' | 'error'
  entityId?: string
  entityTitle?: string
  jumpUrl?: string
  error?: string
}

interface ProposeCharacterPartProps {
  toolCallId: string
  state: string
  input?: ProposeCharacterInput
  output?: ProposeCharacterOutput
  errorText?: string
}

export function ProposeCharacterPart({ toolCallId, state, input, output, errorText }: ProposeCharacterPartProps) {
  const { t } = useI18n()
  const { acceptCharacterProposal, rejectProposal } = useChatAgentActions()
  const [isActing, setIsActing] = useState(false)

  const status = output?.status || (state === 'output-available' ? 'pending' : state)
  const hasInput = input && (input.name || input.description)

  return (
    <div className="my-1.5 min-w-0 max-w-full overflow-hidden rounded-md border border-border bg-card text-[12px] shadow-paper-sm">
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border bg-muted/40">
        <UserPlus className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="font-medium text-foreground">
          {t('chat.agent.tools.proposeCharacter.title')}
        </span>
        {status === 'accepted' && (
          <Check className="w-3.5 h-3.5 text-emerald-500 ml-auto shrink-0" />
        )}
        {status === 'rejected' && (
          <X className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0" />
        )}
        {isActing && (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground ml-auto shrink-0" />
        )}
      </div>

      <div className="min-w-0 space-y-2 px-3 py-2">
        {hasInput ? (
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-2">
              <span className="text-[13px] font-semibold text-foreground">{input.name}</span>
              {input.role && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-muted text-foreground/80">
                  {input.role}
                </span>
              )}
            </div>
            {input.description && (
              <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                {input.description}
              </p>
            )}
            {input.traits && input.traits.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {input.traits.map((trait, i) => (
                  <span key={i} className="px-1.5 py-0.5 text-[10px] rounded-md bg-muted text-foreground/80">
                    {trait}
                  </span>
                ))}
              </div>
            )}
            {input.novelId && (
              <div className="text-[10px] text-muted-foreground/70 font-mono truncate">
                novelId: {input.novelId}
              </div>
            )}
          </div>
        ) : (
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

        {status === 'accepted' && output?.jumpUrl ? (
          <div className="flex justify-end pt-0.5">
            <Button asChild size="sm" className="h-7 text-[11px] gap-1">
              <a href={output.jumpUrl}>
                <ExternalLink className="w-3 h-3" />
                {t('chat.agent.tools.common.open', { title: output.entityTitle || input?.name })}
              </a>
            </Button>
          </div>
        ) : status === 'rejected' ? (
          <div className="text-[10.5px] text-muted-foreground text-right">
            {t('chat.agent.tools.common.rejected')}
          </div>
        ) : (status === 'pending' || (state === 'output-available' && hasInput && !output)) ? (
          <div className="flex justify-end gap-1.5 pt-0.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] gap-1"
              disabled={isActing}
              onClick={() => {
                setIsActing(true)
                rejectProposal(toolCallId)
                setIsActing(false)
              }}
            >
              <X className="w-3 h-3" />
              {t('chat.agent.tools.common.reject')}
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-7 text-[11px] gap-1"
              disabled={isActing || !hasInput}
              onClick={async () => {
                if (!input) return
                setIsActing(true)
                try {
                  await acceptCharacterProposal(toolCallId, input)
                } finally {
                  setIsActing(false)
                }
              }}
            >
              {isActing
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <Check className="w-3 h-3" />}
              {t('chat.agent.tools.common.accept')}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
