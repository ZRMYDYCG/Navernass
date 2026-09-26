import type { UIMessageChunk } from "ai";
import { DefaultChatTransport } from "ai";

import type { AgentContext, AgentMessage } from "@/lib/agent/chat-types";
import { apiBaseUrl } from "@/lib/http/client";
import { apiRequest } from "@/lib/http/request";
import { sessionMessagePageSchema } from "@/schemas/agent.schema";

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
