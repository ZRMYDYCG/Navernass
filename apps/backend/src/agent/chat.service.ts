import type { Prisma } from "../generated/prisma/client.js";
import type { MessageQuery, SessionQuery } from "./agent.schema.js";
import { Buffer } from "node:buffer";
import { Inject, Injectable } from "@nestjs/common";
import { AppError } from "../common/app-error.js";
import { PrismaService } from "../database/prisma.service.js";

interface MessageInput {
  sessionId: string;
  runId: string;
  userId: string;
  novelId: string;
  chapterId?: string;
  remoteId?: string;
  content: string;
  parts: unknown;
  metadata?: unknown;
}

interface MessageCursor {
  createdAt: string;
  id: string;
}

@Injectable()
export class ChatService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async saveUser(input: MessageInput) {
    return this.save("user", input);
  }

  async saveAssistant(input: MessageInput) {
    return this.save("assistant", input);
  }

  async promptHistory(userId: string, sessionId: string, limit = 20) {
    const messages = await this.prisma.agentMessage.findMany({
      where: { session_id: sessionId, user_id: userId },
      orderBy: [{ created_at: "desc" }, { id: "desc" }],
      take: limit,
      select: { role: true, content: true },
    });
    return messages
      .reverse()
      .map((message) => `${this.roleLabel(message.role)}：${message.content}`)
      .join("\n\n");
  }

  async listSessions(userId: string, query: SessionQuery) {
    const where = { user_id: userId, novel_id: query.novelId };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.agentSession.findMany({
        where,
        orderBy: { updated_at: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          _count: { select: { messages: true } },
          messages: {
            orderBy: [{ created_at: "desc" }, { id: "desc" }],
            take: 1,
            select: { role: true, content: true, created_at: true },
          },
        },
      }),
      this.prisma.agentSession.count({ where }),
    ]);
    return {
      data: data.map(({ messages, _count, ...session }) => ({
        ...session,
        messageCount: _count.messages,
        lastMessage: messages[0] ?? null,
      })),
      total,
    };
  }

  async listMessages(userId: string, sessionId: string, query: MessageQuery) {
    await this.requireSession(userId, sessionId);
    const cursor = query.cursor ? this.decodeCursor(query.cursor) : undefined;
    const rows = await this.prisma.agentMessage.findMany({
      where: {
        session_id: sessionId,
        user_id: userId,
        ...(cursor
          ? {
              OR: [
                { created_at: { lt: new Date(cursor.createdAt) } },
                { created_at: new Date(cursor.createdAt), id: { lt: cursor.id } },
              ],
            }
          : {}),
      },
      orderBy: [{ created_at: "desc" }, { id: "desc" }],
      take: query.limit + 1,
    });
    const hasMore = rows.length > query.limit;
    const page = rows.slice(0, query.limit);
    const oldest = page.at(-1);
    return {
      items: page.reverse(),
      nextCursor:
        hasMore && oldest
          ? this.encodeCursor({ createdAt: oldest.created_at.toISOString(), id: oldest.id })
          : null,
    };
  }

  async updateSession(userId: string, sessionId: string, title: string) {
    await this.requireSession(userId, sessionId);
    return this.prisma.agentSession.update({ where: { id: sessionId }, data: { title } });
  }

  async removeSession(userId: string, sessionId: string) {
    await this.requireSession(userId, sessionId);
    await this.prisma.agentSession.delete({ where: { id: sessionId } });
  }

  private async save(role: "user" | "assistant", input: MessageInput) {
    return this.prisma.$transaction(async (tx) => {
      const message = await tx.agentMessage.create({
        data: {
          session_id: input.sessionId,
          run_id: input.runId,
          user_id: input.userId,
          novel_id: input.novelId,
          chapter_id: input.chapterId,
          remote_id: input.remoteId,
          role,
          content: input.content,
          parts: this.json(input.parts),
          metadata: this.json(input.metadata ?? {}),
        },
      });
      // 会话列表按最近一条消息排序，因此每次写消息都显式刷新更新时间。
      await tx.agentSession.update({
        where: { id: input.sessionId },
        data: { updated_at: new Date() },
      });
      return message;
    });
  }

  private async requireSession(userId: string, sessionId: string) {
    const session = await this.prisma.agentSession.findFirst({
      where: { id: sessionId, user_id: userId },
    });
    if (!session) throw AppError.notFound("AGENT_SESSION_NOT_FOUND", "Agent 会话");
    return session;
  }

  private roleLabel(role: string) {
    if (role === "user") return "用户";
    if (role === "assistant") return "助手";
    if (role === "tool") return "工具";
    return "系统";
  }

  private json(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }

  private encodeCursor(cursor: MessageCursor) {
    return Buffer.from(JSON.stringify(cursor)).toString("base64url");
  }

  private decodeCursor(cursor: string): MessageCursor {
    try {
      const value = JSON.parse(
        Buffer.from(cursor, "base64url").toString("utf8"),
      ) as Partial<MessageCursor>;
      if (!value.createdAt || !value.id || Number.isNaN(new Date(value.createdAt).getTime()))
        throw new Error("invalid");
      return { createdAt: value.createdAt, id: value.id };
    } catch {
      throw new AppError("BAD_REQUEST", "消息游标无效");
    }
  }
}
