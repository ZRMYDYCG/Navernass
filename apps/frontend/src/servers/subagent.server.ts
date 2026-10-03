import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSubagent,
  deleteSubagent,
  getSubagents,
  updateSubagent,
} from "@/lib/http/modules/subagent.api";
import type { UpdateSubagentPayload } from "@/lib/http/modules/subagent.schema";

export const subagentKeys = {
  all: ["agent", "subagents"] as const,
};

export function useSubagents() {
  return useQuery({ queryKey: subagentKeys.all, queryFn: getSubagents });
}

export function useCreateSubagent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSubagent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: subagentKeys.all }),
  });
}

export function useUpdateSubagent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSubagentPayload }) =>
      updateSubagent(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: subagentKeys.all }),
  });
}

export function useDeleteSubagent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSubagent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: subagentKeys.all }),
  });
}
