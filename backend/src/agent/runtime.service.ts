import type { EnvConfig } from '../config/env-schema.js'
import type { Prisma } from '../generated/prisma/client.js'
import type { RunAgent, StructuredAgent } from './agent.schema.js'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { generateText, Output, stepCountIs, ToolLoopAgent, toUIMessageStream } from 'ai'
import { z } from 'zod'
import { AppError } from '../common/app-error.js'
import { PrismaService } from '../database/prisma.service.js'
import { ChatService } from './chat.service.js'
import { ContextService } from './context.service.js'
import { ModelService } from './model.service.js'
import { rolePrompts } from './prompt.js'
import { ToolService } from './tool.service.js'
import { TraceService } from './trace.service.js'

const outputSchemas = {
  chapterPlan: z.object({
    title: z.string(),
    goal: z.string(),
    pov: z.string(),
    estimatedWords: z.number().int().positive(),
    beats: z.array(z.object({ order: z.number().int().positive(), event: z.string(), purpose: z.string() })),
    continuityNotes: z.array(z.string()),
  }),
  characterProfile: z.object({
    name: z.string(),
    role: z.string(),
    desire: z.string(),
    fear: z.string(),
    flaw: z.string(),
    arc: z.array(z.string()),
    relationships: z.array(z.object({ character: z.string(), relation: z.string(), tension: z.string() })),
    speechStyle: z.array(z.string()),
  }),
  continuityReview: z.object({
    score: z.number().min(0).max(100),
    summary: z.string(),
    issues: z.array(z.object({
      severity: z.enum(['info', 'warning', 'error']),
      category: z.enum(['plot', 'character', 'world', 'timeline', 'fact', 'style']),
      evidence: z.string(),
      suggestion: z.string(),
    })),
  }),
} as const

export interface AgentResult {
  runId: string
  sessionId: string
  text: string
  usage: { inputTokens?: number, outputTokens?: number, totalTokens?: number }
  finishReason: string
  steps: number
  warnings: string[]
}

export interface StructuredResult {
  runId: string
  sessionId: string
  output: unknown
  usage: { inputTokens?: number, outputTokens?: number, totalTokens?: number }
}

@Injectable()
export class RuntimeService {
  private readonly maxSteps: number
  private readonly timeoutMs: number

