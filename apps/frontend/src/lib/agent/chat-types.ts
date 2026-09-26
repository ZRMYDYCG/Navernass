import type { UIMessage } from "ai";

export interface AgentMessageMetadata {
  runId?: string;
  sessionId?: string;
  aiSdkMessageId?: string;
  toolTimings?: Record<string, { startedAt: number; durationMs?: number }>;
}

export type AgentMessage = UIMessage<AgentMessageMetadata>;

export interface AgentContext {
  novelId: string;
  chapterId?: string;
}

export function resolveAgentMessageId(message: AgentMessage, fallback: string) {
  const id = message.id?.trim();
  if (id) return id;

  const aiSdkMessageId = message.metadata?.aiSdkMessageId?.trim();
  if (aiSdkMessageId) return aiSdkMessageId;

  const runId = message.metadata?.runId?.trim();
  if (runId) return `${message.role}-${runId}`;

  return fallback;
}
