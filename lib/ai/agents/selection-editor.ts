import type { ModelMessage, StreamTextOnFinishCallback, ToolSet } from 'ai'
import type { AgentDefinition } from './types'
import type { EditorAction } from '@/prompts/editor'
import { streamText } from 'ai'
import { getMinimaxModel } from '@/lib/ai/minimax'
import { getEditorPrompt } from '@/prompts/editor'
import { registerAgent } from './registry'

/**
 * Selection Editor Agent
 *
 * 编辑器内选区 AI：润色、缩写、续写等纯文本变换。
 * 无工具调用，只输出可直接替换选区的正文。
 */
export const selectionEditorAgent: AgentDefinition = {
  id: 'selection-editor',
  name: '选区编辑',
  description: '对编辑器选中文本进行润色、修正、续写等 inline 变换',
  systemPrompt: '',
  compatibleSkillIds: ['editor-surgical', 'chinese-novel-style'],
}

export interface RunSelectionEditorOptions {
  action: EditorAction
  customPrompt?: string
  modelMessages: ModelMessage[]
  modelId?: string
  onFinish?: StreamTextOnFinishCallback<ToolSet>
}

function getTemperature(action: EditorAction): number {
  return action === 'fix' ? 0.3 : 0.7
}

function getMaxOutputTokens(action: EditorAction): number {
  return action === 'shorter' ? 1000 : 3000
}

export function runSelectionEditorAgent(input: RunSelectionEditorOptions) {
  const { action, customPrompt, modelMessages, modelId, onFinish } = input
  const systemPrompt = getEditorPrompt(action, customPrompt)

  return streamText({
    model: getMinimaxModel(modelId),
    system: systemPrompt,
    messages: modelMessages,
    temperature: getTemperature(action),
    maxOutputTokens: getMaxOutputTokens(action),
    onFinish,
    onError: (error) => {
      console.error('[selection-editor] streamText error:', error)
    },
  })
}

export function registerSelectionEditorAgent() {
  registerAgent(selectionEditorAgent)
}
