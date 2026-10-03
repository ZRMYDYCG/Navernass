import { afterEach, describe, expect, it, vi } from "vitest";
import type { UIMessageChunk } from "ai";
import type { ToolTiming } from "../src/agent/tool.service.js";
import { RuntimeService } from "../src/agent/runtime.service.js";
import { AgentErrorService } from "../src/agent/error.service.js";

afterEach(() => vi.useRealTimers());

async function setup() {
  vi.useFakeTimers();
  const traces = { cancelRun: vi.fn(), failRun: vi.fn(), finishRun: vi.fn() };
  const service = new RuntimeService(
    { get: () => 180_000 } as never,
    {} as never,
    {} as never,
    {} as never,
    { saveAssistant: vi.fn() } as never,
    {} as never,
    traces as never,
    { attach: (_id: string, stream: ReadableStream<UIMessageChunk>) => stream } as never,
    {} as never,
    new AgentErrorService(),
    {} as never,
  );
  let source!: ReadableStreamDefaultController;
  let signal!: AbortSignal;
  const fullStream = new ReadableStream({ start: (controller) => (source = controller) });
  const timings: Record<string, ToolTiming> = {};
  const execution = {
    agent: {
      stream: async (options: { abortSignal: AbortSignal }) => {
        signal = options.abortSignal;
        signal.addEventListener("abort", () => {
          source.enqueue({ type: "abort" });
          source.close();
        });
        return { fullStream, totalUsage: Promise.resolve({}), text: Promise.resolve("") };
      },
    },
    tools: { review: { execute: () => {} } },
    toolTimings: timings,
    executionTrace: {},
    run: { id: "run" },
    session: { id: "session" },
    skillSet: { ids: [] },
    context: { budget: {}, warnings: [] },
    messageContext: {},
  };
  const result = await service["streamExecution"](execution as never, { prompt: "review" });
  const chunks: UIMessageChunk[] = [];
  const consumed = (async () => {
    for await (const chunk of result.stream) chunks.push(chunk);
  })();
  source.enqueue({ type: "start" });
  await vi.advanceTimersByTimeAsync(0);
  return {
    source,
    signal,
    consumed,
    chunks,
    traces,
    timings,
    pause: () => service["activeStreams"].get("run")!.controller.abort("user_paused"),
  };
}

describe("stream idle timeout", () => {
  it.each([false, true])(
    "persists pause without waiting for stream shutdown (active: %s)",
    async (active) => {
      const cancelRun = vi.fn().mockResolvedValue({ count: 1 });
      const service = new RuntimeService(
        { get: () => 180_000 } as never,
        {
          agentRun: {
            findFirst: vi.fn().mockResolvedValue({ status: "running", started_at: new Date() }),
          },
        } as never,
        {} as never,
        {} as never,
        {} as never,
        {} as never,
        { cancelRun } as never,
        {} as never,
        {} as never,
        new AgentErrorService(),
        {} as never,
      );
      const controller = new AbortController();
      if (active) {
        service["activeStreams"].set("run", {
          controller,
          done: new Promise(() => {}),
          finish: () => {},
        });
      }
      await expect(service.pauseRun("user", "run")).resolves.toEqual({ paused: true });
      expect(controller.signal.aborted).toBe(active);
      expect(cancelRun).toHaveBeenCalledWith("run", expect.any(Number));
    },
  );

  it("keeps a long generation alive while model output continues", async () => {
    const { source, signal, consumed } = await setup();
    for (let step = 0; step < 4; step++) {
      await vi.advanceTimersByTimeAsync(120_000);
      source.enqueue({ type: "start-step", request: {}, warnings: [] });
      await vi.advanceTimersByTimeAsync(0);
      expect(signal.aborted).toBe(false);
    }
    source.close();
    await consumed;
    await vi.advanceTimersByTimeAsync(180_000);
    expect(signal.aborted).toBe(false);
  });

  it("resumes timeout after a tool fails", async () => {
    const { source, signal, consumed, traces } = await setup();
    source.enqueue({ type: "tool-call", toolCallId: "a", toolName: "review", input: {} });
    await vi.advanceTimersByTimeAsync(180_001);
    expect(signal.aborted).toBe(false);
    source.enqueue({
      type: "tool-error",
      toolCallId: "a",
      toolName: "review",
      error: new Error("review failed"),
    });
    await vi.advanceTimersByTimeAsync(180_000);
    await consumed;
    expect(signal.aborted).toBe(true);
    expect(traces.failRun).toHaveBeenCalled();
  });

  it("publishes the final duration of a tool interrupted by the user", async () => {
    const { source, timings, pause, consumed, chunks, traces } = await setup();
    timings.a = { startedAt: Date.now() };
    source.enqueue({ type: "tool-call", toolCallId: "a", toolName: "review", input: {} });
    await vi.advanceTimersByTimeAsync(2500);
    pause();
    await consumed;
    expect(chunks).toContainEqual(
      expect.objectContaining({
        type: "message-metadata",
        messageMetadata: expect.objectContaining({
          toolTimings: { a: expect.objectContaining({ durationMs: 2500 }) },
        }),
      }),
    );
    expect(traces.cancelRun).toHaveBeenCalled();
    expect(traces.failRun).not.toHaveBeenCalled();
  });

  it("waits for all parallel tools, then resumes the idle timeout", async () => {
    const { source, signal, consumed, traces } = await setup();
    for (const id of ["a", "b"]) {
      source.enqueue({ type: "tool-call", toolCallId: id, toolName: "review", input: {} });
    }
    await vi.advanceTimersByTimeAsync(180_001);
    expect(signal.aborted).toBe(false);
    source.enqueue({ type: "tool-result", toolCallId: "a", toolName: "review", output: {} });
    await vi.advanceTimersByTimeAsync(180_001);
    expect(signal.aborted).toBe(false);
    source.enqueue({ type: "tool-result", toolCallId: "b", toolName: "review", output: {} });
    await vi.advanceTimersByTimeAsync(179_999);
    expect(signal.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await consumed;
    expect(signal.aborted).toBe(true);
    expect(traces.cancelRun).not.toHaveBeenCalled();
    expect(traces.failRun).toHaveBeenCalledWith(
      "run",
      expect.objectContaining({ code: "AGENT_TIMEOUT" }),
      expect.any(Number),
    );
  });

  it("still times out when the model sends no output", async () => {
    const { signal, consumed, traces } = await setup();
    await vi.advanceTimersByTimeAsync(180_000);
    await consumed;
    expect(signal.aborted).toBe(true);
    expect(traces.failRun).toHaveBeenCalled();
    expect(traces.cancelRun).not.toHaveBeenCalled();
  });
});
