import { afterEach, describe, expect, it, vi } from "vitest";
import { streamText } from "ai";
import { runAgent } from "../src/agent/agent.schema.js";
import { ExecutionTraceRecorder } from "../src/agent/execution-trace.js";
import { ToolService, type ToolTiming } from "../src/agent/tool.service.js";

vi.mock("ai", async (original) => ({
  ...(await original<typeof import("ai")>()),
  streamText: vi.fn(),
}));

afterEach(() => vi.restoreAllMocks());

function setup() {
  const timings: Record<string, ToolTiming> = {};
  const { trace, recorder } = ExecutionTraceRecorder.create("run");
  const saveTool = vi.fn();
  const service = new ToolService(
    { get: () => 0 } as never,
    {} as never,
    {} as never,
    { saveTool, addUsage: vi.fn() } as never,
    {} as never,
    {} as never,
    {} as never,
    { toAppError: (error: unknown) => error } as never,
    { execute: (execute: () => Promise<unknown>) => execute() } as never,
  );
  const tools = service.build({
    runId: "run",
    userId: "user",
    model: {} as never,
    contextText: "",
    input: runAgent.parse({ novelId: "00000000-0000-4000-8000-000000000001", prompt: "test" }),
    toolTimings: timings,
    traceRecorder: recorder,
  });
  return { timings, trace, saveTool, tools };
}

describe("subagent execution timing", () => {
  it("rejects partial subagent output after a stream timeout", async () => {
    const { tools, timings } = setup();
    vi.mocked(streamText).mockReturnValueOnce({
      fullStream: [{ type: "text-delta", text: "unfinished" }, { type: "abort" }],
      text: Promise.resolve("unfinished"),
      totalUsage: Promise.resolve({}),
    } as never);
    await expect(
      tools.delegateSubagent!.execute!(
        { role: "reviewer", task: "review" },
        { toolCallId: "timeout", messages: [], context: {} },
      ),
    ).rejects.toMatchObject({ name: "TimeoutError" });
    expect(timings.timeout).toEqual(expect.objectContaining({ durationMs: expect.any(Number) }));
  });

  it("honors an explicit harness allowlist for interactive tools", () => {
    const { tools } = setup();
    expect(tools.askUser).toBeUndefined();

    const service = new ToolService(
      { get: () => 0 } as never,
      {} as never,
      {} as never,
      { saveTool: vi.fn(), addUsage: vi.fn() } as never,
      {} as never,
      {} as never,
      {} as never,
      { toAppError: (error: unknown) => error } as never,
      { execute: (execute: () => Promise<unknown>) => execute() } as never,
    );
    const interactiveTools = service.build(
      {
        runId: "run",
        userId: "user",
        model: {} as never,
        contextText: "",
        input: runAgent.parse({
          novelId: "00000000-0000-4000-8000-000000000001",
          prompt: "test",
        }),
      },
      "ask",
      { interactive: true, allowedTools: ["readArticle"] },
    );

    expect(interactiveTools.askUser).toBeUndefined();
    expect(interactiveTools.readArticle).toBeDefined();
  });

  it("records separate durations for delegated and reviewer calls without changing their outputs", async () => {
    const clock = vi.spyOn(Date, "now").mockReturnValue(1000);
    const { timings, trace, saveTool, tools } = setup();
    vi.mocked(streamText).mockImplementationOnce(() => {
      expect(timings.delegate).toEqual({ startedAt: 1000 });
      clock.mockReturnValue(2350);
      return {
        text: Promise.resolve("plot result"),
        totalUsage: Promise.resolve({}),
        fullStream: [],
      } as never;
    });
    const result = await tools.delegateSubagent!.execute!(
      { role: "plot", task: "review" },
      { toolCallId: "delegate", messages: [], context: {} },
    );
    expect(result).toMatchObject({ role: "plot", result: "plot result" });
    vi.mocked(streamText).mockImplementationOnce(() => {
      clock.mockReturnValue(3000);
      return {
        text: Promise.resolve("review result"),
        totalUsage: Promise.resolve({}),
        fullStream: [],
      } as never;
    });
    await tools.validateContinuity!.execute!(
      { text: "chapter" },
      { toolCallId: "reviewer", messages: [], context: {} },
    );
    expect(timings).toEqual({
      delegate: { startedAt: 1000, durationMs: 1350 },
      reviewer: { startedAt: 2350, durationMs: 650 },
    });
    expect(trace.nodes.delegate).toMatchObject({
      id: "delegate",
      parentId: "run:run",
      kind: "subagent",
      name: "delegateSubagent",
      status: "completed",
      startedAt: 1000,
      endedAt: 2350,
      inputAvailableAt: 1000,
      outputAvailableAt: 2350,
      outputFinalizedAt: 2350,
      metadata: { role: "plot" },
    });
    expect(trace.nodes.reviewer).toMatchObject({
      id: "reviewer",
      parentId: "run:run",
      kind: "tool",
      name: "validateContinuity",
      status: "completed",
    });
    expect(trace.events.map((event) => event.type)).toEqual([
      "run.started",
      "subagent.started",
      "subagent.input.available",
      "subagent.output.available",
      "subagent.completed",
      "tool.started",
      "tool.input.available",
      "tool.output.available",
      "tool.completed",
    ]);
    expect(saveTool).toHaveBeenCalledWith(
      "run",
      expect.objectContaining({ id: "delegate", durationMs: 1350, status: "completed" }),
    );
  });

  it("retains elapsed time when a subagent fails", async () => {
    const clock = vi.spyOn(Date, "now").mockReturnValue(1000);
    const { timings, trace, tools, saveTool } = setup();
    vi.mocked(streamText).mockImplementationOnce(() => {
      clock.mockReturnValue(4200);
      throw new Error("model unavailable");
    });
    await expect(
      tools.delegateSubagent!.execute!(
        { role: "plot", task: "review" },
        { toolCallId: "failed", messages: [], context: {} },
      ),
    ).rejects.toThrow("model unavailable");
    expect(timings.failed).toEqual({ startedAt: 1000, durationMs: 3200 });
    expect(trace.nodes.failed).toMatchObject({
      kind: "subagent",
      status: "failed",
      endedAt: 4200,
      error: "model unavailable",
    });
    expect(trace.events.at(-1)).toMatchObject({
      nodeId: "failed",
      type: "subagent.failed",
      error: "model unavailable",
    });
    expect(saveTool).toHaveBeenCalledWith(
      "run",
      expect.objectContaining({ durationMs: 3200, status: "failed" }),
    );
  });
});
