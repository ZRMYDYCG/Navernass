import { z } from "zod";

import { apiRequest } from "@/lib/http/request";

import {
  createHookPayloadSchema,
  hookDefinitionSchema,
  hookDispatchSchema,
  hookHandlerSchema,
  type CreateHookPayload,
} from "./hook.schema";

const deletedSchema = z.object({ deleted: z.boolean() });

export function getHooks() {
  return apiRequest("hooks", z.array(hookDefinitionSchema));
}

export function getHookHandlers() {
  return apiRequest("hook-handlers", z.array(hookHandlerSchema));
}

export function getHookDispatches() {
  return apiRequest("hook-dispatches?page=1&pageSize=100", z.array(hookDispatchSchema));
}

export function createHook(payload: CreateHookPayload) {
  return apiRequest("hooks", hookDefinitionSchema, {
    method: "post",
    json: createHookPayloadSchema.parse(payload),
  });
}

export function updateHook(id: string, payload: Partial<CreateHookPayload>) {
  return apiRequest(`hooks/${id}`, hookDefinitionSchema, { method: "patch", json: payload });
}

export function deleteHook(id: string) {
  return apiRequest(`hooks/${id}`, deletedSchema, { method: "delete" });
}
