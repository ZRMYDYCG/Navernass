import type { ConfigService } from "@nestjs/config";
import type { EnvConfig } from "../src/config/env-schema.js";
import type { PrismaService } from "../src/database/prisma.service.js";
import { describe, expect, it, vi } from "vitest";
import { RuntimeService } from "../src/agent/runtime.service.js";

const runId = "00000000-0000-4000-8000-000000000001";
const userId = "user-1";

function runtime(status: string) {
  const prisma = {
    agentRun: { findFirst: vi.fn().mockResolvedValue({ status }) },
  } as unknown as PrismaService;
  const config = { get: () => 60_000 } as unknown as ConfigService<EnvConfig, true>;
  const service = new RuntimeService(
    config,
    prisma,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );
  return { prisma, service };
}

describe("暂停 Agent 生成", () => {
  it("中止活动流并等待持久化收尾完成", async () => {
    const { service } = runtime("running");
    const controller = new AbortController();
    let finish: () => void = () => {};
    const done = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const activeStreams = (
      service as unknown as {
        activeStreams: Map<
          string,
          { controller: AbortController; done: Promise<void>; finish: () => void }
        >;
      }
    ).activeStreams;
    activeStreams.set(runId, { controller, done, finish });

    let settled = false;
    const pause = service.pauseRun(userId, runId).then((result) => {
      settled = true;
      return result;
    });
    await vi.waitFor(() => expect(controller.signal.aborted).toBe(true));
    expect(settled).toBe(false);

    finish();
    await expect(pause).resolves.toEqual({ paused: true });
  });

  it("拒绝暂停已经结束的执行", async () => {
    const { service } = runtime("completed");

    await expect(service.pauseRun(userId, runId)).rejects.toMatchObject({
      code: "CONFLICT",
      status: 409,
    });
  });
});
