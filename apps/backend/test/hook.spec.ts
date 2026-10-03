import { describe, expect, it, vi } from "vitest";
import { HookDispatcher } from "../src/hook/hook.dispatcher.js";
import { HookHandlers } from "../src/hook/hook.handlers.js";
import { HookRegistry } from "../src/hook/hook.registry.js";
import type { HookEvent, ResolvedHook } from "../src/hook/hook.types.js";

const event: HookEvent = {
  eventId: "00000000-0000-4000-8000-000000000001",
  eventName: "session.start",
  traceId: "run-1",
  userId: "user-1",
  novelId: "novel-1",
  runId: "run-1",
  payload: { mode: "agent", role: "main", prompt: "不会进入日志" },
};

function hook(overrides: Partial<ResolvedHook> = {}): ResolvedHook {
  return {
    id: "hook-1",
    revision: 1,
    name: "会话审计",
    scopeType: "user",
    eventName: "session.start",
    effect: "observe",
    handlerKey: "audit.session",
    matcher: {},
    config: {},
    priority: 500,
    timeoutMs: 100,
    failureMode: "open",
    ...overrides,
  };
}

function dispatcher(
  resolved: ResolvedHook[],
  execute = vi.fn().mockResolvedValue({ effect: "observe" }),
) {
  const prisma = {
    hookDispatch: {
      create: vi.fn().mockResolvedValue({ id: "dispatch-1" }),
      update: vi.fn().mockResolvedValue({}),
    },
    hookExecution: {
      create: vi.fn().mockResolvedValue({ id: "execution-1" }),
      update: vi.fn().mockResolvedValue({}),
    },
  };
  const registry = { resolve: vi.fn().mockResolvedValue(resolved) };
  const handlers = {
    get: vi.fn().mockReturnValue({
      effect: "observe",
      events: ["session.start"],
      execute,
    }),
  };
  return {
    value: new HookDispatcher(prisma as never, registry as never, handlers as never),
    prisma,
  };
}

describe("Hook 基础设施", () => {
  it("按 scope、priority 和 id 生成确定性顺序并应用 matcher", async () => {
    const prisma = {
      hookDefinition: {
        upsert: vi.fn().mockResolvedValue({}),
        findMany: vi.fn().mockResolvedValue([
          {
            id: "novel-late",
            revision: 1,
            name: "小说 Hook",
            scope_type: "novel",
            event_name: "session_start",
            effect: "observe",
            handler_key: "audit.session",
            matcher: {},
            config: {},
            priority: 10,
            timeout_ms: 100,
            failure_mode: "open",
          },
          {
            id: "user-first",
            revision: 1,
            name: "用户 Hook",
            scope_type: "user",
            event_name: "session_start",
            effect: "observe",
            handler_key: "audit.session",
            matcher: { modes: ["agent"] },
            config: {},
            priority: 900,
            timeout_ms: 100,
            failure_mode: "open",
          },
          {
            id: "filtered",
            revision: 1,
            name: "不匹配",
            scope_type: "user",
            event_name: "session_start",
            effect: "observe",
            handler_key: "audit.session",
            matcher: { modes: ["plan"] },
            config: {},
            priority: 1,
            timeout_ms: 100,
            failure_mode: "open",
          },
        ]),
      },
    };
    const registry = new HookRegistry(prisma as never);

    const result = await registry.resolve(event);

    expect(result.map((item) => item.id)).toEqual(["user-first", "novel-late"]);
  });

  it("内置长期记忆 Hook 返回可注入的小说记忆", async () => {
    const prisma = {
      semanticMemory: {
        findMany: vi
          .fn()
          .mockResolvedValue([
            { kind: "summary", title: "上一章", content: "主角已经拿到了银色钥匙。" },
          ]),
      },
    };
    const handlers = new HookHandlers(prisma as never);
    const handler = handlers.get("novel.long-term-memory");

    const result = await handler!.execute(event, {}, new AbortController().signal);

    expect(result).toEqual({
      effect: "enrich",
      additions: [{ kind: "memory", content: "[summary] 上一章\n主角已经拿到了银色钥匙。" }],
    });
  });

  it("执行成功并对日志中的正文类字段脱敏", async () => {
    const test = dispatcher([hook()]);

    const result = await test.value.dispatch(event);

    expect(result).toMatchObject({ decision: "allow", matched: 1, succeeded: 1, failed: 0 });
    expect(test.prisma.hookDispatch.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          input_summary: expect.objectContaining({ prompt: "[已脱敏:6]" }),
        }),
      }),
    );
  });

  it("fail-closed Hook 失败时阻断流程", async () => {
    const execute = vi.fn().mockRejectedValue(new Error("boom"));
    const test = dispatcher([hook({ failureMode: "closed" })], execute);

    const result = await test.value.dispatch(event);

    expect(result).toMatchObject({ decision: "deny", succeeded: 0, failed: 1 });
    expect(test.prisma.hookDispatch.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "blocked" }) }),
    );
  });
});
