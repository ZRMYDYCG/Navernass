import type { UIMessage } from "ai";

export interface TraceNode {
  id: string;
  parentId?: string;
  kind: "run" | "tool" | "subagent";
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt?: number;
  endedAt?: number;
  inputAvailableAt?: number;
  outputAvailableAt?: number;
  outputFinalizedAt?: number;
  input?: unknown;
  output?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface TraceEvent {
  id: string;
  nodeId: string;
  parentId?: string;
  type: string;
  timestamp: number;
  sequence: number;
  input?: unknown;
  output?: unknown;
  error?: string;
}

export interface ExecutionTrace {
  runId: string;
  rootId: string;
  nodes: Record<string, TraceNode>;
  events: TraceEvent[];
}

export interface ChatMessageMetadata {
  runId?: string;
  sessionId?: string;
  aiSdkMessageId?: string;
  interrupted?: boolean;
  paused?: boolean;
  toolTimings?: Record<string, { startedAt: number; durationMs?: number }>;
  executionTrace?: ExecutionTrace;
}

export type ChatMessage = UIMessage<ChatMessageMetadata>;

export interface ChatContext {
  novelId: string;
  chapterId?: string;
}
