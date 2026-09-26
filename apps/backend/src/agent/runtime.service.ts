import type { EnvConfig } from "../config/env-schema.js";
import type { Prisma } from "../generated/prisma/client.js";
import { runAgent, type RunAgent, type StructuredAgent } from "./agent.schema.js";
import { randomUUID } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { generateText, Output, stepCountIs, ToolLoopAgent, toUIMessageStream } from "ai";
import { z } from "zod";
import { AppError } from "../common/app-error.js";
import { PrismaService } from "../database/prisma.service.js";
import { SkillResolver } from "../skill/skill.resolver.js";
import { ChatService } from "./chat.service.js";
import { ContextService } from "./context.service.js";
import { AgentErrorService } from "./error.service.js";
import { ModelService } from "./model.service.js";
import { rolePrompts } from "./prompt.js";
import { StreamService } from "./stream.service.js";
import { ToolService } from "./tool.service.js";
import { TraceService } from "./trace.service.js";

const outputSchemas = {
  chapterPlan: z.object({
    title: z.string(),
    goal: z.string(),
    pov: z.string(),
    estimatedWords: z.number().int().positive(),
    beats: z.array(
      z.object({ order: z.number().int().positive(), event: z.string(), purpose: z.string() }),
    ),
    continuityNotes: z.array(z.string()),
  }),
  characterProfile: z.object({
    name: z.string(),
    role: z.string(),
    desire: z.string(),
    fear: z.string(),
    flaw: z.string(),
    arc: z.array(z.string()),
    relationships: z.array(
      z.object({ character: z.string(), relation: z.string(), tension: z.string() }),
    ),
    speechStyle: z.array(z.string()),
  }),
  continuityReview: z.object({
    score: z.number().min(0).max(100),
    summary: z.string(),
    issues: z.array(
      z.object({
        severity: z.enum(["info", "warning", "error"]),
        category: z.enum(["plot", "character", "world", "timeline", "fact", "style"]),
        evidence: z.string(),
        suggestion: z.string(),
      }),
    ),
  }),
} as const;

export interface AgentResult {
  runId: string;
  sessionId: string;
  text: string;
  usage: { inputTokens?: number; outputTokens?: number; totalTokens?: number };
  finishReason: string;
  steps: number;
  warnings: string[];
  skillIds: string[];
}

export interface StructuredResult {
  runId: string;
  sessionId: string;
  output: unknown;
  usage: { inputTokens?: number; outputTokens?: number; totalTokens?: number };
  skillIds: string[];
  contextBudget: Awaited<ReturnType<ContextService["build"]>>["budget"];
  contextWarnings: string[];
}

