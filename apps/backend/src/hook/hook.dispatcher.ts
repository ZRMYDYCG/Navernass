import type { Prisma } from "../generated/prisma/client.js";
import { Inject, Injectable } from "@nestjs/common";
import { AppError } from "../common/app-error.js";
import { PrismaService } from "../database/prisma.service.js";
import { HookHandlers } from "./hook.handlers.js";
import { HookRegistry, serializeEventName } from "./hook.registry.js";
import type {
  HookDispatchResult,
  HookEvent,
  HookHandlerResult,
  ResolvedHook,
} from "./hook.types.js";

@Injectable()
export class HookDispatcher {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(HookRegistry) private readonly registry: HookRegistry,
    @Inject(HookHandlers) private readonly handlers: HookHandlers,
  ) {}

  async dispatch(event: HookEvent): Promise<HookDispatchResult> {
    const started = Date.now();
    const hooks = await this.registry.resolve(event);
    const dispatch = await this.prisma.hookDispatch.create({
      data: {
        user_id: event.userId,
        novel_id: event.novelId,
        run_id: event.runId,
        trace_id: event.traceId,
        event_id: event.eventId,
        event_name: serializeEventName(event.eventName),
        matched_count: hooks.length,
        input_summary: this.redact(event.payload),
      },
    });
    const result: HookDispatchResult = {
      dispatchId: dispatch.id,
      decision: "allow",
      additions: [],
      followUps: [],
      matched: hooks.length,
      succeeded: 0,
      failed: 0,
    };

    for (const hook of hooks) {
      const outcome = await this.execute(dispatch.id, event, hook);
      if (outcome.ok) {
        result.succeeded += 1;
        this.reduce(result, hook, outcome.value);
        if (result.decision === "deny") break;
      } else {
        result.failed += 1;
        if (hook.failureMode === "closed") {
          result.decision = "deny";
          break;
        }
      }
    }

    const status =
      result.decision === "deny"
        ? "blocked"
        : result.failed === 0
          ? "completed"
          : result.succeeded > 0
            ? "partial"
            : "failed";
    await this.prisma.hookDispatch.update({
      where: { id: dispatch.id },
      data: {
        status,
        success_count: result.succeeded,
        failure_count: result.failed,
        decision: result.decision,
        duration_ms: Date.now() - started,
        result_summary: this.redact({
          decision: result.decision,
          additions: result.additions.length,
          followUps: result.followUps.length,
        }),
        finished_at: new Date(),
      },
    });
    return result;
  }

  private async execute(dispatchId: string, event: HookEvent, hook: ResolvedHook) {
    const started = Date.now();
    const execution = await this.prisma.hookExecution.create({
      data: {
        dispatch_id: dispatchId,
        hook_definition_id: hook.id,
        hook_revision: hook.revision,
        input_redacted: this.redact(event.payload),
      },
    });
    const registered = this.handlers.get(hook.handlerKey);
    if (!registered) {
      await this.failExecution(
        execution.id,
        started,
        "HOOK_HANDLER_NOT_FOUND",
        "Hook handler 不存在",
      );
      return { ok: false as const };
    }
    if (registered.effect !== hook.effect || !registered.events.includes(event.eventName)) {
      await this.failExecution(
        execution.id,
        started,
        "HOOK_EVENT_EFFECT_MISMATCH",
        "Hook handler 与事件或效果不兼容",
      );
      return { ok: false as const };
    }

    try {
      const value = await this.withTimeout(
        registered.execute(event, hook.config, AbortSignal.timeout(hook.timeoutMs)),
        hook.timeoutMs,
      );
      if (value.effect !== hook.effect) throw new Error("Hook handler 返回了错误的 effect");
      const decision = value.effect === "guard" ? value.decision : undefined;
      await this.prisma.hookExecution.update({
        where: { id: execution.id },
        data: {
          status: decision === "deny" ? "denied" : "succeeded",
          decision,
          output_redacted: this.redact(value),
          duration_ms: Date.now() - started,
          finished_at: new Date(),
        },
      });
      return { ok: true as const, value };
    } catch (error) {
      const timedOut = error instanceof HookTimeoutError;
      await this.prisma.hookExecution.update({
        where: { id: execution.id },
        data: {
          status: timedOut ? "timed_out" : "failed",
          error_code: timedOut ? "HOOK_TIMEOUT" : "HOOK_EXECUTION_FAILED",
          error_message: error instanceof Error ? error.message.slice(0, 1000) : "未知错误",
          duration_ms: Date.now() - started,
          finished_at: new Date(),
        },
      });
      return { ok: false as const };
    }
  }

  private reduce(result: HookDispatchResult, hook: ResolvedHook, value: HookHandlerResult) {
    if (value.effect === "guard" && value.decision === "deny") result.decision = "deny";
    if (value.effect === "enrich") {
      result.additions.push(
        ...value.additions.map((addition) => ({ ...addition, hookId: hook.id })),
      );
    }
    if (value.effect === "follow_up" && value.continue && value.message) {
      result.followUps.push({ message: value.message, hookId: hook.id });
    }
  }

  private async failExecution(id: string, started: number, code: string, message: string) {
    await this.prisma.hookExecution.update({
      where: { id },
      data: {
        status: "invalid_output",
        error_code: code,
        error_message: message,
        duration_ms: Date.now() - started,
        finished_at: new Date(),
      },
    });
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
    let timeout: NodeJS.Timeout | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<never>((_, reject) => {
          timeout = setTimeout(() => reject(new HookTimeoutError()), timeoutMs);
        }),
      ]);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  private redact(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(
      JSON.stringify(value, (key, current) =>
        ["prompt", "content", "apiKey", "token", "secret"].includes(key) &&
        typeof current === "string"
          ? `[已脱敏:${current.length}]`
          : current,
      ),
    ) as Prisma.InputJsonValue;
  }
}

class HookTimeoutError extends AppError {
  constructor() {
    super("HOOK_EXECUTION_FAILED", "Hook 执行超时", 500);
  }
}
