import type { Artifact, Message, Part, Task } from "@a2a-js/sdk";
import type { AgentExecutor, ExecutionEventBus, RequestContext } from "@a2a-js/sdk/server";
import type { UIMessageChunk } from "ai";
import type { A2aContext } from "./a2a.schema.js";
import { randomUUID } from "node:crypto";
import { Role, TaskState } from "@a2a-js/sdk";
import { TaskNotCancelableError } from "@a2a-js/sdk/errors";
import { AgentEvent } from "@a2a-js/sdk/server";
import { Inject, Injectable } from "@nestjs/common";
import { RuntimeService } from "../agent/runtime.service.js";
import { a2aContext } from "./a2a.schema.js";

/** 把 A2A Task 生命周期桥接到现有 Vercel AI SDK Runtime。 */
@Injectable()
export class A2aExecutor implements AgentExecutor {
  private readonly activeTasks = new Map<
    string,
    { controller: AbortController; contextId: string; cancelled: boolean }
  >();

  constructor(@Inject(RuntimeService) private readonly runtime: RuntimeService) {}

  async execute(requestContext: RequestContext, eventBus: ExecutionEventBus) {
    const { taskId, contextId, userMessage } = requestContext;
    const controller = new AbortController();
    this.activeTasks.set(taskId, { controller, contextId, cancelled: false });
    let taskPublished = false;
    try {
      const config = this.resolveContext(requestContext);
      const prompt = this.messageText(userMessage);
      if (!prompt) {
        eventBus.publish(
          AgentEvent.task(
            this.task(
              taskId,
              contextId,
              userMessage,
              TaskState.TASK_STATE_REJECTED,
              {
                narraverse: config,
              },
              "消息必须包含非空 text Part。",
            ),
          ),
        );
        return;
      }
      const history =
        requestContext.task?.history
          .flatMap((message) =>
            message.parts
              .filter((part) => part.content?.$case === "text")
              .map((part) => part.content?.value),
          )
          .filter((value): value is string => Boolean(value))
          .slice(-20) ?? [];
      const result = await this.runtime.stream(requestContext.context.user!.userName, {
        ...config,
        prompt,
        sessionId: config.sessionId,
        context: {
          ...config.context,
          a2aContextId: contextId,
          a2aTaskId: taskId,
          a2aHistory: history,
        },
      });
      const metadata = {
        ...requestContext.task?.metadata,
        narraverse: { ...config, sessionId: result.sessionId, runId: result.runId },
      };
      eventBus.publish(
        AgentEvent.task(
          this.task(taskId, contextId, userMessage, TaskState.TASK_STATE_WORKING, metadata),
        ),
      );
      taskPublished = true;
      await this.forwardStream(result.stream, taskId, contextId, eventBus, controller.signal);
    } catch (error) {
      const cancelled = controller.signal.aborted;
      if (cancelled && this.activeTasks.get(taskId)?.cancelled) return;
      const state = cancelled ? TaskState.TASK_STATE_CANCELED : TaskState.TASK_STATE_FAILED;
      const message = cancelled ? "任务已取消。" : "小说创作 Agent 执行失败。";
      if (!taskPublished) {
        eventBus.publish(
          AgentEvent.task(
            this.task(
              taskId,
              contextId,
              userMessage,
              state,
              requestContext.task?.metadata,
              message,
            ),
          ),
        );
      } else {
        eventBus.publish(
          AgentEvent.statusUpdate(
            this.status(taskId, contextId, state, message, {
              error: error instanceof Error ? error.name : "AgentError",
            }),
          ),
        );
      }
    } finally {
      this.activeTasks.delete(taskId);
      eventBus.finished();
    }
  }

  async cancelTask(taskId: string, eventBus: ExecutionEventBus) {
    const active = this.activeTasks.get(taskId);
    if (!active) throw new TaskNotCancelableError("任务当前没有可取消的执行。");
    active.cancelled = true;
    active.controller.abort();
    eventBus.publish(
      AgentEvent.statusUpdate(
        this.status(taskId, active?.contextId ?? "", TaskState.TASK_STATE_CANCELED, "任务已取消。"),
      ),
    );
    eventBus.finished();
  }

