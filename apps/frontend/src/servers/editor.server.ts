import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  applyEdit,
  getEditStatus,
  getPendingEdit,
  rejectEdit,
} from "@/lib/http/modules/editor.api";
import { syncChapterCache } from "@/servers/library.server";

/**
 * 编辑提案数据使用的稳定缓存键。
 */
export const editorKeys = {
  edit: (id: string) => ["editor", "edits", id] as const,
  pendingAll: ["editor", "pending"] as const,
  pending: (chapterId: string) => ["editor", "pending", chapterId] as const,
};

/**
 * 获取编辑提案的最新状态；工具结果中的状态只作为生成时的快照。
 */
export function useEditStatus(id: string, { enabled }: { enabled: boolean }) {
  return useQuery({
    queryKey: editorKeys.edit(id),
    queryFn: () => getEditStatus(id),
    enabled,
    staleTime: 30_000,
  });
}

/**
 * 获取章节当前等待审阅的编辑提案。
 */
export function usePendingEdit(chapterId: string) {
  return useQuery({
    queryKey: editorKeys.pending(chapterId),
    queryFn: () => getPendingEdit(chapterId),
  });
}

/**
 * 应用选中的编辑项，并同步章节与待审阅提案缓存。
 */
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

/**
 * 拒绝编辑提案，并重新校准相关缓存。
 */
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
