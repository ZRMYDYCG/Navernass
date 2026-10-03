import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";
import type { HookEffect, HookEventName } from "./hook.schema.js";
import type { HookHandler } from "./hook.types.js";

interface RegisteredHandler {
  effect: HookEffect;
  events: readonly HookEventName[];
  execute: HookHandler;
}

@Injectable()
export class HookHandlers {
  private readonly handlers: Record<string, RegisteredHandler>;

  constructor(@Inject(PrismaService) prisma: PrismaService) {
    this.handlers = {
      "novel.long-term-memory": {
        effect: "enrich",
        events: ["session.start"],
        execute: async (event) => {
          if (!event.novelId) return { effect: "enrich", additions: [] };
          const memories = await prisma.semanticMemory.findMany({
            where: {
              user_id: event.userId,
              novel_id: event.novelId,
              kind: { in: ["summary", "conversation", "custom"] },
            },
            orderBy: { updated_at: "desc" },
            take: 8,
            select: { kind: true, title: true, content: true },
          });
          if (!memories.length) return { effect: "enrich", additions: [] };
          return {
            effect: "enrich",
            additions: [
              {
                kind: "memory",
                content: memories
                  .map(
                    (memory) =>
                      `[${memory.kind}] ${memory.title ?? "未命名记忆"}\n${memory.content.slice(0, 2000)}`,
                  )
                  .join("\n\n"),
              },
            ],
          };
        },
      },
      "audit.session": {
        effect: "observe",
        events: ["session.start", "session.end"],
        execute: async () => ({ effect: "observe" }),
      },
    };
  }

  get(key: string) {
    return this.handlers[key];
  }

  catalog() {
    return Object.entries(this.handlers).map(([key, handler]) => ({
      key,
      effect: handler.effect,
      events: handler.events,
    }));
  }
}
