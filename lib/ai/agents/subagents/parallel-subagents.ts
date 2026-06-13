import type { ToolContext } from '../types'
import { z } from 'zod'
import { tool } from 'ai'
import { getCharacterTimelineSubagentConfig } from './character-timeline'
import { getDeepResearchSubagentConfig } from './deep-research'
import { consumeSubagentStream, runSubagentStream } from './run-subagent-stream'
import {
  MAX_PARALLEL_SUBAGENT_TASKS,
  PARALLEL_SUBAGENT_TOOL_NAME,
  parallelSubagentOutputToModelText,
  type ParallelSubagentTaskOutput,
  type ParallelSubagentToolOutput,
  type SubagentToolOutput,
} from './types'

export { MAX_PARALLEL_SUBAGENT_TASKS, PARALLEL_SUBAGENT_TOOL_NAME }

const parallelTaskSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('deep_research'),
    task: z.string().describe('调研任务说明'),
  }),
  z.object({
    kind: z.literal('delegate_character_timeline'),
    task: z.string().describe('角色时间线任务说明'),
    characterId: z.string().uuid().optional().describe('角色 id；对话已 @ 角色时可省略'),
    characterName: z.string().optional().describe('角色名称（便于子助手理解）'),
  }),
])

export type ParallelSubagentTaskInput = z.infer<typeof parallelTaskSchema>

const parallelInputSchema = z.object({
  tasks: z
    .array(parallelTaskSchema)
    .min(2)
    .max(MAX_PARALLEL_SUBAGENT_TASKS)
    .describe(
      '2–4 个互不依赖的子 Agent 任务；将并行执行。'
      + '例如同时调研第三卷设定 + 维护 @ 角色时间线。',
    ),
})

const PARALLEL_POLL_MS = 120

function taskInputFromKind(task: ParallelSubagentTaskInput): Record<string, unknown> {
  if (task.kind === 'deep_research') {
    return { task: task.task }
  }
  return {
    task: task.task,
    characterId: task.characterId,
    characterName: task.characterName,
  }
}

function mergeTaskProgress(
  slot: ParallelSubagentTaskOutput,
  output: SubagentToolOutput,
): ParallelSubagentTaskOutput {
  return {
    ...slot,
    status: output.status,
    preview: output.preview,
    summary: output.summary,
    steps: output.steps,
    error: output.error,
  }
}

function aggregateStatus(tasks: ParallelSubagentTaskOutput[]): ParallelSubagentToolOutput['status'] {
  if (tasks.some(t => t.status === 'running')) return 'running'
  if (tasks.every(t => t.status === 'done')) return 'done'
  if (tasks.some(t => t.status === 'error')) return 'error'
  return 'running'
}

function buildParallelOutput(tasks: ParallelSubagentTaskOutput[]): ParallelSubagentToolOutput {
  return {
    status: aggregateStatus(tasks),
    tasks: tasks.map(t => ({ ...t })),
  }
}

function wait(ms: number, abortSignal?: AbortSignal): Promise<'timeout' | 'aborted'> {
  return new Promise((resolve) => {
    if (abortSignal?.aborted) {
      resolve('aborted')
      return
    }
    const timer = setTimeout(() => resolve('timeout'), ms)
    abortSignal?.addEventListener('abort', () => {
      clearTimeout(timer)
      resolve('aborted')
    }, { once: true })
  })
}

export function createParallelSubagentsTool(ctx: ToolContext, modelId?: string) {
  return tool({
    description:
      '并行委派多个子 Agent（Promise.all）。当本回合有 2 个及以上互不依赖的调研/时间线任务时使用；'
      + '比分别调用 deep_research / delegate_character_timeline 更快。'
      + '任务之间不得有先后依赖（例如「先调研再改时间线」应分两步调用）。',
    inputSchema: parallelInputSchema,
    async* execute(input, { abortSignal }) {
      const slots: ParallelSubagentTaskOutput[] = input.tasks.map((task, index) => ({
        index: index + 1,
        kind: task.kind,
        input: taskInputFromKind(task),
        status: 'running',
      }))

      let revision = 0
      let lastYieldedRevision = -1

      const notify = () => {
        revision += 1
      }

      const runners = input.tasks.map(async (task, i) => {
        const onProgress = (output: SubagentToolOutput) => {
          slots[i] = mergeTaskProgress(slots[i], output)
          notify()
        }

        let lastOutput: SubagentToolOutput = { status: 'running' }

        if (task.kind === 'deep_research') {
          const config = getDeepResearchSubagentConfig(ctx, modelId)
          const result = await consumeSubagentStream(
            runSubagentStream(config, { task: task.task }, abortSignal),
            onProgress,
          )
          lastOutput = result.lastOutput
        } else {
          const config = getCharacterTimelineSubagentConfig(ctx, modelId)
          const result = await consumeSubagentStream(
            runSubagentStream(config, {
              task: task.task,
              characterId: task.characterId,
              characterName: task.characterName,
            }, abortSignal),
            onProgress,
          )
          lastOutput = result.lastOutput
        }

        slots[i] = mergeTaskProgress(slots[i], lastOutput)
        notify()
        return lastOutput.summary ?? lastOutput.preview ?? ''
      })

      const allDone = Promise.all(runners)

      yield buildParallelOutput(slots)

      while (true) {
        const race = await Promise.race([
          allDone.then(() => 'done' as const),
          wait(PARALLEL_POLL_MS, abortSignal),
        ])

        if (revision !== lastYieldedRevision) {
          lastYieldedRevision = revision
          yield buildParallelOutput(slots)
        }

        if (race === 'done' || race === 'aborted') break
      }

      await allDone.catch(() => undefined)

      const finalOutput = buildParallelOutput(slots)
      yield finalOutput

      return parallelSubagentOutputToModelText(finalOutput)
    },
    toModelOutput: ({ output }) => ({
      type: 'text' as const,
      value: parallelSubagentOutputToModelText(output),
    }),
  })
}
