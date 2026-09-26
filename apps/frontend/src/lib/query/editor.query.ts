import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { applyEdit, getEditStatus, rejectEdit } from "@/lib/api/editor.api";

export const editorKeys = {
  edit: (id: string) => ["editor", "edits", id] as const,
};

/** 工具结果里的 status 是提案生成时的快照，刷新后需要以服务端为准。 */
export function useEditStatus(id: string, { enabled }: { enabled: boolean }) {
  return useQuery({
    queryKey: editorKeys.edit(id),
    queryFn: () => getEditStatus(id),
    enabled,
    staleTime: 30_000,
  });
}

export function useApplyEdit(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (acceptedEditIds: string[]) => applyEdit(id, acceptedEditIds),
    onSuccess: (data) => queryClient.setQueryData(editorKeys.edit(id), data),
    onError: () => queryClient.invalidateQueries({ queryKey: editorKeys.edit(id) }),
  });
}

export function useRejectEdit(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => rejectEdit(id),
    onSuccess: (data) => queryClient.setQueryData(editorKeys.edit(id), data),
    onError: () => queryClient.invalidateQueries({ queryKey: editorKeys.edit(id) }),
  });
}
