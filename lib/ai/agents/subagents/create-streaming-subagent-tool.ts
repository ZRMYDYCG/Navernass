import type { z } from 'zod'
import type { ToolContext } from '../types'
import type { SubagentStepLog, SubagentToolOutput } from './types'
import { stepCountIs, streamText, tool } from 'ai'
import { getMinimaxModel } from '@/lib/ai/minimax'
import { buildTools } from '../../tools/registry'
import { subagentOutputToModelText } from './types'

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
  /** 按本次 tool 输入增强运行时上下文（如注入 characterId） */
  resolveContext?: (input: TInput, ctx: ToolContext) => ToolContext
  /** 执行前校验；返回错误文案则中止 */
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

/**
 * 创建支持流式进度 yield 的 subagent-as-tool（Vercel AI SDK execute 异步生成器）。
 * 主 Agent 通过 toModelOutput 仅看到最终摘要文本。
 */
export function createStreamingSubagentTool<TInput extends Record<string, unknown>>(
  config: StreamingSubagentToolConfig<TInput>,
) {
  const {
    toolName,
    description,
    inputSchema,
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

  return tool({
    description,
    inputSchema,
    async* execute(input: TInput, { abortSignal }) {
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
    },
    toModelOutput: ({ output }) => ({
      type: 'text' as const,
      value: subagentOutputToModelText(output),
    }),
  })
}

/** 注册到 UI 的 tool type 前缀（tool-deep_research 等） */
export function subagentToolType(name: string) {
  return `tool-${name}` as const
}
