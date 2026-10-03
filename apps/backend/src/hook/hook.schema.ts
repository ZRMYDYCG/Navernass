import { z } from "zod";

export const hookEventName = z.enum([
  "session.start",
  "prompt.before_submit",
  "tool.before_use",
  "tool.after_use",
  "tool.use_failed",
  "content.after_edit",
  "agent.before_stop",
  "session.end",
]);

export const hookEffect = z.enum(["observe", "enrich", "guard", "follow_up"]);
export const hookFailureMode = z.enum(["open", "closed"]);
export const hookScopeType = z.enum(["user", "novel"]);

export const hookMatcher = z.object({
  modes: z
    .array(z.enum(["ask", "plan", "outline", "worldbook", "agent"]))
    .max(10)
    .optional(),
  roles: z
    .array(z.enum(["main", "character", "plot", "world", "style", "reviewer"]))
    .max(10)
    .optional(),
});

const hookFields = z.object({
  name: z.string().trim().min(1).max(100),
  novelId: z.uuid().optional(),
  scopeType: hookScopeType,
  eventName: hookEventName,
  effect: hookEffect,
  handlerKey: z.string().trim().min(1).max(100),
  matcher: hookMatcher.default({}),
  config: z.record(z.string(), z.unknown()).default({}),
  priority: z.number().int().min(0).max(1000).default(500),
  timeoutMs: z.number().int().min(50).max(30_000).default(3000),
  failureMode: hookFailureMode.default("open"),
  enabled: z.boolean().default(true),
});

export const createHook = hookFields.superRefine((value, context) => {
  if (value.scopeType === "novel" && !value.novelId) {
    context.addIssue({
      code: "custom",
      message: "novel scope 必须提供 novelId",
      path: ["novelId"],
    });
  }
  if (value.scopeType === "user" && value.novelId) {
    context.addIssue({
      code: "custom",
      message: "user scope 不能提供 novelId",
      path: ["novelId"],
    });
  }
});

export const updateHook = hookFields
  .omit({ scopeType: true, novelId: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, "至少提供一个更新字段");

export const hookQuery = z.object({
  novelId: z.uuid().optional(),
  eventName: hookEventName.optional(),
  enabled: z.coerce.boolean().optional(),
});

export const dispatchQuery = z.object({
  novelId: z.uuid().optional(),
  eventName: hookEventName.optional(),
  status: z.enum(["running", "completed", "blocked", "partial", "failed"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const uuidParams = z.object({ id: z.uuid() });

export type HookEventName = z.infer<typeof hookEventName>;
export type HookEffect = z.infer<typeof hookEffect>;
export type CreateHook = z.infer<typeof createHook>;
export type UpdateHook = z.infer<typeof updateHook>;
export type HookQuery = z.infer<typeof hookQuery>;
export type DispatchQuery = z.infer<typeof dispatchQuery>;
export type HookMatcher = z.infer<typeof hookMatcher>;

export const allowedEffects: Record<HookEventName, readonly HookEffect[]> = {
  "session.start": ["observe", "enrich"],
  "prompt.before_submit": ["observe", "enrich", "guard"],
  "tool.before_use": ["observe", "guard"],
  "tool.after_use": ["observe", "enrich"],
  "tool.use_failed": ["observe"],
  "content.after_edit": ["observe"],
  "agent.before_stop": ["observe", "follow_up"],
  "session.end": ["observe"],
};
