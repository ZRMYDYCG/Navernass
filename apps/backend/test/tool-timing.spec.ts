import { afterEach, describe, expect, it, vi } from "vitest";
import { generateText } from "ai";
import { runAgent } from "../src/agent/agent.schema.js";
import { ToolService, type ToolTiming } from "../src/agent/tool.service.js";

vi.mock("ai", async (original) => ({
  ...(await original<typeof import("ai")>()),
  generateText: vi.fn(),
}));

afterEach(() => vi.restoreAllMocks());

function setup() {
  const timings: Record<string, ToolTiming> = {};
  const saveTool = vi.fn();
  const service = new ToolService(
    { get: () => 0 } as never,
    {} as never,
    {} as never,
    { saveTool, addUsage: vi.fn() } as never,
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
  });
  return { timings, saveTool, tools };
}

describe("subagent execution timing", () => {
  it("records separate durations for delegated and reviewer calls without changing their outputs", async () => {
    const clock = vi.spyOn(Date, "now").mockReturnValue(1000);
    const { timings, saveTool, tools } = setup();
    vi.mocked(generateText).mockImplementationOnce(async () => {
      expect(timings.delegate).toEqual({ startedAt: 1000 });
      clock.mockReturnValue(2350);
      return { text: "plot result", totalUsage: {} } as never;
    });
    const result = await tools.delegateSubagent!.execute!(
      { role: "plot", task: "review" },
      { toolCallId: "delegate", messages: [], context: {} },
    );
    expect(result).toMatchObject({ role: "plot", result: "plot result" });
    vi.mocked(generateText).mockImplementationOnce(async () => {
      clock.mockReturnValue(3000);
      return { text: "review result", totalUsage: {} } as never;
    });
    await tools.validateContinuity!.execute!(
      { text: "chapter" },
      { toolCallId: "reviewer", messages: [], context: {} },
    );
    expect(timings).toEqual({
      delegate: { startedAt: 1000, durationMs: 1350 },
      reviewer: { startedAt: 2350, durationMs: 650 },
    });
    expect(saveTool).toHaveBeenCalledWith(
      "run",
      expect.objectContaining({ id: "delegate", durationMs: 1350, status: "completed" }),
    );
  });

  it("retains elapsed time when a subagent fails", async () => {
    const clock = vi.spyOn(Date, "now").mockReturnValue(1000);
    const { timings, tools, saveTool } = setup();
    vi.mocked(generateText).mockImplementationOnce(async () => {
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
    expect(saveTool).toHaveBeenCalledWith(
      "run",
      expect.objectContaining({ durationMs: 3200, status: "failed" }),
    );
  });
});
