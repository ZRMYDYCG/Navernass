import type { ConfigService } from "@nestjs/config";
import type { EnvConfig } from "../src/config/env-schema.js";
import type { PrismaService } from "../src/database/prisma.service.js";
import { describe, expect, it, vi } from "vitest";
import { RuntimeService } from "../src/agent/runtime.service.js";

const runId = "00000000-0000-4000-8000-000000000001";
const userId = "user-1";

function runtime(status: string, started_at?: Date) {
  const prisma = {
    agentRun: { findFirst: vi.fn().mockResolvedValue({ status, started_at }) },
  } as unknown as PrismaService;
  const config = { get: () => 60_000 } as unknown as ConfigService<EnvConfig, true>;
  const traces = { cancelRun: vi.fn().mockResolvedValue(undefined) };
  const service = new RuntimeService(
    config,
    prisma,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    traces as never,
    {} as never,
    {} as never,
    {} as never,
  );
  return { prisma, service, traces };
}

describe("暂停 Agent 生成", () => {
  it("中止活动流并等待持久化收尾完成", async () => {
    const { service, traces } = runtime("running", new Date(Date.now() - 1000));
    const controller = new AbortController();
    let release: () => void = () => {};
    const cancelled = new Promise<void>((resolve) => {
      release = resolve;
    });
    traces.cancelRun.mockReturnValue(cancelled);
    const activeStreams = (
      service as unknown as {
        activeStreams: Map<string, { controller: AbortController }>;
      }
    ).activeStreams;
    activeStreams.set(runId, { controller });

    let settled = false;
    const pause = service.pauseRun(userId, runId).then((result) => {
      settled = true;
      return result;
    });
    await vi.waitFor(() => expect(controller.signal.aborted).toBe(true));
    expect(settled).toBe(false);

    release();
    await expect(pause).resolves.toEqual({ paused: true });
    expect(traces.cancelRun).toHaveBeenCalledWith(runId, expect.any(Number));
  });

  it("已结束的执行无需暂停", async () => {
    const { service } = runtime("completed");

    await expect(service.pauseRun(userId, runId)).resolves.toEqual({ paused: false });
  });
});
