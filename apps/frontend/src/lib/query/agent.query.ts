import { useQuery } from "@tanstack/react-query";

import { getChatSessions, getSessionMessages } from "@/lib/api/agent.api";

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
