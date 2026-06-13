'use client'

import { Check, ChevronDown, Loader2, X } from 'lucide-react'
import { useEffect, useId, useMemo, useState } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import {
  isParallelSubagentToolOutput,
  PARALLEL_SUBAGENT_TOOL_NAME,
  SUBAGENT_LIVE_PREVIEW_MAX_LINES,
  SUBAGENT_STEP_PREVIEW_MAX_CHARS,
  type ParallelSubagentTaskOutput,
  type SubagentToolName,
} from '@/lib/ai/agents/subagents/types'
import { cn } from '@/lib/utils'
import { AguiExpandableContent } from './agui-expandable'
import { translateToolLabel } from './tool-i18n'

type ToolState
  = | 'input-streaming'
    | 'input-available'
    | 'output-available'
    | 'output-error'
    | (string & {})

interface ParallelSubagentToolPartProps {
  novelId: string
  partKey: string
  state: ToolState
  output?: unknown
  errorText?: string
}

const DISPATCHED_SYNC_MAX = 500
const dispatchedCharacterSyncKeys: Set<string> = new Set()

function markDispatched(key: string) {
  if (dispatchedCharacterSyncKeys.size >= DISPATCHED_SYNC_MAX) {
    const first = dispatchedCharacterSyncKeys.values().next().value
    if (first !== undefined) dispatchedCharacterSyncKeys.delete(first)
  }
  dispatchedCharacterSyncKeys.add(key)
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max)}…`
}

function TaskStatusIcon({ status }: { status: ParallelSubagentTaskOutput['status'] }) {
  if (status === 'running') {
    return <Loader2 className="w-2.5 h-2.5 animate-spin text-primary shrink-0" />
  }
  if (status === 'error') {
    return <X className="w-2.5 h-2.5 text-destructive shrink-0" />
  }
  return <Check className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
}

function ParallelTaskCard({ task }: { task: ParallelSubagentTaskOutput }) {
  const { t } = useI18n()
  const taskText = typeof task.input.task === 'string' ? task.input.task : ''
  const characterName = typeof task.input.characterName === 'string'
    ? task.input.characterName
    : ''

  return (
    <div className="rounded border border-border/50 bg-background/50 p-1.5 space-y-1">
      <div className="flex items-center gap-1.5">
        <TaskStatusIcon status={task.status} />
        <span className="font-medium text-foreground/90">
          {t('editor.rightPanel.tools.subagent.parallel.taskLabel', {
            index: task.index,
            kind: translateToolLabel(t, task.kind),
          })}
        </span>
      </div>
      {taskText ? (
        <p className="whitespace-pre-wrap break-words text-muted-foreground">{taskText}</p>
      ) : null}
      {characterName ? (
        <p className="text-muted-foreground">
          {t('editor.rightPanel.tools.subagent.character', { name: characterName })}
        </p>
      ) : null}
      {task.steps && task.steps.length > 0 ? (
        <ol className="space-y-0.5 pl-2 border-l border-border/60">
          {task.steps.map(step => (
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
      ) : null}
      {task.preview && task.status === 'running' ? (
        <p
          className="whitespace-pre-wrap break-words text-foreground/80 overflow-y-auto"
          style={{ maxHeight: `${SUBAGENT_LIVE_PREVIEW_MAX_LINES * 1.25}rem` }}
        >
          {task.preview}
        </p>
      ) : null}
      {task.summary && task.status !== 'running' ? (
        <p className="whitespace-pre-wrap break-words text-foreground/90">{task.summary}</p>
      ) : null}
      {task.error ? (
        <p className="text-destructive">{task.error}</p>
      ) : null}
    </div>
  )
}

export function ParallelSubagentToolPart({
  novelId,
  partKey,
  state,
  output,
  errorText,
}: ParallelSubagentToolPartProps) {
  const { t } = useI18n()
  const contentId = useId()
  const [open, setOpen] = useState(false)

  const isRunning = state !== 'output-available' && state !== 'output-error'
  const isError = state === 'output-error'
  const parsed = useMemo(
    () => (isParallelSubagentToolOutput(output) ? output : null),
    [output],
  )
  const hasError = isError || parsed?.status === 'error'

  useEffect(() => {
    if (hasError) setOpen(true)
  }, [hasError])

  useEffect(() => {
    if (!parsed || parsed.status !== 'done') return
    const timelineTasks = parsed.tasks.filter(
      (task): task is ParallelSubagentTaskOutput & { kind: SubagentToolName } =>
        task.kind === 'delegate_character_timeline' && task.status === 'done',
    )
    if (timelineTasks.length === 0) return
    const syncKey = `${partKey}:timeline-sync`
    if (dispatchedCharacterSyncKeys.has(syncKey)) return
    markDispatched(syncKey)
    window.dispatchEvent(new CustomEvent('novel-characters-changed', {
      detail: { novelId },
    }))
  }, [parsed, novelId, partKey])

  const headerLabelKey = isRunning
    ? 'editor.rightPanel.tools.subagent.parallel.running'
    : hasError
      ? 'editor.rightPanel.tools.subagent.parallel.error'
      : 'editor.rightPanel.tools.subagent.parallel.done'

  const taskCount = parsed?.tasks.length ?? 0

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
          {translateToolLabel(t, PARALLEL_SUBAGENT_TOOL_NAME)}
        </span>
        <span className="ml-auto text-muted-foreground truncate max-w-[45%]">
          {taskCount > 0
            ? t(headerLabelKey, { count: taskCount })
            : t(headerLabelKey, { count: 0 })}
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
          {parsed?.tasks.map(task => (
            <ParallelTaskCard key={task.index} task={task} />
          ))}
          {errorText ? (
            <div className="text-destructive">{errorText}</div>
          ) : null}
        </div>
      </AguiExpandableContent>
    </div>
  )
}
