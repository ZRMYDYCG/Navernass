'use client'

import { Check, ChevronDown, Copy, Loader2, X } from 'lucide-react'
import { useEffect, useId, useMemo, useState } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import {
  isSubagentToolOutput,
  isSubagentToolName,
  SUBAGENT_LIVE_PREVIEW_MAX_LINES,
  SUBAGENT_STEP_PREVIEW_MAX_CHARS,
  type SubagentToolName,
} from '@/lib/ai/agents/subagents/types'
import { cn } from '@/lib/utils'
import { AguiExpandableContent } from './agui-expandable'
import { translateToolLabel } from './tool-i18n'

/**
 * Tool part 状态（与 Vercel AI SDK UIMessagePart 对齐）。
 * 仅取与渲染相关的子集。
 */
type ToolState
  = | 'input-streaming'
    | 'input-available'
    | 'output-available'
    | 'output-error'
    | (string & {})

interface SubagentToolPartProps {
  novelId: string
  partKey: string
  toolName: SubagentToolName | string
  state: ToolState
  input?: Record<string, unknown>
  output?: unknown
  errorText?: string
}

/**
 * 已被本组件派发过 "角色时间线已同步" 副作用的 partKey 集合。
 * Module 级 Set：组件卸载/重挂载/历史回填都不会重复触发。
 * 加上大小上限避免长会话无界增长。
 */
const DISPATCHED_SYNC_MAX = 500
const dispatchedCharacterSyncKeys: Set<string> = new Set()
function markDispatched(key: string) {
  if (dispatchedCharacterSyncKeys.size >= DISPATCHED_SYNC_MAX) {
    // 简单 FIFO：清掉最早插入的元素（Set 保插入序）
    const first = dispatchedCharacterSyncKeys.values().next().value
    if (first !== undefined) dispatchedCharacterSyncKeys.delete(first)
  }
  dispatchedCharacterSyncKeys.add(key)
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max)}…`
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
  const contentId = useId()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const isRunning = state !== 'output-available' && state !== 'output-error'
  const isError = state === 'output-error'
  const parsed = useMemo(
    () => (isSubagentToolOutput(output) ? output : null),
    [output],
  )
  const isParsedError = parsed?.status === 'error'
  const hasError = isError || isParsedError

  // 错误状态默认展开，方便用户看到错误信息
  useEffect(() => {
    if (hasError) setOpen(true)
  }, [hasError])

  useEffect(() => {
    if (toolName !== 'delegate_character_timeline') return
    if (state !== 'output-available') return
    if (!parsed || parsed.status !== 'done') return
    if (dispatchedCharacterSyncKeys.has(partKey)) return
    markDispatched(partKey)

    window.dispatchEvent(new CustomEvent('novel-characters-changed', {
      detail: { novelId },
    }))
  }, [toolName, state, parsed, novelId, partKey])

  const task = typeof input?.task === 'string' ? input.task : ''
  const characterName = typeof input?.characterName === 'string' ? input.characterName : ''

  const handleCopy = async () => {
    const text = parsed?.summary || parsed?.preview
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // 静默失败：剪贴板不可用时不打扰用户
    }
  }

  const showCopy = Boolean(parsed?.summary || parsed?.preview) && !isRunning
  const headerLabelKey = isRunning
    ? 'editor.rightPanel.tools.subagent.running'
    : hasError
      ? 'editor.rightPanel.tools.subagent.error'
      : 'editor.rightPanel.tools.subagent.done'

  return (
    <div className="rounded-md border border-border/60 bg-muted/30 text-[11px] text-foreground/80 my-1 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={contentId}
        className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent/50 transition-colors cursor-pointer"
      >
        {isRunning ? (
          <Loader2 className="w-3 h-3 animate-spin text-primary shrink-0" />
        ) : hasError ? (
          <X className="w-3 h-3 text-destructive shrink-0" />
        ) : (
          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
        )}
        <span className="font-medium text-left">
          {translateToolLabel(t, toolName)}
        </span>
        <span className="ml-auto text-muted-foreground truncate max-w-[45%]">
          {t(headerLabelKey)}
        </span>
        <ChevronDown
          className={cn(
            'w-3 h-3 shrink-0 text-muted-foreground transition-transform duration-200 ease-out',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>
      <AguiExpandableContent open={open}>
        <div
          id={contentId}
          className="border-t border-border/50 px-2 py-1.5 space-y-2 text-[10px]"
        >
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
              <ol className="space-y-0.5 pl-2 border-l border-border/60">
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
                      <span className="block text-foreground/80 mt-0.5">
                        {truncate(step.textDelta, SUBAGENT_STEP_PREVIEW_MAX_CHARS)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
          {parsed?.preview && isRunning ? (
            <div role="status" aria-live="polite">
              <div className="text-muted-foreground mb-0.5">
                {t('editor.rightPanel.tools.subagent.preview')}
              </div>
              <p
                className="whitespace-pre-wrap break-words text-foreground/80 overflow-y-auto"
                style={{ maxHeight: `${SUBAGENT_LIVE_PREVIEW_MAX_LINES * 1.25}rem` }}
              >
                {parsed.preview}
              </p>
            </div>
          ) : null}
          {parsed?.summary && !isRunning ? (
            <div>
              <div className="text-muted-foreground mb-0.5 flex items-center gap-1.5">
                <span>{t('editor.rightPanel.tools.subagent.summary')}</span>
                {showCopy ? (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="ml-auto inline-flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label={t('editor.rightPanel.tools.subagent.copy')}
                  >
                    {copied ? (
                      <Check className="w-2.5 h-2.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-2.5 h-2.5" />
                    )}
                    <span>{copied
                      ? t('editor.rightPanel.tools.subagent.copied')
                      : t('editor.rightPanel.tools.subagent.copy')}</span>
                  </button>
                ) : null}
              </div>
              <p className="whitespace-pre-wrap break-words text-foreground/90">
                {parsed.summary}
              </p>
            </div>
          ) : null}
          {errorText || parsed?.error ? (
            <div className="text-destructive">
              {errorText || parsed?.error}
            </div>
          ) : null}
        </div>
      </AguiExpandableContent>
    </div>
  )
}

/** Re-export for other modules (registry) to keep a single source of truth. */
export { isSubagentToolName }
