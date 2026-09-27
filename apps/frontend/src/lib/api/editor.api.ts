import { z } from "zod";

import { apiRequest } from "@/lib/http/request";
import { editStatusResponseSchema } from "@/schemas/agent-tool.schema";
import { applyEditResponseSchema, chapterEditSchema } from "@/schemas/editor.schema";

export function getEditStatus(id: string) {
  return apiRequest(`editor/edits/${id}`, editStatusResponseSchema);
}

/** 章节最新的待审阅提案；列表按创建时间倒序。 */
export async function getPendingEdit(chapterId: string) {
  const edits = await apiRequest("editor/edits", z.array(chapterEditSchema), {
    searchParams: { chapterId, status: "pending", pageSize: 1 },
  });
  return edits[0] ?? null;
}

export function applyEdit(id: string, acceptedEditIds: string[]) {
  return apiRequest(`editor/edits/${id}/apply`, applyEditResponseSchema, {
    method: "post",
    json: { acceptedEditIds },
  });
}

export function rejectEdit(id: string) {
  return apiRequest(`editor/edits/${id}/reject`, editStatusResponseSchema, {
    method: "post",
    json: {},
  });
}
