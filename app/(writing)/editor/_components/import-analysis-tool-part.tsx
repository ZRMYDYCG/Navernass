'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useCharacterGraphStore, useCharacterMaterialStore } from '@/store'

export type ImportAnalysisToolName =
  | 'report_analysis_step'
  | 'list_characters'
  | 'create_character'
  | 'create_relationship'

const IMPORT_TOOL_NAMES = new Set([
  'report_analysis_step',
  'list_characters',
  'create_character',
  'create_relationship',
])

export function isImportToolPart(part: { type?: string }): boolean {
  if (typeof part?.type !== 'string' || !part.type.startsWith('tool-')) return false
  return IMPORT_TOOL_NAMES.has(part.type.replace(/^tool-/, ''))
}

interface ImportAnalysisToolPartProps {
  partKey: string
  novelId: string
  toolName: ImportAnalysisToolName
  state: string
  input?: Record<string, any>
  output?: any
  errorText?: string
  variant?: 'terminal' | 'card'
}

const processedKeys = new Set<string>()

const STEP_LABELS: Record<string, string> = {
  reading: 'reading',
  identifying: 'identifying',
  creating_characters: 'creating',
  analyzing_relationships: 'relations',
  complete: 'complete',
}

export function ImportAnalysisToolPart({
  partKey,
  novelId,
  toolName,
  state,
  input,
  output,
  errorText,
  variant = 'terminal',
}: ImportAnalysisToolPartProps) {
  const upsertCharacter = useCharacterMaterialStore(s => s.upsertCharacter)
  const createRelationship = useCharacterGraphStore(s => s.createRelationship)

  useEffect(() => {
    if (state !== 'output-available') return
    if (processedKeys.has(partKey)) return
    processedKeys.add(partKey)

    if (!output?.ok) {
      if (toolName === 'create_character' || toolName === 'create_relationship') {
        toast.error(`${toolName} failed`, { description: output?.error || errorText })
      }
      return
    }

    switch (toolName) {
      case 'create_character':
        if (output.character && !output.skipped) {
          upsertCharacter(output.character)
          window.dispatchEvent(new CustomEvent('novel-characters-changed', {
            detail: { novelId: output.character.novel_id || novelId },
          }))
        }
        break
      case 'create_relationship':
        if (output.relationship && !output.skipped) {
          createRelationship({
            novel_id: output.relationship.novel_id,
            sourceId: output.relationship.sourceId,
            targetId: output.relationship.targetId,
            sourceToTargetLabel: output.relationship.sourceToTargetLabel,
            targetToSourceLabel: output.relationship.targetToSourceLabel,
            note: output.relationship.note,
          }).catch(err => console.error('Failed to sync relationship:', err))
        }
        break
    }
  }, [partKey, state, output, toolName, errorText, novelId, upsertCharacter, createRelationship])

  if (variant === 'terminal') {
    return (
      <TerminalToolLines
        toolName={toolName}
        state={state}
        input={input}
        output={output}
        errorText={errorText}
      />
    )
  }

  return null
}

function TerminalToolLines({
  toolName,
  state,
  input,
  output,
  errorText,
}: {
  toolName: ImportAnalysisToolName
  state: string
  input?: Record<string, any>
  output?: any
  errorText?: string
}) {
  const isRunning = state !== 'output-available' && state !== 'output-error'
  const isError = state === 'output-error' || (output && !output.ok)

  if (toolName === 'report_analysis_step') {
    const step = output?.step || input?.step || 'reading'
    const title = output?.title || input?.title || STEP_LABELS[step] || step
    const detail = output?.detail || input?.detail || ''
    const prefix = isRunning ? '>' : isError ? '✗' : '✓'

    return (
      <div className="space-y-0.5">
        <Line prefix={prefix} className={cn(
          isRunning && 'text-primary',
          !isRunning && !isError && 'text-chart-2',
          isError && 'text-destructive',
        )}
        >
          [{STEP_LABELS[step] || step}] {title}
          {isRunning && <Cursor />}
        </Line>
        {detail && detail.split('\n').map((line: string, i: number) => (
          <Line key={i} prefix=" " className="text-muted-foreground pl-2">
            {line}
          </Line>
        ))}
        {errorText && <Line prefix="✗" className="text-destructive">{errorText}</Line>}
      </div>
    )
  }

  const cmd = formatCommand(toolName, input)

  return (
    <div className="space-y-0.5">
      <Line prefix="$" className="text-muted-foreground">
        {cmd}
        {isRunning && <Cursor />}
      </Line>
      {isRunning && (
        <Line prefix=" " className="text-muted-foreground/60 pl-2">…</Line>
      )}
      {state === 'output-available' && output?.ok && (
        <Line prefix=" " className="text-chart-2 pl-2">
          {formatSuccess(toolName, output, input)}
        </Line>
      )}
      {isError && (
        <Line prefix=" " className="text-destructive pl-2">
          {output?.error || errorText || 'failed'}
        </Line>
      )}
    </div>
  )
}

function Line({
  prefix,
  children,
  className,
}: {
  prefix: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex gap-2 whitespace-pre-wrap break-words', className)}>
      <span className="shrink-0 select-none w-3 text-muted-foreground/60">{prefix}</span>
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  )
}

function Cursor() {
  return (
    <span className="inline-block w-[6px] h-[12px] ml-0.5 bg-current/50 animate-pulse align-middle" />
  )
}

function formatCommand(toolName: ImportAnalysisToolName, input?: Record<string, any>): string {
  switch (toolName) {
    case 'list_characters':
      return 'list_characters'
    case 'create_character':
      return `create_character --name="${input?.name || '?'}"${input?.role ? ` --role=${input.role}` : ''}`
    case 'create_relationship':
      return `create_relationship --${input?.sourceToTargetLabel || '?'}↔${input?.targetToSourceLabel || '?'}`
    default:
      return toolName
  }
}

function formatSuccess(toolName: ImportAnalysisToolName, output: any, input?: Record<string, any>): string {
  switch (toolName) {
    case 'list_characters':
      return `ok (${output.count ?? 0} existing)`
    case 'create_character':
      if (output.skipped) return `skip "${output.name}" (exists)`
      return `ok created "${output.name}"${output.role ? ` [${output.role}]` : ''}`
    case 'create_relationship':
      if (output.skipped) return 'skip (exists)'
      return `ok ${input?.sourceToTargetLabel || output.sourceToTargetLabel} ↔ ${input?.targetToSourceLabel || output.targetToSourceLabel}`
    default:
      return 'ok'
  }
}
