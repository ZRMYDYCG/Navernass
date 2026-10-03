import { z } from "zod";

import { apiRequest } from "@/lib/http/request";

import {
  customSubagentSchema,
  subagentListSchema,
  subagentPayloadSchema,
  updateSubagentPayloadSchema,
  type SubagentPayload,
  type UpdateSubagentPayload,
} from "./subagent.schema";

const deletedSchema = z.object({ deleted: z.boolean() });

export function getSubagents() {
  return apiRequest("agent/subagents", subagentListSchema);
}

export function createSubagent(payload: SubagentPayload) {
  return apiRequest("agent/subagents", customSubagentSchema, {
    method: "post",
    json: subagentPayloadSchema.parse(payload),
  });
}

export function updateSubagent(id: string, payload: UpdateSubagentPayload) {
  return apiRequest(`agent/subagents/${id}`, customSubagentSchema, {
    method: "patch",
    json: updateSubagentPayloadSchema.parse(payload),
  });
}

export function deleteSubagent(id: string) {
  return apiRequest(`agent/subagents/${id}`, deletedSchema, { method: "delete" });
}
