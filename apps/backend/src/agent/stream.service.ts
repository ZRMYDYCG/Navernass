import type { UIMessageChunk } from "ai";
import type { Prisma } from "../generated/prisma/client.js";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { AppError } from "../common/app-error.js";
import { PrismaService } from "../database/prisma.service.js";

const terminalStates = new Set(["completed", "failed", "cancelled"]);

/** 持久化并重放官方 UIMessageChunk，使浏览器刷新后可以恢复同一条生成流。 */
@Injectable()
export class StreamService {
  private readonly logger = new Logger(StreamService.name);

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  attach(runId: string, source: ReadableStream<UIMessageChunk>) {
    const [clientStream, persistenceStream] = source.tee();
    // 客户端断开只取消 clientStream；persistence 分支继续消费，保证刷新后可重放。
    void this.persist(runId, persistenceStream).catch((error: unknown) => {
      this.logger.error(
        { runId, error: error instanceof Error ? error.message : String(error) },
        "持久化 Agent 流事件失败",
      );
    });
    return clientStream;
  }

  async latestSequence(runId: string) {
    const aggregate = await this.prisma.agentStreamEvent.aggregate({
      where: { run_id: runId },
      _max: { sequence: true },
    });
    return aggregate._max.sequence ?? 0;
  }

  async replay(userId: string, runId: string, after = 0) {
    const run = await this.prisma.agentRun.findFirst({
      where: { id: runId, user_id: userId },
      select: { id: true, session_id: true, status: true },
    });
    if (!run) throw AppError.notFound("AGENT_RUN_NOT_FOUND", "Agent 执行记录");
    if (!run.session_id) throw AppError.notFound("AGENT_SESSION_NOT_FOUND", "Agent 会话");

    let cancelled = false;
    return {
      stream: new ReadableStream<UIMessageChunk>({
        start: (controller) => {
          void this.replayLoop(runId, after, controller, () => cancelled).catch(
            (error: unknown) => {
              if (!cancelled) controller.error(error);
            },
          );
        },
        cancel: () => {
          cancelled = true;
        },
      }),
      runId: run.id,
      sessionId: run.session_id,
      status: run.status,
    };
  }

  private async persist(runId: string, stream: ReadableStream<UIMessageChunk>) {
    const aggregate = await this.prisma.agentStreamEvent.aggregate({
      where: { run_id: runId },
      _max: { sequence: true },
    });
    let sequence = (aggregate._max.sequence ?? 0) + 1;
    let buffered: UIMessageChunk | undefined;
    const flush = async () => {
      if (!buffered) return;
      await this.prisma.agentStreamEvent.create({
        data: {
          run_id: runId,
          sequence: sequence++,
          chunk: this.json(buffered),
        },
      });
      buffered = undefined;
    };

    for await (const chunk of stream) {
      if (
        buffered?.type === "text-delta" &&
        chunk.type === "text-delta" &&
        buffered.id === chunk.id &&
        !buffered.providerMetadata &&
        !chunk.providerMetadata &&
        buffered.delta.length < 512
      ) {
        buffered = { ...buffered, delta: buffered.delta + chunk.delta };
        continue;
      }
      await flush();
      buffered = chunk;
      if (chunk.type !== "text-delta") await flush();
    }
    await flush();
  }

  private async replayLoop(
    runId: string,
    initialAfter: number,
    controller: ReadableStreamDefaultController<UIMessageChunk>,
    isCancelled: () => boolean,
  ) {
    let cursor = initialAfter;
    let idleSince = Date.now();
    while (!isCancelled()) {
      const events = await this.prisma.agentStreamEvent.findMany({
        where: { run_id: runId, sequence: { gt: cursor } },
        orderBy: { sequence: "asc" },
        take: 200,
      });
      for (const event of events) {
        if (isCancelled()) return;
        controller.enqueue(event.chunk as unknown as UIMessageChunk);
        cursor = event.sequence;
        idleSince = Date.now();
      }
      if (events.length === 200) continue;
      const run = await this.prisma.agentRun.findUnique({
        where: { id: runId },
        select: { status: true },
      });
      if (!run || terminalStates.has(run.status)) {
        controller.close();
        return;
      }
      // 避免异常退出后永远占用重放连接；客户端仍可查询 Run 状态并选择重试。
      if (Date.now() - idleSince > 90_000) {
        controller.close();
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  private json(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }
}
