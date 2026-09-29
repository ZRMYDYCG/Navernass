export type TraceNodeKind = "run" | "tool" | "subagent";
export type TraceNodeStatus = "pending" | "running" | "completed" | "failed";

export interface TraceNode {
  id: string;
  parentId?: string;
  kind: TraceNodeKind;
  name: string;
  status: TraceNodeStatus;
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

export type TraceEventType =
  | "run.started"
  | "tool.started"
  | "tool.input.available"
  | "tool.output.available"
  | "tool.completed"
  | "tool.failed"
  | "subagent.started"
  | "subagent.input.available"
  | "subagent.output.available"
  | "subagent.completed"
  | "subagent.failed";

export interface TraceEvent {
  id: string;
  nodeId: string;
  parentId?: string;
  type: TraceEventType;
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

export class ExecutionTraceRecorder {
  private sequence = 0;

  constructor(private readonly trace: ExecutionTrace) {}

  static create(runId: string) {
    const now = Date.now();
    const rootId = `run:${runId}`;
    const trace: ExecutionTrace = {
      runId,
      rootId,
      nodes: {
        [rootId]: {
          id: rootId,
          kind: "run",
          name: "agent",
          status: "running",
          startedAt: now,
        },
      },
      events: [],
    };
    const recorder = new ExecutionTraceRecorder(trace);
    recorder.event(rootId, "run.started", now);
    return { trace, recorder };
  }

  startTool(input: { id: string; name: string; input: unknown; startedAt: number }) {
    const kind = input.name === "delegateSubagent" ? "subagent" : "tool";
    const startedType = kind === "subagent" ? "subagent.started" : "tool.started";
    const inputType = kind === "subagent" ? "subagent.input.available" : "tool.input.available";
    const node: TraceNode = {
      id: input.id,
      parentId: this.trace.rootId,
      kind,
      name: input.name,
      status: "running",
      startedAt: input.startedAt,
      inputAvailableAt: input.startedAt,
      input: input.input,
    };
    if (
      kind === "subagent" &&
      input.input &&
      typeof input.input === "object" &&
      "role" in input.input
    ) {
      node.metadata = { role: String((input.input as { role: unknown }).role) };
    }
    this.trace.nodes[input.id] = node;
    this.event(input.id, startedType, input.startedAt);
    this.event(input.id, inputType, input.startedAt, { input: input.input });
  }

  completeTool(input: { id: string; output: unknown; endedAt: number }) {
    const node = this.trace.nodes[input.id];
    if (!node) return;
    const outputType =
      node.kind === "subagent" ? "subagent.output.available" : "tool.output.available";
    const completedType = node.kind === "subagent" ? "subagent.completed" : "tool.completed";
    node.status = "completed";
    node.endedAt = input.endedAt;
    node.outputAvailableAt = input.endedAt;
    node.outputFinalizedAt = input.endedAt;
    node.output = input.output;
    this.event(input.id, outputType, input.endedAt, { output: input.output });
    this.event(input.id, completedType, input.endedAt, { output: input.output });
  }

  failTool(input: { id: string; error: string; endedAt: number }) {
    const node = this.trace.nodes[input.id];
    if (!node) return;
    const failedType = node.kind === "subagent" ? "subagent.failed" : "tool.failed";
    node.status = "failed";
    node.endedAt = input.endedAt;
    node.outputFinalizedAt = input.endedAt;
    node.error = input.error;
    this.event(input.id, failedType, input.endedAt, { error: input.error });
  }

  private event(
    nodeId: string,
    type: TraceEventType,
    timestamp: number,
    payload: Pick<TraceEvent, "input" | "output" | "error"> = {},
  ) {
    this.trace.events.push({
      id: `${nodeId}:${type}:${this.sequence + 1}`,
      nodeId,
      parentId: this.trace.nodes[nodeId]?.parentId,
      type,
      timestamp,
      sequence: ++this.sequence,
      ...payload,
    });
  }
}
