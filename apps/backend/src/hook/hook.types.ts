import type { HookEffect, HookEventName, HookMatcher } from "./hook.schema.js";

export interface HookEventPayload {
  mode?: "ask" | "plan" | "outline" | "worldbook" | "agent";
  role?: "main" | "character" | "plot" | "world" | "style" | "reviewer";
  [key: string]: unknown;
}

export interface HookEvent {
  eventId: string;
  eventName: HookEventName;
  traceId: string;
  userId: string;
  novelId?: string;
  runId?: string;
  payload: HookEventPayload;
}

export interface ResolvedHook {
  id: string;
  revision: number;
  name: string;
  scopeType: "system" | "user" | "novel";
  eventName: HookEventName;
  effect: HookEffect;
  handlerKey: string;
  matcher: HookMatcher;
  config: Record<string, unknown>;
  priority: number;
  timeoutMs: number;
  failureMode: "open" | "closed";
}

export type HookHandlerResult =
  | { effect: "observe" }
  | { effect: "enrich"; additions: Array<{ kind: string; content: string }> }
  | { effect: "guard"; decision: "allow" | "deny"; reason?: string }
  | { effect: "follow_up"; continue: boolean; message?: string };

export interface HookDispatchResult {
  dispatchId: string;
  decision: "allow" | "deny";
  additions: Array<{ kind: string; content: string; hookId: string }>;
  followUps: Array<{ message: string; hookId: string }>;
  matched: number;
  succeeded: number;
  failed: number;
}

export type HookHandler = (
  event: HookEvent,
  config: Record<string, unknown>,
  signal: AbortSignal,
) => Promise<HookHandlerResult>;