@Injectable()
export class RuntimeService {
  private readonly maxSteps: number;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(
    @Inject(ConfigService) config: ConfigService<EnvConfig, true>,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ModelService) private readonly models: ModelService,
    @Inject(ContextService) private readonly contexts: ContextService,
    @Inject(ChatService) private readonly chats: ChatService,
    @Inject(ToolService) private readonly tools: ToolService,
    @Inject(TraceService) private readonly traces: TraceService,
    @Inject(StreamService) private readonly streams: StreamService,
    @Inject(SkillResolver) private readonly skills: SkillResolver,
    @Inject(AgentErrorService) private readonly errors: AgentErrorService,
  ) {
    this.maxSteps = config.get("AGENT_MAX_STEPS", { infer: true });
    this.timeoutMs = config.get("AGENT_TIMEOUT_MS", { infer: true });
    this.maxRetries = config.get("AGENT_MAX_RETRIES", { infer: true });
  }

  async generate(userId: string, input: RunAgent, signal?: AbortSignal): Promise<AgentResult> {
    const execution = await this.prepare(userId, input);
    const started = Date.now();
    await this.traces.startRun(execution.run.id);
    let stepIndex = 0;
    try {
      const result = await execution.agent.generate({
        prompt: input.prompt,
        abortSignal: this.signal(signal),
        onStepFinish: async (event) => {
          await this.traces.saveStep(execution.run.id, stepIndex++, event);
        },
      });
      await this.chats.saveAssistant({
        ...execution.messageContext,
        content: result.text,
        parts: [{ type: "text", text: result.text }],
        metadata: { finishReason: result.finishReason, usage: result.totalUsage },
      });
      await this.traces.finishRun(execution.run.id, {
        output: result.text,
        inputTokens: result.totalUsage.inputTokens ?? 0,
        outputTokens: result.totalUsage.outputTokens ?? 0,
        totalTokens: result.totalUsage.totalTokens ?? 0,
        finishReason: result.finishReason,
        latencyMs: Date.now() - started,
      });
      return {
        runId: execution.run.id,
        sessionId: execution.session.id,
        text: result.text,
        usage: result.totalUsage,
        finishReason: result.finishReason,
        steps: result.steps.length,
        warnings: [
          ...execution.context.warnings,
          ...(result.warnings ?? []).map((warning) => JSON.stringify(warning)),
        ],
        skillIds: execution.skillSet.ids,
      };
    } catch (error) {
      const failure = this.errors.toAppError(error);
      await this.traces.failRun(execution.run.id, failure, Date.now() - started);
      throw failure;
    }
  }

  async stream(userId: string, input: RunAgent) {
    if (input.requestId) {
      const existing = await this.findByRequestId(userId, input.requestId);
      if (existing?.session_id) return this.toReplayResult(userId, existing.id);
    }
    try {
      return await this.startStream(userId, input);
    } catch (error) {
      // 并发同 requestId 时后到的请求重放已创建的 Run，保持幂等。
      if (input.requestId && this.isRequestIdConflict(error)) {
        const existing = await this.findByRequestId(userId, input.requestId);
        if (existing?.session_id) return this.toReplayResult(userId, existing.id);
      }
      throw error;
    }
  }

  async retryStream(userId: string, runId: string, requestId?: string) {
    const previous = await this.prisma.agentRun.findFirst({
      where: { id: runId, user_id: userId },
    });
    if (!previous) throw AppError.notFound("AGENT_RUN_NOT_FOUND", "Agent 执行记录");
    if (!(["failed", "cancelled"] as string[]).includes(previous.status)) {
      throw new AppError("CONFLICT", "只有失败或已取消的执行可以重试", 409, {
        status: previous.status,
      });
    }
    if (!previous.request_snapshot)
      throw new AppError("CONFLICT", "该历史执行缺少请求快照，无法安全重试", 409);
    const snapshot = previous.request_snapshot;
    if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot))
      throw new AppError("CONFLICT", "该历史执行的请求快照无效，无法安全重试", 409);
    const input = runAgent.parse({
      ...snapshot,
      requestId: requestId ?? randomUUID(),
      sessionId: previous.session_id ?? undefined,
    });
    return this.startStream(userId, input, previous.id);
  }

  async replayStream(userId: string, runId: string, after = 0) {
    return this.toReplayResult(userId, runId, after);
  }

  private async startStream(userId: string, input: RunAgent, retryOfId?: string) {
    const execution = await this.prepare(userId, input, retryOfId);
    await this.traces.startRun(execution.run.id);
    // 可恢复流不因浏览器刷新中止；只保留服务端超时。
    return this.streamExecution(execution, input.prompt);
  }

  private async toReplayResult(userId: string, runId: string, after = 0) {
    const replay = await this.streams.replay(userId, runId, after);
    return {
      stream: replay.stream,
      runId: replay.runId,
      sessionId: replay.sessionId,
      replayed: true,
    };
  }

  private findByRequestId(userId: string, requestId: string) {
    return this.prisma.agentRun.findUnique({
      where: {
        user_id_client_request_id: {
          user_id: userId,
          client_request_id: requestId,
        },
      },
      select: { id: true, session_id: true },
    });
  }

  private isRequestIdConflict(error: unknown) {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: unknown }).code === "P2002"
    );
  }

  async structured(
    userId: string,
    input: StructuredAgent,
    signal?: AbortSignal,
  ): Promise<StructuredResult> {
    const execution = await this.prepare(userId, input);
    const started = Date.now();
    await this.traces.startRun(execution.run.id);
    let stepIndex = 0;
    try {
      const options = {
        prompt: input.prompt,
        abortSignal: this.signal(signal),
        onStepFinish: async (
          event: Parameters<
            NonNullable<Parameters<typeof execution.agent.generate>[0]["onStepFinish"]>
          >[0],
        ) => {
          await this.traces.saveStep(execution.run.id, stepIndex++, event);
        },
      };
      const result =
        input.outputType === "chapterPlan"
          ? await generateText({
              ...execution.structuredOptions,
              ...options,
              output: Output.object({ schema: outputSchemas.chapterPlan, name: "chapterPlan" }),
            })
          : input.outputType === "characterProfile"
            ? await generateText({
                ...execution.structuredOptions,
                ...options,
                output: Output.object({
                  schema: outputSchemas.characterProfile,
                  name: "characterProfile",
                }),
              })
            : await generateText({
                ...execution.structuredOptions,
                ...options,
                output: Output.object({
                  schema: outputSchemas.continuityReview,
                  name: "continuityReview",
                }),
              });
      const outputText = JSON.stringify(result.output);
      await this.chats.saveAssistant({
        ...execution.messageContext,
        content: outputText,
        parts: [{ type: "data-structured", data: result.output }],
        metadata: {
          outputType: input.outputType,
          finishReason: result.finishReason,
          usage: result.totalUsage,
        },
      });
      await this.traces.finishRun(execution.run.id, {
        output: outputText,
        inputTokens: result.totalUsage.inputTokens ?? 0,
        outputTokens: result.totalUsage.outputTokens ?? 0,
        totalTokens: result.totalUsage.totalTokens ?? 0,
        finishReason: result.finishReason,
        latencyMs: Date.now() - started,
      });
      return {
        runId: execution.run.id,
        sessionId: execution.session.id,
        output: result.output,
        usage: result.totalUsage,
        skillIds: execution.skillSet.ids,
        contextBudget: execution.context.budget,
        contextWarnings: execution.context.warnings,
      };
    } catch (error) {
      const failure = this.errors.toAppError(error);
      await this.traces.failRun(execution.run.id, failure, Date.now() - started);
      throw failure;
    }
  }

  private async streamExecution(
    execution: Awaited<ReturnType<RuntimeService["prepare"]>>,
    prompt: string,
  ) {
    const started = Date.now();
    let stepIndex = 0;
    try {
      const result = await execution.agent.stream({
        prompt,
        abortSignal: this.signal(),
        onStepFinish: async (event) => {
          await this.traces.saveStep(execution.run.id, stepIndex++, event);
        },
      });
      const stream = toUIMessageStream({
        stream: result.fullStream,
        tools: execution.tools,
        sendReasoning: false,
        sendSources: true,
        messageMetadata: () => ({
          runId: execution.run.id,
          sessionId: execution.session.id,
          skillIds: execution.skillSet.ids,
          contextBudget: execution.context.budget,
          contextWarnings: execution.context.warnings,
        }),
        onError: (error) => {
          const failure = this.errors.classify(error);
          return `${failure.code}: ${failure.message}（runId: ${execution.run.id}）`;
        },
        onEnd: async ({ outcome, finishReason, responseMessage }) => {
          if (outcome.status === "aborted") {
            await this.traces.cancelRun(execution.run.id, Date.now() - started);
            return;
          }
          if (outcome.status === "failed") {
            await this.traces.failRun(
              execution.run.id,
              this.errors.toAppError(outcome.error),
              Date.now() - started,
            );
            return;
          }
          const [usage, text] = await Promise.all([result.totalUsage, result.text]);
          await this.chats.saveAssistant({
            ...execution.messageContext,
            remoteId: responseMessage.id,
            content: text,
            parts: responseMessage.parts,
            metadata: { finishReason, usage, aiSdkMessageId: responseMessage.id },
          });
          await this.traces.finishRun(execution.run.id, {
            output: text,
            inputTokens: usage.inputTokens ?? 0,
            outputTokens: usage.outputTokens ?? 0,
            totalTokens: usage.totalTokens ?? 0,
            finishReason,
            latencyMs: Date.now() - started,
          });
        },
      });
      return {
        stream: this.streams.attach(execution.run.id, stream),
        runId: execution.run.id,
        sessionId: execution.session.id,
        replayed: false,
      };
    } catch (error) {
      const failure = this.errors.toAppError(error);
      await this.traces.failRun(execution.run.id, failure, Date.now() - started);
      throw failure;
    }
  }

  private async prepare(userId: string, input: RunAgent, retryOfId?: string) {
    const currentSession = input.sessionId
      ? await this.prisma.agentSession.findFirst({
          where: { id: input.sessionId, user_id: userId, novel_id: input.novelId },
        })
      : null;
    if (input.sessionId && !currentSession)
      throw AppError.notFound("AGENT_SESSION_NOT_FOUND", "Agent 会话");
    const { model, provider } = await this.models.language(userId, input.providerId);
    const resolvedInput = { ...input, providerId: provider.id };
    const history = currentSession ? await this.chats.promptHistory(userId, currentSession.id) : "";
    const skillSet = await this.skills.resolve({
      userId,
      novelId: input.novelId,
      mode: input.mode,
      text: input.prompt,
      skillIds: input.skillIds,
    });
    const context = await this.contexts.build(userId, resolvedInput, { history });
    const sessionContext = {
      values: input.context,
      options: input.contextOptions,
    } as Prisma.InputJsonValue;
    const session = currentSession
      ? await this.prisma.agentSession.update({
          where: { id: currentSession.id },
          data: {
            chapter_id: input.chapterId,
            provider_id: provider.id,
            context: sessionContext,
          },
        })
      : await this.prisma.agentSession.create({
          data: {
            user_id: userId,
            novel_id: input.novelId,
            chapter_id: input.chapterId,
            provider_id: provider.id,
            title: input.prompt.slice(0, 100),
            context: sessionContext,
          },
        });
    const finalInput = { ...resolvedInput, sessionId: session.id };
    const run = await this.traces.createRun({
      session_id: session.id,
      user_id: userId,
      novel_id: input.novelId,
      chapter_id: input.chapterId,
      provider_id: provider.id,
      role: input.role,
      prompt: input.prompt,
      context_snapshot: context as unknown as Prisma.InputJsonValue,
      skill_ids: skillSet.ids as Prisma.InputJsonValue,
      skill_snapshot: skillSet.snapshot,
      client_request_id: input.requestId,
      request_snapshot: finalInput as unknown as Prisma.InputJsonValue,
      retry_of_id: retryOfId,
    });
    const messageContext = {
      sessionId: session.id,
      runId: run.id,
      userId,
      novelId: input.novelId,
      chapterId: input.chapterId,
    };
    // 重试沿用原会话历史里的用户消息，避免同提示词重复入库。
    if (!retryOfId) {
      await this.chats.saveUser({
        ...messageContext,
        content: input.prompt,
        parts: [{ type: "text", text: input.prompt }],
        metadata: {
          role: input.role,
          mode: input.mode,
          providerId: provider.id,
          requestId: input.requestId,
          skillIds: skillSet.ids,
        },
      });
    }
    const contextText = this.contexts.toPrompt(context);
    const tools = this.tools.build(
      { runId: run.id, userId, input: finalInput, model, contextText },
      input.mode,
    );
    const skillText = skillSet.prompt ? `\n\n${skillSet.prompt}` : "";
    const instructions = `${rolePrompts[input.role]}${skillText}\n\n${contextText}`;
    const stopWhen = stepCountIs(input.maxSteps ?? this.maxSteps);
    const settings = this.generationSettings(provider.settings);
    const agent = new ToolLoopAgent({
      id: `narraverse-${input.role}`,
      model,
      instructions,
      tools,
      stopWhen,
      maxRetries: this.maxRetries,
      ...settings,
      temperature: input.temperature ?? settings.temperature,
    });
    return {
      agent,
      tools,
      run,
      session,
      messageContext,
      skillSet,
      context,
      structuredOptions: {
        model,
        instructions,
        tools,
        stopWhen,
        maxRetries: this.maxRetries,
        ...settings,
        temperature: input.temperature ?? settings.temperature,
      },
    };
  }

  private signal(signal?: AbortSignal) {
    const timeout = AbortSignal.timeout(this.timeoutMs);
    return signal ? AbortSignal.any([signal, timeout]) : timeout;
  }

  private generationSettings(value: Prisma.JsonValue) {
    const settings = typeof value === "object" && value && !Array.isArray(value) ? value : {};
    const number = (key: string, min: number, max: number) => {
      const current = key in settings ? settings[key] : undefined;
      return typeof current === "number" && current >= min && current <= max ? current : undefined;
    };
    return {
      temperature: number("temperature", 0, 2),
      topP: number("topP", 0, 1),
      presencePenalty: number("presencePenalty", -2, 2),
      frequencyPenalty: number("frequencyPenalty", -2, 2),
      maxOutputTokens: number("maxOutputTokens", 1, 200_000),
    };
  }
}
