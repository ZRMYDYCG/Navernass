import { z } from "zod";

import { apiRequest } from "@/lib/http/request";

import {
  createCustomSkillPayloadSchema,
  customSkillSchema,
  skillSchema,
  updateCustomSkillPayloadSchema,
  type CreateCustomSkillPayload,
  type UpdateCustomSkillPayload,
} from "./skill.schema";

const deletedSchema = z.object({ deleted: z.boolean() });

export function getSkills() {
  return apiRequest("skills?page=1&pageSize=100", z.array(skillSchema));
}

export function getCustomSkills() {
  return apiRequest("skills/custom", z.array(customSkillSchema));
}

export function createCustomSkill(payload: CreateCustomSkillPayload) {
  return apiRequest("skills/custom", customSkillSchema, {
    method: "post",
    json: createCustomSkillPayloadSchema.parse(payload),
  });
}

export function updateCustomSkill(id: string, payload: UpdateCustomSkillPayload) {
  return apiRequest(`skills/custom/${id}`, customSkillSchema, {
    method: "patch",
    json: updateCustomSkillPayloadSchema.parse(payload),
  });
}

export function deleteCustomSkill(id: string) {
  return apiRequest(`skills/custom/${id}`, deletedSchema, { method: "delete" });
}
