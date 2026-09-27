import type { UIMessageChunk } from "ai";
import { DefaultChatTransport } from "ai";

import type { AgentContext, AgentMessage } from "@/lib/agent/chat-types";
import { apiBaseUrl } from "@/lib/http/client";
import { apiRequest } from "@/lib/http/request";
import {
  chatSessionListSchema,
  pauseRunResultSchema,
  sessionMessagePageSchema,
  type AskUserOutput,
} from "@/schemas/agent.schema";

function sendStream(path: string, body: object, signal: AbortSignal) {
  const transport = new DefaultChatTransport<AgentMessage>({
    api: `${apiBaseUrl}/${path}`,
    credentials: "include",
    prepareSendMessagesRequest: ({ body }) => ({ body: body ?? {} }),
  });
  return transport.sendMessages({
    trigger: "submit-message",
    chatId: crypto.randomUUID(),
    messageId: undefined,
    messages: [],
    abortSignal: signal,
    body,
  });
}

export function startAgentStream(
  context: AgentContext,
  prompt: string,
  sessionId: string | undefined,
  signal: AbortSignal,
): Promise<ReadableStream<UIMessageChunk>> {
  return sendStream(
    "agent/runs/stream",
    {
      requestId: crypto.randomUUID(),
      novelId: context.novelId,
      ...(context.chapterId && { chapterId: context.chapterId }),
      ...(sessionId && { sessionId }),
      prompt,
      context: {},
    },
    signal,
  );
}

export function answerAgentStream(
  sessionId: string,
  toolCallId: string,
  output: AskUserOutput,
  signal: AbortSignal,
): Promise<ReadableStream<UIMessageChunk>> {
  return sendStream(
    `agent/sessions/${sessionId}/tool-output/stream`,
    { toolCallId, output },
    signal,
  );
}

export async function resumeAgentStream(
  runId: string,
  signal: AbortSignal,
): Promise<ReadableStream<UIMessageChunk>> {
  const transport = new DefaultChatTransport<AgentMessage>({
    api: `${apiBaseUrl}/agent/runs`,
    credentials: "include",
    prepareReconnectToStreamRequest: ({ id }) => ({
      api: `${apiBaseUrl}/agent/runs/${id}/stream?after=0`,
    }),
  });
  const stream = await transport.reconnectToStream({ chatId: runId, abortSignal: signal });
  if (!stream) throw new Error("Agent stream is no longer available");
  return stream;
}

export function pauseAgentRun(runId: string) {
  return apiRequest(`agent/runs/${runId}/pause`, pauseRunResultSchema, { method: "post" });
}

export async function getChatSessions(novelId: string) {
  return apiRequest(
    `agent/sessions?novelId=${encodeURIComponent(novelId)}&page=1&pageSize=100`,
    chatSessionListSchema,
  );
}

export async function getSessionMessages(sessionId: string): Promise<AgentMessage[]> {
  const page = await apiRequest(
    `agent/sessions/${sessionId}/messages?limit=100`,
    sessionMessagePageSchema,
  );
  return page.items.map((message) => ({
    id: message.remote_id?.trim() || message.id,
    role: message.role,
    metadata: message.metadata,
    parts: message.parts as AgentMessage["parts"],
  }));
}
