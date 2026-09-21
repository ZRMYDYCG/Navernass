import { describe, expect, it, vi } from "vitest";
import type { UIMessageChunk } from "ai";
import { StreamService } from "../src/agent/stream.service.js";
import type { PrismaService } from "../src/database/prisma.service.js";

const runId = "00000000-0000-4000-8000-000000000001";
const userId = "user-1";

function chunk(delta: string): UIMessageChunk {
  return { type: "text-delta", id: "msg-1", delta };
}

describe("可恢复流", () => {
  it("合并相邻 text-delta 后再按序持久化", async () => {
    const create = vi.fn().mockResolvedValue({});
    const prisma = {
      agentStreamEvent: {
        aggregate: vi.fn().mockResolvedValue({ _max: { sequence: null } }),
        create,
      },
    } as unknown as PrismaService;
    const service = new StreamService(prisma);
    const source = new ReadableStream<UIMessageChunk>({
      start(controller) {
        controller.enqueue(chunk("你"));
        controller.enqueue(chunk("好"));
        controller.enqueue({ type: "finish" });
        controller.close();
      },
    });

    const attached = service.attach(runId, source);
    await attached.pipeTo(new WritableStream());
    await vi.waitFor(() => expect(create).toHaveBeenCalledTimes(2));

    expect(create.mock.calls[0]?.[0]).toMatchObject({
      data: { run_id: runId, sequence: 1, chunk: { type: "text-delta", delta: "你好" } },
    });
    expect(create.mock.calls[1]?.[0]).toMatchObject({
      data: { run_id: runId, sequence: 2, chunk: { type: "finish" } },
    });
  });

  it("按 after 游标重放已持久化事件并在终态关闭", async () => {
    const prisma = {
      agentRun: {
        findFirst: vi.fn().mockResolvedValue({
          id: runId,
          session_id: "session-1",
          status: "completed",
        }),
        findUnique: vi.fn().mockResolvedValue({ status: "completed" }),
      },
      agentStreamEvent: {
        findMany: vi
          .fn()
          .mockResolvedValueOnce([
            { sequence: 2, chunk: chunk("续") },
            { sequence: 3, chunk: { type: "finish" } },
          ])
          .mockResolvedValueOnce([]),
      },
    } as unknown as PrismaService;
    const service = new StreamService(prisma);
    const replay = await service.replay(userId, runId, 1);
    const received: UIMessageChunk[] = [];
    for await (const part of replay.stream) received.push(part);

    expect(replay.sessionId).toBe("session-1");
    expect(received).toEqual([chunk("续"), { type: "finish" }]);
    expect(prisma.agentStreamEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { run_id: runId, sequence: { gt: 1 } } }),
    );
  });
});