  constructor(
    @Inject(ConfigService) config: ConfigService<EnvConfig, true>,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ModelService) private readonly models: ModelService,
    @Inject(ContextService) private readonly contexts: ContextService,
    @Inject(ChatService) private readonly chats: ChatService,
    @Inject(ToolService) private readonly tools: ToolService,
    @Inject(TraceService) private readonly traces: TraceService,
  ) {
    this.maxSteps = config.get('AGENT_MAX_STEPS', { infer: true })
    this.timeoutMs = config.get('AGENT_TIMEOUT_MS', { infer: true })
  }

  async generate(userId: string, input: RunAgent, signal?: AbortSignal): Promise<AgentResult> {
    const execution = await this.prepare(userId, input)
    const started = Date.now()
    await this.traces.startRun(execution.run.id)
    let stepIndex = 0
    try {
      const result = await execution.agent.generate({
        prompt: input.prompt,
        abortSignal: this.signal(signal),
        onStepFinish: async (event) => {
          await this.traces.saveStep(execution.run.id, stepIndex++, event)
        },
      })
      await this.chats.saveAssistant({
        ...execution.messageContext,
        content: result.text,
        parts: [{ type: 'text', text: result.text }],
        metadata: { finishReason: result.finishReason, usage: result.totalUsage },
      })
      await this.traces.finishRun(execution.run.id, {
        output: result.text,
        inputTokens: result.totalUsage.inputTokens ?? 0,
        outputTokens: result.totalUsage.outputTokens ?? 0,
        totalTokens: result.totalUsage.totalTokens ?? 0,
        finishReason: result.finishReason,
        latencyMs: Date.now() - started,
      })
      return {
        runId: execution.run.id,
        sessionId: execution.session.id,
        text: result.text,
        usage: result.totalUsage,
        finishReason: result.finishReason,
        steps: result.steps.length,
        warnings: (result.warnings ?? []).map(warning => JSON.stringify(warning)),
      }
    } catch (error) {
      await this.traces.failRun(execution.run.id, error, Date.now() - started)
      throw error
    }
  }

  async stream(userId: string, input: RunAgent, signal?: AbortSignal) {
    const execution = await this.prepare(userId, input)
    const started = Date.now()
    await this.traces.startRun(execution.run.id)
    let stepIndex = 0
    try {
      const result = await execution.agent.stream({
        prompt: input.prompt,
        abortSignal: this.signal(signal),
        onStepFinish: async (event) => {
          await this.traces.saveStep(execution.run.id, stepIndex++, event)
        },
      })
      const stream = toUIMessageStream({
        stream: result.fullStream,
        tools: execution.tools,
        sendReasoning: false,
        sendSources: true,
        messageMetadata: () => ({ runId: execution.run.id, sessionId: execution.session.id }),
        onError: () => 'Agent 执行失败，请使用 runId 查询服务端执行日志。',
        onEnd: async ({ outcome, finishReason, responseMessage }) => {
          if (outcome.status === 'aborted') {
            await this.traces.cancelRun(execution.run.id, Date.now() - started)
            return
          }
          if (outcome.status === 'failed') {
            await this.traces.failRun(execution.run.id, outcome.error, Date.now() - started)
            return
          }
          const [usage, text] = await Promise.all([result.totalUsage, result.text])
          await this.chats.saveAssistant({
            ...execution.messageContext,
            remoteId: responseMessage.id,
            content: text,
            parts: responseMessage.parts,
            metadata: { finishReason, usage, aiSdkMessageId: responseMessage.id },
          })
          await this.traces.finishRun(execution.run.id, {
            output: text,
            inputTokens: usage.inputTokens ?? 0,
            outputTokens: usage.outputTokens ?? 0,
            totalTokens: usage.totalTokens ?? 0,
            finishReason,
            latencyMs: Date.now() - started,
          })
        },
      })
      return { stream, runId: execution.run.id, sessionId: execution.session.id }
    } catch (error) {
      await this.traces.failRun(execution.run.id, error, Date.now() - started)
      throw error
    }
  }

  async structured(userId: string, input: StructuredAgent, signal?: AbortSignal): Promise<StructuredResult> {
    const execution = await this.prepare(userId, input)
    const started = Date.now()
    await this.traces.startRun(execution.run.id)
    let stepIndex = 0
    try {
      const options = {
        prompt: input.prompt,
        abortSignal: this.signal(signal),
        onStepFinish: async (event: Parameters<NonNullable<Parameters<typeof execution.agent.generate>[0]['onStepFinish']>>[0]) => {
          await this.traces.saveStep(execution.run.id, stepIndex++, event)
        },
      }
      const result = input.outputType === 'chapterPlan'
        ? await generateText({ ...execution.structuredOptions, ...options, output: Output.object({ schema: outputSchemas.chapterPlan, name: 'chapterPlan' }) })
        : input.outputType === 'characterProfile'
          ? await generateText({ ...execution.structuredOptions, ...options, output: Output.object({ schema: outputSchemas.characterProfile, name: 'characterProfile' }) })
          : await generateText({ ...execution.structuredOptions, ...options, output: Output.object({ schema: outputSchemas.continuityReview, name: 'continuityReview' }) })
      const outputText = JSON.stringify(result.output)
      await this.chats.saveAssistant({
        ...execution.messageContext,
        content: outputText,
        parts: [{ type: 'data-structured', data: result.output }],
        metadata: { outputType: input.outputType, finishReason: result.finishReason, usage: result.totalUsage },
      })
      await this.traces.finishRun(execution.run.id, {
        output: outputText,
        inputTokens: result.totalUsage.inputTokens ?? 0,
        outputTokens: result.totalUsage.outputTokens ?? 0,
        totalTokens: result.totalUsage.totalTokens ?? 0,
        finishReason: result.finishReason,
        latencyMs: Date.now() - started,
      })
      return { runId: execution.run.id, sessionId: execution.session.id, output: result.output, usage: result.totalUsage }
    } catch (error) {
      await this.traces.failRun(execution.run.id, error, Date.now() - started)
      throw error
    }
  }

  private async prepare(userId: string, input: RunAgent) {
    const { model, provider } = await this.models.language(userId, input.providerId)
    const currentSession = input.sessionId
      ? await this.prisma.agentSession.findFirst({ where: { id: input.sessionId, user_id: userId, novel_id: input.novelId } })
      : null
    if (input.sessionId && !currentSession) throw AppError.notFound('AGENT_SESSION_NOT_FOUND', 'Agent 会话')
    const history = currentSession ? await this.chats.promptHistory(userId, currentSession.id) : ''
    const context = await this.contexts.build(userId, { ...input, providerId: provider.id })
    const session = currentSession
      ? await this.prisma.agentSession.update({
          where: { id: currentSession.id },
          data: {
            chapter_id: input.chapterId,
            provider_id: provider.id,
            context: input.context as Prisma.InputJsonValue,
          },
        })
      : await this.prisma.agentSession.create({
          data: {
            user_id: userId,
            novel_id: input.novelId,
            chapter_id: input.chapterId,
            provider_id: provider.id,
            title: input.prompt.slice(0, 100),
            context: input.context as Prisma.InputJsonValue,
          },
        })
    const run = await this.traces.createRun({
      session_id: session.id,
      user_id: userId,
      novel_id: input.novelId,
      chapter_id: input.chapterId,
      provider_id: provider.id,
      role: input.role,
      prompt: input.prompt,
      context_snapshot: context as unknown as Prisma.InputJsonValue,
    })
    const messageContext = {
      sessionId: session.id,
      runId: run.id,
      userId,
      novelId: input.novelId,
      chapterId: input.chapterId,
    }
    await this.chats.saveUser({
      ...messageContext,
      content: input.prompt,
      parts: [{ type: 'text', text: input.prompt }],
      metadata: { role: input.role, providerId: provider.id },
    })
    const contextText = this.contexts.toPrompt(context)
    const tools = this.tools.build({ runId: run.id, userId, input: { ...input, providerId: provider.id }, model, contextText })
    const historyText = history
      ? `\n\n以下是同一本小说当前会话的最近聊天记录，请延续其中的目标、约定和上下文：\n${history}`
      : ''
    const instructions = `${rolePrompts[input.role]}\n\n${contextText}${historyText}`
    const stopWhen = stepCountIs(input.maxSteps ?? this.maxSteps)
    const settings = this.generationSettings(provider.settings)
    const agent = new ToolLoopAgent({
      id: `narraverse-${input.role}`,
      model,
      instructions,
      tools,
      stopWhen,
      ...settings,
      temperature: input.temperature ?? settings.temperature,
    })
    return {
      agent,
      tools,
      run,
      session,
      messageContext,
      structuredOptions: {
        model,
        instructions,
        tools,
        stopWhen,
        ...settings,
        temperature: input.temperature ?? settings.temperature,
      },
    }
  }

  private signal(signal?: AbortSignal) {
    const timeout = AbortSignal.timeout(this.timeoutMs)
    return signal ? AbortSignal.any([signal, timeout]) : timeout
  }

  private generationSettings(value: Prisma.JsonValue) {
    const settings = typeof value === 'object' && value && !Array.isArray(value) ? value : {}
    const number = (key: string, min: number, max: number) => {
      const current = key in settings ? settings[key] : undefined
      return typeof current === 'number' && current >= min && current <= max ? current : undefined
    }
    return {
      temperature: number('temperature', 0, 2),
      topP: number('topP', 0, 1),
      presencePenalty: number('presencePenalty', -2, 2),
      frequencyPenalty: number('frequencyPenalty', -2, 2),
      maxOutputTokens: number('maxOutputTokens', 1, 200_000),
    }
  }
}
