import type { TFunction } from 'i18next'
import type { AutoWriteToolName } from './auto-write-tool-part'

const TOOL_STATE_KEYS: Record<string, string> = {
  'input-streaming': 'editor.rightPanel.tools.state.inputStreaming',
  'input-available': 'editor.rightPanel.tools.state.inputAvailable',
  'output-available': 'editor.rightPanel.tools.state.outputAvailable',
  'output-error': 'editor.rightPanel.tools.state.outputError',
}

export function translateToolState(t: TFunction, state: string): string {
  const key = TOOL_STATE_KEYS[state]
  return key ? t(key) : state
}

export function translateToolLabel(t: TFunction, toolName: AutoWriteToolName | string): string {
  const key = `editor.rightPanel.tools.labels.${toolName}`
  const translated = t(key)
  return translated === key ? toolName : translated
}

export function translateToolSuccess(
  t: TFunction,
  toolName: AutoWriteToolName,
  output: Record<string, any>,
): string {
  const title = output.title
    ?? output.chapter_title
    ?? output.volume_title
    ?? ''
  const count = output.new_word_count ?? 0
  return t(`editor.rightPanel.tools.success.${toolName}`, { title, count })
}
