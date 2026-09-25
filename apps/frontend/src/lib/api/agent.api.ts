import type { UIMessageChunk } from "ai";
import { DefaultChatTransport } from "ai";

import type { AgentContext, AgentMessage, AnswerValue } from "@/lib/agent/chat-types";
import { apiBaseUrl } from "@/lib/http/client";
import { apiRequest } from "@/lib/http/request";
import {
  dismissQuestionSchema,
  pendingQuestionSchema,
  sessionMessagePageSchema,
  type PendingQuestion,
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
  questionId: string,
  answers: Record<string, AnswerValue>,
  signal: AbortSignal,
): Promise<ReadableStream<UIMessageChunk>> {
  return sendStream(`agent/questions/${questionId}/answer/stream`, { answers }, signal);
}

export async function getPendingQuestion(sessionId: string): Promise<PendingQuestion | undefined> {
  const question = await apiRequest(
    `agent/sessions/${sessionId}/question`,
    pendingQuestionSchema.nullable(),
  );
  return question ?? undefined;
}

export async function getSessionMessages(sessionId: string): Promise<AgentMessage[]> {
  const page = await apiRequest(
    `agent/sessions/${sessionId}/messages?limit=100`,
    sessionMessagePageSchema,
  );
  return page.items.map((message) => ({
    id: message.remote_id ?? message.id,
    role: message.role,
    metadata: message.metadata,
    parts: message.parts as AgentMessage["parts"],
  }));
}

export async function dismissQuestion(questionId: string) {
  await apiRequest(`agent/questions/${questionId}/dismiss`, dismissQuestionSchema, {
    method: "post",
    json: { reason: "用户在对话界面取消了本次提问" },
  });
}
