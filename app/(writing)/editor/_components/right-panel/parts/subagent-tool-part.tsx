'use client'

import { Check, Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import { isSubagentToolOutput } from '@/lib/ai/agents/subagents/types'
import { cn } from '@/lib/utils'
import { AguiExpandableContent, AguiExpandChevron } from './agui-expandable'
import { translateToolLabel } from './tool-i18n'

const SUBAGENT_TOOL_NAMES = new Set(['deep_research', 'delegate_character_timeline'])

export function isSubagentToolName(name: string): boolean {
  return SUBAGENT_TOOL_NAMES.has(name)
}

const dispatchedCharacterSyncKeys = new Set<string>()

interface SubagentToolPartProps {
  novelId: string
  partKey: string
  toolName: string
  state: string
  input?: Record<string, unknown>
  output?: unknown
  errorText?: string
}

export function SubagentToolPart({
  novelId,
  partKey,
  toolName,
  state,
  input,
  output,
  errorText,
}: SubagentToolPartProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)

  const isRunning = state !== 'output-available' && state !== 'output-error'
  const isError = state === 'output-error'
  const parsed = isSubagentToolOutput(output) ? output : null

  useEffect(() => {
    if (toolName !== 'delegate_character_timeline') return
    if (state !== 'output-available') return
    if (!parsed || parsed.status !== 'done') return
    if (dispatchedCharacterSyncKeys.has(partKey)) return
    dispatchedCharacterSyncKeys.add(partKey)

    window.dispatchEvent(new CustomEvent('novel-characters-changed', {
      detail: { novelId },
    }))
  }, [toolName, state, parsed, novelId, partKey])
  const task = typeof input?.task === 'string' ? input.task : ''
  const characterName = typeof input?.characterName === 'string' ? input.characterName : ''

  return (
    <div className="rounded-md border border-border/60 bg-muted/30 text-[11px] text-foreground/80 my-1 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent/50 transition-colors cursor-pointer"
      >
        {isRunning ? (
          <Loader2 className="w-3 h-3 animate-spin text-primary shrink-0" />
        ) : isError || parsed?.status === 'error' ? (
          <X className="w-3 h-3 text-destructive shrink-0" />
        ) : (
          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
        )}
        <span className="font-medium text-left">
          {translateToolLabel(t, toolName)}
        </span>
        <span className="ml-auto text-muted-foreground truncate max-w-[45%]">
          {isRunning
            ? t('editor.rightPanel.tools.subagent.running')
            : t('editor.rightPanel.tools.subagent.done')}
        </span>
        <AguiExpandChevron open={open} className="text-muted-foreground shrink-0" />
      </button>
      <AguiExpandableContent open={open}>
        <div className="border-t border-border/50 px-2 py-1.5 space-y-2 text-[10px]">
          {task ? (
            <div>
              <div className="text-muted-foreground mb-0.5">
                {t('editor.rightPanel.tools.subagent.task')}
              </div>
              <p className="whitespace-pre-wrap break-words">{task}</p>
            </div>
          ) : null}
          {characterName ? (
            <div className="text-muted-foreground">
              {t('editor.rightPanel.tools.subagent.character', { name: characterName })}
            </div>
          ) : null}
          {parsed?.steps && parsed.steps.length > 0 ? (
            <div>
              <div className="text-muted-foreground mb-0.5">
                {t('editor.rightPanel.tools.subagent.steps')}
              </div>
              <ul className="space-y-0.5 pl-2 border-l border-border/60">
                {parsed.steps.map(step => (
                  <li key={step.stepNumber} className="text-muted-foreground">
                    <span className="text-foreground/70">
                      #
                      {step.stepNumber}
                    </span>
                    {step.toolNames?.length ? (
                      <span className="ml-1 font-mono text-[9px]">
                        {step.toolNames.join(', ')}
                      </span>
                    ) : null}
                    {step.textDelta ? (
                      <span className={cn('block text-foreground/80 mt-0.5')}>
                        {step.textDelta.slice(0, 120)}
                        {step.textDelta.length > 120 ? '…' : ''}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {parsed?.preview && isRunning ? (
            <div>
              <div className="text-muted-foreground mb-0.5">
                {t('editor.rightPanel.tools.subagent.preview')}
              </div>
              <p className="whitespace-pre-wrap break-words text-foreground/80 max-h-32 overflow-y-auto">
                {parsed.preview}
              </p>
            </div>
          ) : null}
          {parsed?.summary && !isRunning ? (
            <div>
              <div className="text-muted-foreground mb-0.5">
                {t('editor.rightPanel.tools.subagent.summary')}
              </div>
              <p className="whitespace-pre-wrap break-words text-foreground/90">
                {parsed.summary}
              </p>
            </div>
          ) : null}
          {errorText || parsed?.error ? (
            <div className="text-destructive">{errorText || parsed?.error}</div>
          ) : null}
        </div>
      </AguiExpandableContent>
    </div>
  )
}
