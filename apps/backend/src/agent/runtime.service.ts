import type { EnvConfig } from "../config/env-schema.js";
import type { Prisma } from "../generated/prisma/client.js";
import type { ModelMessage } from "ai";
import {
  runAgent,
  type AnswerQuestion,
  type RunAgent,
  type StructuredAgent,
} from "./agent.schema.js";
import type { ContextSnapshot } from "./context.service.js";
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
import { interactionPrompt, rolePrompts } from "./prompt.js";
import { QuestionService } from "./question.service.js";
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
    @Inject(QuestionService) private readonly questions: QuestionService,
    @Inject(StreamService) private readonly streams: StreamService,
    @Inject(SkillResolver) private readonly skills: SkillResolver,
    @Inject(AgentErrorService) private readonly errors: AgentErrorService,
  ) {
    this.maxSteps = config.get("AGENT_MAX_STEPS", { infer: true });
    this.timeoutMs = config.get("AGENT_TIMEOUT_MS", { infer: true });
    this.maxRetries = config.get("AGENT_MAX_RETRIES", { infer: true });
  }

  async generate(userId: string, input: RunAgent, signal?: AbortSignal): Promise<AgentResult> {
    const execution = await this.prepare(userId, input, false);
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
    const execution = await this.prepare(userId, input, true, retryOfId);
    await this.traces.startRun(execution.run.id);
    // 可恢复流不因浏览器刷新中止；只保留服务端超时。
    return this.streamExecution(execution, { prompt: input.prompt }, [
      { role: "user", content: input.prompt },
    ]);
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

  async answerStream(userId: string, questionId: string, answer: AnswerQuestion) {
    const claimed = await this.questions.claim(userId, questionId, answer);
    try {
      const execution = await this.resumeExecution(userId, claimed);
      await this.traces.resumeRun(execution.run.id);
      const messages = [
        ...(claimed.model_messages as unknown as ModelMessage[]),
        {
          role: "tool" as const,
          content: [
            {
              type: "tool-result" as const,
              toolCallId: claimed.tool_call_id,
              toolName: "askUser",
              output: { type: "json" as const, value: { answers: answer.answers } },
            },
          ],
        },
      ];
      return await this.streamExecution(execution, { messages }, messages, undefined, {
        id: claimed.id,
        answers: answer.answers,
      });
    } catch (error) {
      await this.questions.release(questionId);
      await this.questions.rollbackNewQuestions(claimed.run_id, questionId);
      throw error;
    }
  }

  async structured(
    userId: string,
    input: StructuredAgent,
    signal?: AbortSignal,
  ): Promise<StructuredResult> {
    const execution = await this.prepare(userId, input, false);
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
    call: { prompt: string } | { messages: ModelMessage[] },
    prefixMessages: ModelMessage[],
    signal?: AbortSignal,
    answering?: { id: string; answers: AnswerQuestion["answers"] },
  ) {
    const started = Date.now();
    let stepIndex = await this.traces.nextStepIndex(execution.run.id);
    const onStepFinish: NonNullable<
      Parameters<typeof execution.agent.stream>[0]["onStepFinish"]
    > = async (event) => {
      await this.traces.saveStep(execution.run.id, stepIndex++, event);
      await this.captureQuestion(execution, event.toolCalls);
    };
    try {
      const result =
        "messages" in call
          ? await execution.agent.stream({
              messages: call.messages,
              abortSignal: this.signal(signal),
              onStepFinish,
            })
          : await execution.agent.stream({
              prompt: call.prompt,
              abortSignal: this.signal(signal),
              onStepFinish,
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
            if (answering) {
              await this.questions.release(answering.id);
              await this.questions.rollbackNewQuestions(execution.run.id, answering.id);
            }
            await this.traces.cancelRun(execution.run.id, Date.now() - started);
            return;
          }
          if (outcome.status === "failed") {
            if (answering) {
              await this.questions.release(answering.id);
              await this.questions.rollbackNewQuestions(execution.run.id, answering.id);
            }
            await this.traces.failRun(
              execution.run.id,
              this.errors.toAppError(outcome.error),
              Date.now() - started,
            );
            return;
          }
          const [usage, text, responseMessages, toolCalls] = await Promise.all([
            result.totalUsage,
            result.text,
            result.responseMessages,
            result.toolCalls,
          ]);
          const askCall = this.findAskCall(toolCalls);
          if (askCall) await this.captureQuestion(execution, [askCall]);
          const modelMessages = [...prefixMessages, ...responseMessages] as ModelMessage[];
          if (askCall) await this.questions.checkpoint(execution.run.id, modelMessages);

          const visibleParts = responseMessage.parts.filter((part) => part.type !== "tool-askUser");
          if (text.trim() || visibleParts.some((part) => part.type !== "step-start")) {
            await this.chats.saveAssistant({
              ...execution.messageContext,
              remoteId: responseMessage.id,
              content: text,
              parts: visibleParts,
              metadata: { finishReason, usage, aiSdkMessageId: responseMessage.id },
            });
          }
          if (answering) await this.questions.complete(answering.id, answering.answers);
          const output = [execution.run.output, text].filter(Boolean).join("\n\n");
          if (askCall) {
            await this.traces.waitForInput(execution.run.id, {
              output,
              inputTokens: usage.inputTokens ?? 0,
              outputTokens: usage.outputTokens ?? 0,
              totalTokens: usage.totalTokens ?? 0,
              latencyMs: Date.now() - started,
            });
          } else {
            await this.traces.finishRun(execution.run.id, {
              output,
              inputTokens: usage.inputTokens ?? 0,
              outputTokens: usage.outputTokens ?? 0,
              totalTokens: usage.totalTokens ?? 0,
              finishReason,
              latencyMs: Date.now() - started,
            });
          }
        },
      });
      return {
        stream: this.streams.attach(execution.run.id, stream),
        runId: execution.run.id,
        sessionId: execution.session.id,
        replayed: false,
      };
    } catch (error) {
      if (answering) {
        await this.questions.release(answering.id);
        await this.questions.rollbackNewQuestions(execution.run.id, answering.id);
      }
      const failure = this.errors.toAppError(error);
      await this.traces.failRun(execution.run.id, failure, Date.now() - started);
      throw failure;
    }
  }

  private async captureQuestion(
    execution: Awaited<ReturnType<RuntimeService["prepare"]>>,
    calls: readonly unknown[] | undefined,
  ) {
    const call = this.findAskCall(calls ?? []);
    if (!call) return;
    await this.questions.capture({
      userId: execution.messageContext.userId,
      sessionId: execution.session.id,
      runId: execution.run.id,
      novelId: execution.input.novelId,
      chapterId: execution.input.chapterId,
      toolCallId: call.toolCallId,
      question: call.input,
      resumeConfig: execution.input,
      instructions: execution.instructions,
    });
    await this.traces.saveTool(execution.run.id, {
      id: call.toolCallId,
      name: "askUser",
      input: call.input,
      status: "waiting_input",
      durationMs: 0,
    });
  }

  private findAskCall(calls: readonly unknown[]) {
    for (const value of calls) {
      if (
        value &&
        typeof value === "object" &&
        "toolName" in value &&
        value.toolName === "askUser" &&
        "toolCallId" in value &&
        typeof value.toolCallId === "string" &&
        "input" in value
      ) {
        return {
          toolCallId: value.toolCallId,
          input: value.input,
        };
      }
    }
    return undefined;
  }

  private async resumeExecution(
    userId: string,
    claimed: Awaited<ReturnType<QuestionService["claim"]>>,
  ): Promise<Awaited<ReturnType<RuntimeService["prepare"]>>> {
    const { model, provider } = await this.models.language(userId, claimed.run.provider_id);
    const input = {
      ...claimed.config,
      providerId: provider.id,
      sessionId: claimed.session.id,
    };
    const context = claimed.run.context_snapshot as unknown as ContextSnapshot;
    const contextText = this.contexts.toPrompt(context);
    const tools = this.tools.build(
      { runId: claimed.run.id, userId, input, model, contextText },
      input.mode,
      { allowAskUser: true },
    );
    const settings = this.generationSettings(provider.settings);
    const stopWhen = stepCountIs(input.maxSteps ?? this.maxSteps);
    const agent = new ToolLoopAgent({
      id: `narraverse-${input.role}`,
      model,
      instructions: claimed.instructions,
      tools,
      stopWhen,
      maxRetries: this.maxRetries,
      ...settings,
      temperature: input.temperature ?? settings.temperature,
    });
    const skillIds = Array.isArray(claimed.run.skill_ids)
      ? claimed.run.skill_ids.filter((id): id is string => typeof id === "string")
      : [];
    return {
      agent,
      tools,
      run: claimed.run,
      session: claimed.session,
      messageContext: {
        sessionId: claimed.session.id,
        runId: claimed.run.id,
        userId,
        novelId: claimed.run.novel_id,
        chapterId: claimed.run.chapter_id ?? undefined,
      },
      skillSet: {
        ids: skillIds,
        prompt: "",
        requestedTools: [],
        snapshot: claimed.run.skill_snapshot ?? [],
      },
      context,
      input,
      instructions: claimed.instructions,
      structuredOptions: {
        model,
        instructions: claimed.instructions,
        tools,
        stopWhen,
        maxRetries: this.maxRetries,
        ...settings,
        temperature: input.temperature ?? settings.temperature,
      },
    };
  }

  private async prepare(
    userId: string,
    input: RunAgent,
    allowAskUser: boolean,
    retryOfId?: string,
  ) {
    const currentSession = input.sessionId
      ? await this.prisma.agentSession.findFirst({
          where: { id: input.sessionId, user_id: userId, novel_id: input.novelId },
        })
      : null;
    if (input.sessionId && !currentSession)
      throw AppError.notFound("AGENT_SESSION_NOT_FOUND", "Agent 会话");
    if (currentSession) await this.questions.assertNoPending(userId, currentSession.id);
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
      { allowAskUser },
    );
    const skillText = skillSet.prompt ? `\n\n${skillSet.prompt}` : "";
    const interactionText = allowAskUser ? `\n\n${interactionPrompt}` : "";
    const instructions = `${rolePrompts[input.role]}${interactionText}${skillText}\n\n${contextText}`;
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
      input: finalInput,
      instructions,
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
