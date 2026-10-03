import { Inject, Injectable } from "@nestjs/common";
import { AppError } from "../common/app-error.js";
import { PrismaService } from "../database/prisma.service.js";
import type { HookEventName, HookMatcher } from "./hook.schema.js";
import type { HookEvent, ResolvedHook } from "./hook.types.js";

const eventToDatabase = {
  "session.start": "session_start",
  "prompt.before_submit": "prompt_before_submit",
  "tool.before_use": "tool_before_use",
  "tool.after_use": "tool_after_use",
  "tool.use_failed": "tool_use_failed",
  "content.after_edit": "content_after_edit",
  "agent.before_stop": "agent_before_stop",
  "session.end": "session_end",
} as const;

const eventFromDatabase = Object.fromEntries(
  Object.entries(eventToDatabase).map(([event, database]) => [database, event]),
) as Record<(typeof eventToDatabase)[HookEventName], HookEventName>;

export function serializeEventName(eventName: HookEventName) {
  return eventToDatabase[eventName];
}

export function deserializeEventName(eventName: keyof typeof eventFromDatabase) {
  return eventFromDatabase[eventName];
}

@Injectable()
export class HookRegistry {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async resolve(event: HookEvent): Promise<ResolvedHook[]> {
    await this.ensureBuiltins(event.userId);
    const definitions = await this.prisma.hookDefinition.findMany({
      where: {
        user_id: event.userId,
        event_name: serializeEventName(event.eventName),
        enabled: true,
        deleted_at: null,
        OR: [
          { scope_type: "user" },
          ...(event.novelId ? [{ scope_type: "novel" as const, novel_id: event.novelId }] : []),
        ],
      },
    });

    return definitions
      .map((definition) => ({
        id: definition.id,
        revision: definition.revision,
        name: definition.name,
        scopeType: definition.scope_type,
        eventName: deserializeEventName(definition.event_name),
        effect: definition.effect,
        handlerKey: definition.handler_key,
        matcher: definition.matcher as HookMatcher,
        config: definition.config as Record<string, unknown>,
        priority: definition.priority,
        timeoutMs: definition.timeout_ms,
        failureMode: definition.failure_mode,
      }))
      .filter((hook) => this.matches(hook.matcher, event))
      .sort((left, right) => {
        const scope = this.scopeRank(left.scopeType) - this.scopeRank(right.scopeType);
        return scope || left.priority - right.priority || left.id.localeCompare(right.id);
      });
  }

  async ensureBuiltins(userId: string) {
    const builtins = [
      {
        builtinKey: "novel.long-term-memory",
        name: "小说长期记忆",
        eventName: "session_start" as const,
        effect: "enrich" as const,
        handlerKey: "novel.long-term-memory",
        priority: 200,
      },
      {
        builtinKey: "audit.session-start",
        name: "会话启动审计",
        eventName: "session_start" as const,
        effect: "observe" as const,
        handlerKey: "audit.session",
        priority: 900,
      },
      {
        builtinKey: "audit.session-end",
        name: "会话结束审计",
        eventName: "session_end" as const,
        effect: "observe" as const,
        handlerKey: "audit.session",
        priority: 900,
      },
    ];
    await Promise.all(
      builtins.map((builtin) =>
        this.prisma.hookDefinition.upsert({
          where: { user_id_builtin_key: { user_id: userId, builtin_key: builtin.builtinKey } },
          create: {
            user_id: userId,
            builtin_key: builtin.builtinKey,
            name: builtin.name,
            scope_type: "user",
            event_name: builtin.eventName,
            effect: builtin.effect,
            handler_key: builtin.handlerKey,
            matcher: {},
            config: {},
            priority: builtin.priority,
            timeout_ms: 3000,
            failure_mode: "open",
          },
          update: {},
        }),
      ),
    );
  }

  async assertNovelOwner(userId: string, novelId: string) {
    const novel = await this.prisma.novel.findFirst({
      where: { id: novelId, user_id: userId },
      select: { id: true },
    });
    if (!novel) throw AppError.notFound("NOVEL_NOT_FOUND", "小说");
  }

  private matches(matcher: HookMatcher, event: HookEvent) {
    if (
      matcher.modes?.length &&
      (!event.payload.mode || !matcher.modes.includes(event.payload.mode))
    )
      return false;
    if (
      matcher.roles?.length &&
      (!event.payload.role || !matcher.roles.includes(event.payload.role))
    )
      return false;
    return true;
  }

  private scopeRank(scope: ResolvedHook["scopeType"]) {
    return { system: 0, user: 1, novel: 2 }[scope];
  }
}
