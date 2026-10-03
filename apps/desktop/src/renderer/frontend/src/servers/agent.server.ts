import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteChatSession,
  getChatSessions,
  getSessionMessages,
  updateChatSession,
} from "@/lib/http/modules/agent.api";

/**
 * Agent 会话数据使用的稳定缓存键。
 */
export const agentKeys = {
  sessions: (novelId: string) => ["agent", "novels", novelId, "sessions"] as const,
  messages: (sessionId: string) => ["agent", "sessions", sessionId, "messages"] as const,
};

/**
 * 获取当前小说的聊天会话列表。
 */
export function useChatSessions(novelId: string | undefined) {
  return useQuery({
    queryKey: agentKeys.sessions(novelId ?? ""),
    queryFn: () => getChatSessions(novelId!),
    enabled: Boolean(novelId),
  });
}

/**
 * 获取指定会话的历史消息。
 */
export function useSessionMessages(sessionId: string | undefined) {
  return useQuery({
    queryKey: agentKeys.messages(sessionId ?? ""),
    queryFn: () => getSessionMessages(sessionId!),
    enabled: Boolean(sessionId),
  });
}

/**
 * 删除聊天会话。
 */
export function useDeleteChatSession() {
  return useMutation({ mutationFn: deleteChatSession });
}

export function useUpdateChatSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { pinned?: boolean; title?: string } }) =>
      updateChatSession(id, payload),
    onSuccess: (session) =>
      queryClient.invalidateQueries({ queryKey: agentKeys.sessions(session.novel_id) }),
  });
}
