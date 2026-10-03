import type { Prisma } from "../generated/prisma/client.js";
import { Inject, Injectable } from "@nestjs/common";
import { AppError } from "../common/app-error.js";
import { PrismaService } from "../database/prisma.service.js";
import { HookHandlers } from "./hook.handlers.js";
import { deserializeEventName, HookRegistry, serializeEventName } from "./hook.registry.js";
import { allowedEffects } from "./hook.schema.js";
import type { CreateHook, DispatchQuery, HookQuery, UpdateHook } from "./hook.schema.js";

@Injectable()
export class HookService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(HookRegistry) private readonly registry: HookRegistry,
    @Inject(HookHandlers) private readonly handlers: HookHandlers,
  ) {}

  async list(userId: string, query: HookQuery) {
    const definitions = await this.prisma.hookDefinition.findMany({
      where: {
        user_id: userId,
        novel_id: query.novelId,
        event_name: query.eventName ? serializeEventName(query.eventName) : undefined,
        enabled: query.enabled,
      },
      orderBy: [{ scope_type: "asc" }, { priority: "asc" }, { id: "asc" }],
    });
    return definitions.map((definition) => this.toDefinition(definition));
  }

  async create(userId: string, input: CreateHook) {
    this.validateHandler(input.eventName, input.effect, input.handlerKey);
    if (input.novelId) await this.registry.assertNovelOwner(userId, input.novelId);
    const definition = await this.prisma.hookDefinition.create({
      data: {
        user_id: userId,
        novel_id: input.novelId,
        name: input.name,
        scope_type: input.scopeType,
        event_name: serializeEventName(input.eventName),
        effect: input.effect,
        handler_key: input.handlerKey,
        matcher: input.matcher,
        config: input.config as Prisma.InputJsonValue,
        priority: input.priority,
        timeout_ms: input.timeoutMs,
        failure_mode: input.failureMode,
        enabled: input.enabled,
      },
    });
    return this.toDefinition(definition);
  }

  async update(userId: string, id: string, input: UpdateHook) {
    const current = await this.findOwned(userId, id);
    const eventName = input.eventName ?? deserializeEventName(current.event_name);
    const effect = input.effect ?? current.effect;
    const handlerKey = input.handlerKey ?? current.handler_key;
    this.validateHandler(eventName, effect, handlerKey);
    const definition = await this.prisma.hookDefinition.update({
      where: { id },
      data: {
        name: input.name,
        event_name: input.eventName ? serializeEventName(input.eventName) : undefined,
        effect: input.effect,
        handler_key: input.handlerKey,
        matcher: input.matcher,
        config: input.config as Prisma.InputJsonValue | undefined,
        priority: input.priority,
        timeout_ms: input.timeoutMs,
        failure_mode: input.failureMode,
        enabled: input.enabled,
        revision: { increment: 1 },
      },
    });
    return this.toDefinition(definition);
  }

  async remove(userId: string, id: string) {
    await this.findOwned(userId, id);
    await this.prisma.hookDefinition.delete({ where: { id } });
  }

  async dispatches(userId: string, query: DispatchQuery) {
    const where = {
      user_id: userId,
      novel_id: query.novelId,
      event_name: query.eventName ? serializeEventName(query.eventName) : undefined,
      status: query.status,
    };
    const [data, total] = await Promise.all([
      this.prisma.hookDispatch.findMany({
        where,
        include: { executions: { orderBy: { started_at: "asc" } } },
        orderBy: { started_at: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.hookDispatch.count({ where }),
    ]);
    return {
      data: data.map((dispatch) => ({
        ...dispatch,
        event_name: deserializeEventName(dispatch.event_name),
      })),
      total,
    };
  }

  handlerCatalog() {
    return this.handlers.catalog();
  }

  private async findOwned(userId: string, id: string) {
    const definition = await this.prisma.hookDefinition.findFirst({
      where: { id, user_id: userId },
    });
    if (!definition) throw AppError.notFound("HOOK_NOT_FOUND", "Hook");
    return definition;
  }

  private validateHandler(
    eventName: CreateHook["eventName"],
    effect: CreateHook["effect"],
    handlerKey: string,
  ) {
    if (!allowedEffects[eventName].includes(effect)) {
      throw new AppError("HOOK_EVENT_EFFECT_MISMATCH", "该事件不支持指定的 Hook 效果", 400);
    }
    const handler = this.handlers.get(handlerKey);
    if (!handler) throw AppError.notFound("HOOK_HANDLER_NOT_FOUND", "Hook handler");
    if (handler.effect !== effect || !handler.events.includes(eventName)) {
      throw new AppError("HOOK_EVENT_EFFECT_MISMATCH", "Hook handler 与事件或效果不兼容", 400);
    }
  }

  private toDefinition(definition: {
    id: string;
    name: string;
    novel_id: string | null;
    scope_type: "system" | "user" | "novel";
    event_name: Parameters<typeof deserializeEventName>[0];
    effect: CreateHook["effect"];
    handler_key: string;
    matcher: unknown;
    config: unknown;
    priority: number;
    timeout_ms: number;
    failure_mode: "open" | "closed";
    enabled: boolean;
    revision: number;
    created_at: Date;
    updated_at: Date;
  }) {
    return {
      id: definition.id,
      name: definition.name,
      novelId: definition.novel_id,
      scopeType: definition.scope_type,
      eventName: deserializeEventName(definition.event_name),
      effect: definition.effect,
      handlerKey: definition.handler_key,
      matcher: definition.matcher,
      config: definition.config,
      priority: definition.priority,
      timeoutMs: definition.timeout_ms,
      failureMode: definition.failure_mode,
      enabled: definition.enabled,
      revision: definition.revision,
      createdAt: definition.created_at,
      updatedAt: definition.updated_at,
    };
  }
}
