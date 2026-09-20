import type { ListTasksRequest, ListTasksResponse, Task } from "@a2a-js/sdk";
import type { ServerCallContext, TaskStore } from "@a2a-js/sdk/server";
import type { Prisma } from "../generated/prisma/client.js";
import { Buffer } from "node:buffer";
import { Task as TaskCodec, TaskState } from "@a2a-js/sdk";
import { RequestMalformedError } from "@a2a-js/sdk/errors";
import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";

interface PageCursor {
  updatedAt: string;
  id: string;
}

/** 使用 MySQL 持久化 A2A Task，确保重启后仍可查询并按调用者隔离。 */
@Injectable()
export class A2aTaskStore implements TaskStore {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async save(task: Task, context: ServerCallContext) {
    const userId = this.userId(context);
    await this.prisma.a2aTask.upsert({
      where: { id: task.id },
      create: {
        id: task.id,
        user_id: userId,
        context_id: task.contextId,
        state: String(task.status?.state ?? TaskState.TASK_STATE_UNSPECIFIED),
        payload: TaskCodec.toJSON(task) as Prisma.InputJsonValue,
      },
      update: {
        context_id: task.contextId,
        state: String(task.status?.state ?? TaskState.TASK_STATE_UNSPECIFIED),
        payload: TaskCodec.toJSON(task) as Prisma.InputJsonValue,
      },
    });
  }

  async load(taskId: string, context: ServerCallContext): Promise<Task | undefined> {
    const record = await this.prisma.a2aTask.findFirst({
      where: { id: taskId, user_id: this.userId(context) },
    });
    return record ? TaskCodec.fromJSON(record.payload) : undefined;
  }

  async list(params: ListTasksRequest, context: ServerCallContext): Promise<ListTasksResponse> {
    const userId = this.userId(context);
    const pageSize = Math.min(Math.max(params.pageSize ?? 50, 1), 100);
    const cursor = params.pageToken ? this.decodeCursor(params.pageToken) : undefined;
    const baseWhere: Prisma.A2aTaskWhereInput = {
      user_id: userId,
      ...(params.contextId && { context_id: params.contextId }),
      ...(params.status !== TaskState.TASK_STATE_UNSPECIFIED && { state: String(params.status) }),
      ...(params.statusTimestampAfter && {
        updated_at: { gte: new Date(params.statusTimestampAfter) },
      }),
    };
    const where: Prisma.A2aTaskWhereInput = {
      ...baseWhere,
      ...(cursor && {
        OR: [
          { updated_at: { lt: new Date(cursor.updatedAt) } },
          { updated_at: new Date(cursor.updatedAt), id: { lt: cursor.id } },
        ],
      }),
    };
    const [rows, totalSize] = await this.prisma.$transaction([
      this.prisma.a2aTask.findMany({
        where,
        orderBy: [{ updated_at: "desc" }, { id: "desc" }],
        take: pageSize + 1,
      }),
      this.prisma.a2aTask.count({ where: baseWhere }),
    ]);
    const hasMore = rows.length > pageSize;
    const page = rows.slice(0, pageSize);
    const tasks = page.map((row) => {
      const task = TaskCodec.fromJSON(row.payload);
      if (params.historyLength !== undefined) {
        task.history = params.historyLength === 0 ? [] : task.history.slice(-params.historyLength);
      }
      if (!params.includeArtifacts) task.artifacts = [];
      return task;
    });
    const last = page.at(-1);
    return {
      tasks,
      nextPageToken:
        hasMore && last
          ? this.encodeCursor({ updatedAt: last.updated_at.toISOString(), id: last.id })
          : "",
      pageSize,
      totalSize,
    };
  }

  private userId(context: ServerCallContext) {
    const user = context.user;
    if (!user?.isAuthenticated || !user.userName)
      throw new RequestMalformedError("A2A 请求缺少有效身份。");
    return user.userName;
  }

  private encodeCursor(cursor: PageCursor) {
    return Buffer.from(JSON.stringify(cursor)).toString("base64url");
  }

  private decodeCursor(value: string): PageCursor {
    try {
      const cursor = JSON.parse(
        Buffer.from(value, "base64url").toString("utf8"),
      ) as Partial<PageCursor>;
      if (!cursor.updatedAt || !cursor.id || Number.isNaN(new Date(cursor.updatedAt).getTime()))
        throw new Error("invalid cursor");
      return { updatedAt: cursor.updatedAt, id: cursor.id };
    } catch (error) {
      throw new RequestMalformedError({ message: "无效的 A2A pageToken。", cause: error });
    }
  }
}
