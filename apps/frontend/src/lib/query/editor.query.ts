import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { applyEdit, getEditStatus, getPendingEdit, rejectEdit } from "@/lib/api/editor.api";
import { syncChapterCache } from "@/lib/query/library.query";

export const editorKeys = {
  edit: (id: string) => ["editor", "edits", id] as const,
  pendingAll: ["editor", "pending"] as const,
  pending: (chapterId: string) => ["editor", "pending", chapterId] as const,
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

export function usePendingEdit(chapterId: string) {
  return useQuery({
    queryKey: editorKeys.pending(chapterId),
    queryFn: () => getPendingEdit(chapterId),
  });
}

export function useApplyEdit(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (acceptedEditIds: string[]) => applyEdit(id, acceptedEditIds),
    onSuccess: ({ status, chapter }) => {
      queryClient.setQueryData(editorKeys.edit(id), { status });
      if (chapter) syncChapterCache(queryClient, chapter);
      void queryClient.invalidateQueries({ queryKey: editorKeys.pendingAll });
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: editorKeys.edit(id) });
      void queryClient.invalidateQueries({ queryKey: editorKeys.pendingAll });
    },
  });
}

export function useRejectEdit(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => rejectEdit(id),
    onSuccess: (data) => {
      queryClient.setQueryData(editorKeys.edit(id), data);
      void queryClient.invalidateQueries({ queryKey: editorKeys.pendingAll });
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: editorKeys.edit(id) });
      void queryClient.invalidateQueries({ queryKey: editorKeys.pendingAll });
    },
  });
}
