import type { UIMessage } from "ai";

export interface AgentMessageMetadata {
  runId?: string;
  sessionId?: string;
}

export type AgentMessage = UIMessage<AgentMessageMetadata>;

export interface AgentContext {
  novelId: string;
  chapterId?: string;
}
