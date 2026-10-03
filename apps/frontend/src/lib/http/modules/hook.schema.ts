import { z } from "zod";

export const hookEventNameSchema = z.enum([
  "session.start",
  "prompt.before_submit",
  "tool.before_use",
  "tool.after_use",
  "tool.use_failed",
  "content.after_edit",
  "agent.before_stop",
  "session.end",
]);

export const hookEffectSchema = z.enum(["observe", "enrich", "guard", "follow_up"]);

export const hookDefinitionSchema = z.object({
  id: z.string(),
  builtin: z.boolean(),
  name: z.string(),
  novelId: z.string().nullable(),
  scopeType: z.enum(["system", "user", "novel"]),
  eventName: hookEventNameSchema,
  effect: hookEffectSchema,
  handlerKey: z.string(),
  matcher: z.record(z.string(), z.unknown()),
  config: z.record(z.string(), z.unknown()),
  priority: z.number(),
  timeoutMs: z.number(),
  failureMode: z.enum(["open", "closed"]),
  enabled: z.boolean(),
  revision: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const hookHandlerSchema = z.object({
  key: z.string(),
  effect: hookEffectSchema,
  events: z.array(hookEventNameSchema),
});

export const hookExecutionSchema = z.object({
  id: z.string(),
  hook_definition_id: z.string(),
  hook_revision: z.number(),
  status: z.enum([
    "running",
    "succeeded",
    "denied",
    "timed_out",
    "failed",
    "invalid_output",
    "skipped",
  ]),
  decision: z.string().nullable(),
  input_redacted: z.unknown(),
  output_redacted: z.unknown().nullable(),
  error_code: z.string().nullable(),
  error_message: z.string().nullable(),
  duration_ms: z.number().nullable(),
  started_at: z.string(),
  finished_at: z.string().nullable(),
});

export const hookDispatchSchema = z.object({
  id: z.string(),
  trace_id: z.string(),
  event_id: z.string(),
  event_name: hookEventNameSchema,
  status: z.enum(["running", "completed", "blocked", "partial", "failed"]),
  matched_count: z.number(),
  success_count: z.number(),
  failure_count: z.number(),
  decision: z.string().nullable(),
  duration_ms: z.number().nullable(),
  input_summary: z.unknown(),
  result_summary: z.unknown().nullable(),
  started_at: z.string(),
  finished_at: z.string().nullable(),
  executions: z.array(hookExecutionSchema),
});

export const createHookPayloadSchema = z.object({
  name: z.string().trim().min(1).max(100),
  scopeType: z.literal("user"),
  eventName: hookEventNameSchema,
  effect: hookEffectSchema,
  handlerKey: z.string(),
  matcher: z.record(z.string(), z.unknown()),
  config: z.record(z.string(), z.unknown()),
  priority: z.number().int().min(0).max(1000),
  timeoutMs: z.number().int().min(50).max(30_000),
  failureMode: z.enum(["open", "closed"]),
  enabled: z.boolean(),
});

export type HookEventName = z.infer<typeof hookEventNameSchema>;
export type HookDefinition = z.infer<typeof hookDefinitionSchema>;
export type HookHandler = z.infer<typeof hookHandlerSchema>;
export type HookDispatch = z.infer<typeof hookDispatchSchema>;
export type CreateHookPayload = z.infer<typeof createHookPayloadSchema>;
