import { apiRequest } from "@/lib/http/request";
import { editStatusResponseSchema } from "@/schemas/agent-tool.schema";

export function getEditStatus(id: string) {
  return apiRequest(`editor/edits/${id}`, editStatusResponseSchema);
}

export function applyEdit(id: string, acceptedEditIds: string[]) {
  return apiRequest(`editor/edits/${id}/apply`, editStatusResponseSchema, {
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
