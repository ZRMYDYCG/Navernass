import { useMutation, useQuery } from "@tanstack/react-query";

import {
  deleteChatSession,
  getChatSessions,
  getSessionMessages,
} from "@/lib/http/modules/agent.api";

export const agentKeys = {
  sessions: (novelId: string) => ["agent", "novels", novelId, "sessions"] as const,
  messages: (sessionId: string) => ["agent", "sessions", sessionId, "messages"] as const,
};

export function useChatSessions(novelId: string | undefined) {
  return useQuery({
    queryKey: agentKeys.sessions(novelId ?? ""),
    queryFn: () => getChatSessions(novelId!),
    enabled: Boolean(novelId),
  });
}

export function useSessionMessages(sessionId: string | undefined) {
  return useQuery({
    queryKey: agentKeys.messages(sessionId ?? ""),
    queryFn: () => getSessionMessages(sessionId!),
    enabled: Boolean(sessionId),
  });
}

export function useDeleteChatSession() {
  return useMutation({ mutationFn: deleteChatSession });
}
