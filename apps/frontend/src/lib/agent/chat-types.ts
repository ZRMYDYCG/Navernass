import type { UIMessage } from "ai";

export interface AgentTraceNode {
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

export interface AgentTraceEvent {
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

export interface AgentExecutionTrace {
  runId: string;
  rootId: string;
  nodes: Record<string, AgentTraceNode>;
  events: AgentTraceEvent[];
}

export interface AgentMessageMetadata {
  runId?: string;
  sessionId?: string;
  aiSdkMessageId?: string;
  interrupted?: boolean;
  paused?: boolean;
  toolTimings?: Record<string, { startedAt: number; durationMs?: number }>;
  executionTrace?: AgentExecutionTrace;
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
