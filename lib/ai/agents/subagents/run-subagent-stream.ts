import type { z } from 'zod'
import type { ToolContext } from '../types'
import type { SubagentStepLog, SubagentToolOutput } from './types'
import { stepCountIs, streamText } from 'ai'
import { getMinimaxModel } from '@/lib/ai/minimax'
import { buildTools } from '../../tools/registry'

export interface StreamingSubagentToolConfig<TInput extends Record<string, unknown>> {
  toolName: string
  description: string
  inputSchema: z.ZodType<TInput>
  systemPrompt: string | ((input: TInput) => string)
  userMessage: (input: TInput) => string
  toolNames: readonly string[]
  maxSteps: number
  temperature?: number
  ctx: ToolContext
  modelId?: string
  resolveContext?: (input: TInput, ctx: ToolContext) => ToolContext
  validateInput?: (input: TInput, ctx: ToolContext) => string | null
}

function collectStepLog(
  steps: SubagentStepLog[],
  stepNumber: number,
  text: string | undefined,
  toolCalls: { toolName: string }[] | undefined,
) {
  const toolNames = toolCalls?.map(t => t.toolName).filter(Boolean)
  const entry: SubagentStepLog = {
    stepNumber,
    textDelta: text?.trim() || undefined,
    toolNames: toolNames?.length ? toolNames : undefined,
  }
  if (!entry.textDelta && !entry.toolNames) return
  steps.push(entry)
}

function isAbortError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const name = (err as { name?: string }).name
  return name === 'AbortError' || name === 'AI_AbortError'
}

/**
 * 子 Agent 核心执行流（async generator）。
 * 供单工具委派与 parallel 批量工具复用。
 */
export async function* runSubagentStream<TInput extends Record<string, unknown>>(
  config: StreamingSubagentToolConfig<TInput>,
  input: TInput,
  abortSignal?: AbortSignal,
): AsyncGenerator<SubagentToolOutput, string> {
  const {
    systemPrompt,
    userMessage,
    toolNames,
    maxSteps,
    temperature = 0.5,
    ctx,
    modelId,
    resolveContext,
    validateInput,
  } = config

  const steps: SubagentStepLog[] = []
  let stepNumber = 0
  let preview = ''

  const yieldProgress = (patch: Partial<SubagentToolOutput>): SubagentToolOutput => ({
    status: 'running',
    preview,
    steps: [...steps],
    ...patch,
  })

  yield yieldProgress({})

  const validationError = validateInput?.(input, ctx)
  if (validationError) {
    const failed: SubagentToolOutput = {
      status: 'error',
      error: validationError,
      steps,
    }
    yield failed
    return validationError
  }

  try {
    const runtimeCtx = resolveContext ? resolveContext(input, ctx) : ctx
    const tools = buildTools([...toolNames], runtimeCtx)
    const system = typeof systemPrompt === 'function'
      ? systemPrompt(input)
      : systemPrompt

    const result = streamText({
      model: getMinimaxModel(modelId),
      system,
      messages: [{ role: 'user', content: userMessage(input) }],
      tools,
      temperature,
      stopWhen: stepCountIs(maxSteps),
      abortSignal,
      onStepFinish: ({ text, toolCalls }) => {
        stepNumber += 1
        collectStepLog(steps, stepNumber, text, toolCalls as { toolName: string }[] | undefined)
      },
    })

    for await (const chunk of result.textStream) {
      preview += chunk
      yield yieldProgress({ preview })
    }

    const summary = (await result.text).trim() || preview.trim()
    const done: SubagentToolOutput = {
      status: 'done',
      summary,
      preview: summary,
      steps,
    }
    yield done
    return summary
  } catch (e) {
    if (isAbortError(e)) {
      const aborted: SubagentToolOutput = {
        status: 'error',
        error: '已取消',
        steps,
        preview,
      }
      yield aborted
      return aborted.error ?? '已取消'
    }
    const message = e instanceof Error ? e.message : String(e)
    const failed: SubagentToolOutput = {
      status: 'error',
      error: message,
      steps,
      preview,
    }
    yield failed
    return message
  }
}

/** 消费子 Agent 流并在每次 yield 时回调（供 Promise.all 并行编排使用） */
export async function consumeSubagentStream(
  stream: AsyncGenerator<SubagentToolOutput, string>,
  onProgress: (output: SubagentToolOutput) => void,
): Promise<{ summary: string, lastOutput: SubagentToolOutput }> {
  let lastOutput: SubagentToolOutput = { status: 'running' }
  while (true) {
    const { value, done } = await stream.next()
    if (done) {
      return { summary: value, lastOutput }
    }
    lastOutput = value
    onProgress(value)
  }
}
