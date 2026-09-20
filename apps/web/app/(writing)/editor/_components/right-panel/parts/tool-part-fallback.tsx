'use client'

import type { ToolUIPart } from 'ai'
import { Check, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { AguiExpandableContent, AguiExpandChevron } from './agui-expandable'
import { translateToolLabel, translateToolState } from './tool-i18n'

/**
 * Tool 调用的视觉壳：通用 collapsible 容器，标题 + 状态图标
 */
export function ToolPartFallback({ part }: { part: ToolUIPart }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const toolName = part.type.replace(/^tool-/, '')
  const state = part.state

  return (
    <div className="rounded-md border border-border/60 bg-muted/30 text-[11px] text-foreground/80 my-1 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent/50 transition-colors cursor-pointer"
      >
        <ToolStateIcon state={state} />
        <span className="font-medium">
          {translateToolLabel(t, toolName)}
        </span>
        <span className="ml-auto text-muted-foreground">{translateToolState(t, state)}</span>
        <AguiExpandChevron open={open} className="text-muted-foreground" />
      </button>
      <AguiExpandableContent open={open}>
        <div className="border-t border-border/50 px-2 py-1.5 space-y-1.5 text-[10px]">
          {'input' in part && part.input ? (
            <div>
              <div className="text-muted-foreground mb-0.5">{t('editor.rightPanel.tools.fallback.input')}</div>
              <pre className="whitespace-pre-wrap break-all">{JSON.stringify(part.input, null, 2)}</pre>
            </div>
          ) : null}
          {'output' in part && part.output !== undefined ? (
            <div>
              <div className="text-muted-foreground mb-0.5">{t('editor.rightPanel.tools.fallback.output')}</div>
              <pre className="whitespace-pre-wrap break-all">{JSON.stringify(part.output, null, 2)}</pre>
            </div>
          ) : null}
          {'errorText' in part && part.errorText ? (
            <div className="text-destructive">{part.errorText}</div>
          ) : null}
        </div>
      </AguiExpandableContent>
    </div>
  )
}

function ToolStateIcon({ state }: { state: ToolUIPart['state'] }) {
  if (state === 'input-streaming' || state === 'input-available') {
    return <Loader2 className={cn('w-3 h-3 animate-spin text-muted-foreground')} />
  }
  if (state === 'output-error') {
    return <X className="w-3 h-3 text-destructive" />
  }
  if (state === 'output-available') {
    return <Check className="w-3 h-3 text-emerald-500" />
  }
  return <Loader2 className={cn('w-3 h-3 text-muted-foreground')} />
}
