import type { z } from 'zod'
import { tool } from 'ai'
import { subagentOutputToModelText } from './types'
import {
  runSubagentStream,
  type StreamingSubagentToolConfig,
} from './run-subagent-stream'

export type { StreamingSubagentToolConfig } from './run-subagent-stream'

/**
 * 创建支持流式进度 yield 的 subagent-as-tool（Vercel AI SDK execute 异步生成器）。
 * 主 Agent 通过 toModelOutput 仅看到最终摘要文本。
 */
export function createStreamingSubagentTool<TInput extends Record<string, unknown>>(
  config: StreamingSubagentToolConfig<TInput>,
) {
  const { description, inputSchema } = config

  return tool({
    description,
    inputSchema,
    async* execute(input: TInput, { abortSignal }) {
      yield* runSubagentStream(config, input, abortSignal)
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