  private async forwardStream(
    stream: ReadableStream<UIMessageChunk>,
    taskId: string,
    contextId: string,
    eventBus: ExecutionEventBus,
    signal: AbortSignal,
  ) {
    const artifactId = randomUUID();
    const toolNames = new Map<string, string>();
    let pendingText: string | undefined;
    let artifactStarted = false;
    let failed = false;
    for await (const chunk of stream) {
      if (signal.aborted || chunk.type === "abort") throw new Error("A2A task aborted");
      if (chunk.type === "text-delta") {
        if (pendingText !== undefined) {
          eventBus.publish(
            AgentEvent.artifactUpdate(
              this.artifact(taskId, contextId, artifactId, pendingText, artifactStarted, false),
            ),
          );
          artifactStarted = true;
        }
        pendingText = chunk.delta;
      } else if (chunk.type === "tool-input-available") {
        toolNames.set(chunk.toolCallId, chunk.toolName);
        eventBus.publish(
          AgentEvent.statusUpdate(
            this.status(
              taskId,
              contextId,
              TaskState.TASK_STATE_WORKING,
              `正在调用工具：${chunk.toolName}`,
              { toolCallId: chunk.toolCallId, toolName: chunk.toolName, input: chunk.input },
            ),
          ),
        );
      } else if (chunk.type === "tool-output-available") {
        eventBus.publish(
          AgentEvent.statusUpdate(
            this.status(
              taskId,
              contextId,
              TaskState.TASK_STATE_WORKING,
              `工具执行完成：${toolNames.get(chunk.toolCallId) ?? "unknown"}`,
              { toolCallId: chunk.toolCallId, toolName: toolNames.get(chunk.toolCallId) },
            ),
          ),
        );
      } else if (
        chunk.type === "error" ||
        chunk.type === "tool-output-error" ||
        chunk.type === "tool-input-error"
      ) {
        failed = true;
      }
    }
    if (failed) throw new Error("AI SDK stream failed");
    eventBus.publish(
      AgentEvent.artifactUpdate(
        this.artifact(taskId, contextId, artifactId, pendingText ?? "", artifactStarted, true),
      ),
    );
    eventBus.publish(
      AgentEvent.statusUpdate(
        this.status(taskId, contextId, TaskState.TASK_STATE_COMPLETED, "任务执行完成。"),
      ),
    );
  }

  private resolveContext(requestContext: RequestContext): A2aContext {
    const stored = requestContext.task?.metadata?.narraverse;
    const messageData = requestContext.userMessage.parts
      .filter((part) => part.content?.$case === "data")
      .map((part) => part.content?.value)
      .find((value) => typeof value === "object" && value !== null);
    const metadata =
      requestContext.request.metadata?.narraverse ??
      requestContext.userMessage.metadata?.narraverse;
    return a2aContext.parse({
      ...(typeof stored === "object" && stored ? stored : {}),
      ...(typeof metadata === "object" && metadata ? metadata : {}),
      ...(typeof messageData === "object" && messageData
        ? "narraverse" in messageData
          ? messageData.narraverse
          : messageData
        : {}),
    });
  }

  private messageText(message: Message) {
    return message.parts
      .filter((part) => part.content?.$case === "text")
      .map((part) => part.content?.value.trim())
      .filter(Boolean)
      .join("\n");
  }

  private task(
    id: string,
    contextId: string,
    userMessage: Message,
    state: TaskState,
    metadata?: Record<string, unknown>,
    statusText?: string,
  ): Task {
    return {
      id,
      contextId,
      status: {
        state,
        message: statusText ? this.agentMessage(contextId, id, statusText) : undefined,
        timestamp: new Date().toISOString(),
      },
      artifacts: [],
      history: [userMessage],
      metadata,
    };
  }

  private status(
    taskId: string,
    contextId: string,
    state: TaskState,
    text: string,
    data?: Record<string, unknown>,
  ) {
    return {
      taskId,
      contextId,
      status: {
        state,
        message: this.agentMessage(contextId, taskId, text, data),
        timestamp: new Date().toISOString(),
      },
      metadata: undefined,
    };
  }

  private artifact(
    taskId: string,
    contextId: string,
    artifactId: string,
    text: string,
    append: boolean,
    lastChunk: boolean,
  ) {
    const artifact: Artifact = {
      artifactId,
      name: "novel-agent-output",
      description: "Narraverse 小说创作 Agent 输出",
      parts: [this.textPart(text)],
      metadata: undefined,
      extensions: [],
    };
    return { taskId, contextId, artifact, append, lastChunk, metadata: undefined };
  }

  private agentMessage(
    contextId: string,
    taskId: string,
    text: string,
    data?: Record<string, unknown>,
  ): Message {
    const parts: Part[] = [this.textPart(text)];
    if (data)
      parts.push({
        content: { $case: "data", value: data },
        metadata: undefined,
        filename: "",
        mediaType: "application/json",
      });
    return {
      messageId: randomUUID(),
      contextId,
      taskId,
      role: Role.ROLE_AGENT,
      parts,
      metadata: undefined,
      extensions: [],
      referenceTaskIds: [],
    };
  }

  private textPart(text: string): Part {
    return {
      content: { $case: "text", value: text },
      metadata: undefined,
      filename: "",
      mediaType: "text/plain",
    };
  }
}
