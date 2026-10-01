"use client";

import { useQueryClient } from "@tanstack/react-query";
import { readUIMessageStream } from "ai";
import { LoaderCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { AgentMessage } from "@/app/[locale]/(core)/workspace/_components/chat-panel/model/chat-types";
import {
  chatReducer,
  initialChatState,
} from "@/app/[locale]/(core)/workspace/_components/chat-panel/model/chat-machine";
import {
  findPendingQuestion,
  hasRenderablePart,
} from "@/app/[locale]/(core)/workspace/_components/chat-panel/model/message-utils";
import { StreamStore } from "@/app/[locale]/(core)/workspace/_components/chat-panel/model/stream-store";
import { useWorkspaceStore } from "@/stores";
import {
  answerAgentStream,
  pauseAgentRunIfActive,
  resumeAgentStream,
  startAgentStream,
} from "@/lib/http/modules/agent.api";
import { getErrorMessage } from "@/lib/http/error";
import {
  agentKeys,
  useChatSessions,
  useDeleteChatSession,
  useSessionMessages,
} from "@/servers/agent.server";
import { editorKeys } from "@/servers/editor.server";
import { libraryKeys } from "@/servers/library.server";
import type { AskUserOutput } from "@/lib/http/modules/agent.schema";

import { AskUserPanel } from "./ask-user-panel";
import { Composer } from "./chat-composer";
import { Messages } from "./chat-messages";
import { SessionSwitcher } from "./session-switcher";
import { Welcome } from "./chat-welcome";

interface ChatPanelProps {
  novelId?: string;
  chapterId?: string;
}

function getSessionId(message: AgentMessage | undefined) {
  return message?.metadata?.sessionId;
}

export function ChatPanel({ novelId, chapterId }: ChatPanelProps) {
  const t = useTranslations("chat");
  const queryClient = useQueryClient();
  // 组件按 novelId 重建，这里在挂载时读取该小说最近使用的会话。
  const storedSessionId = useWorkspaceStore((state) =>
    novelId ? state.sessionIds[novelId] : undefined,
  );
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialChatState,
    phase: storedSessionId ? "hydrating" : "idle",
    sessionId: storedSessionId,
  });
  const streamStore = useMemo(() => new StreamStore(), []);
  const abortRef = useRef<AbortController>(null);
  const resumedRunsRef = useRef(new Set<string>());
  const pauseRequestedViewsRef = useRef(new Set<number>());
  const sessionsQuery = useChatSessions(novelId);
  const messagesQuery = useSessionMessages(state.sessionId);
  const deleteSessionMutation = useDeleteChatSession();
  const sessions = sessionsQuery.data ?? [];
  const activeSession = sessions.find((session) => session.id === state.sessionId);

  const busy = state.phase === "streaming" || state.phase === "pausing";
  const canSend = Boolean(novelId) && !["hydrating", "streaming", "pausing"].includes(state.phase);
  const pendingQuestion = useMemo(
    () => (busy ? undefined : findPendingQuestion(state.messages)),
    [busy, state.messages],
  );

  const syncSelectedSession = useCallback(
    (sessionId: string | undefined) => {
      if (novelId) useWorkspaceStore.getState().selectSession(novelId, sessionId);
    },
    [novelId],
  );

  useEffect(() => {
    if (!state.sessionId || !messagesQuery.isSuccess) return;
    dispatch({ type: "HYDRATE", sessionId: state.sessionId, messages: messagesQuery.data });
  }, [messagesQuery.data, messagesQuery.isSuccess, state.sessionId]);

  useEffect(() => {
    if (!messagesQuery.error || !state.sessionId) return;
    dispatch({
      type: "FAIL",
      viewKey: state.viewKey,
      message: getErrorMessage(messagesQuery.error),
    });
  }, [messagesQuery.error, state.sessionId, state.viewKey]);

  const refreshSessionData = useCallback(
    (sessionId: string | undefined) => {
      if (novelId) {
        void queryClient.invalidateQueries({ queryKey: agentKeys.sessions(novelId), exact: true });
        void queryClient.invalidateQueries({
          queryKey: libraryKeys.chapters(novelId),
          exact: true,
        });
        void queryClient.invalidateQueries({
          queryKey: libraryKeys.volumes(novelId),
          exact: true,
        });
        void queryClient.invalidateQueries({
          queryKey: libraryKeys.characters(novelId),
          exact: true,
        });
        void queryClient.invalidateQueries({
          queryKey: libraryKeys.relationships(novelId),
          exact: true,
        });
      }
      if (chapterId) {
        void queryClient.invalidateQueries({
          queryKey: libraryKeys.chapter(chapterId),
          exact: true,
        });
      }
      if (sessionId) {
        void queryClient.invalidateQueries({
          queryKey: agentKeys.messages(sessionId),
          exact: true,
        });
      }
      void queryClient.invalidateQueries({ queryKey: editorKeys.pendingAll });
    },
    [chapterId, novelId, queryClient],
  );

  const consumeStream = useCallback(
    async (
      createStream: (signal: AbortSignal) => ReturnType<typeof startAgentStream>,
      viewKey: number,
      knownSessionId?: string,
      knownRunId?: string,
    ) => {
      const controller = new AbortController();
      abortRef.current = controller;
      let finalMessage: AgentMessage | undefined;
      let streamSessionId = knownSessionId;
      let streamRunId = knownRunId;
      const streamFallbackId = `assistant-${crypto.randomUUID()}`;
      streamStore.set({ id: streamFallbackId, role: "assistant", parts: [] });

      try {
        const stream = await createStream(controller.signal);
        refreshSessionData(streamSessionId);
        for await (const message of readUIMessageStream<AgentMessage>({
          stream,
          terminateOnError: true,
        })) {
          finalMessage = { ...message, id: streamFallbackId };
          streamStore.set(finalMessage);
          const assignedRunId = message.metadata?.runId;
          if (assignedRunId) resumedRunsRef.current.add(assignedRunId);
          const assignedSessionId = getSessionId(message);
          if (
            (assignedSessionId && assignedSessionId !== streamSessionId) ||
            (assignedRunId && assignedRunId !== streamRunId)
          ) {
            streamRunId = assignedRunId ?? streamRunId;
            dispatch({
              type: "STREAM_IDENTIFIED",
              sessionId: assignedSessionId,
              runId: assignedRunId,
              viewKey,
            });
          }
          if (assignedSessionId && assignedSessionId !== streamSessionId) {
            streamSessionId = assignedSessionId;
            syncSelectedSession(assignedSessionId);
            refreshSessionData(assignedSessionId);
          }
        }

        const message = finalMessage && hasRenderablePart(finalMessage) ? finalMessage : undefined;
        if (pauseRequestedViewsRef.current.has(viewKey)) {
          dispatch({
            type: "STOP",
            viewKey,
            message: message
              ? { ...message, metadata: { ...message.metadata, interrupted: true, paused: true } }
              : undefined,
          });
        } else {
          dispatch({ type: "STREAM_DONE", viewKey, message, sessionId: streamSessionId });
        }
      } catch (error) {
        if (controller.signal.aborted) {
          const pausedByUser = pauseRequestedViewsRef.current.has(viewKey);
          const message =
            finalMessage && hasRenderablePart(finalMessage)
              ? {
                  ...finalMessage,
                  metadata: {
                    ...finalMessage.metadata,
                    interrupted: true,
                    paused: pausedByUser,
                  },
                }
              : undefined;
          dispatch({
            type: "STOP",
            viewKey,
            message,
          });
        } else {
          dispatch({ type: "FAIL", viewKey, message: getErrorMessage(error) });
        }
      } finally {
        pauseRequestedViewsRef.current.delete(viewKey);
        if (abortRef.current === controller) abortRef.current = null;
        refreshSessionData(streamSessionId);
      }
    },
    [refreshSessionData, streamStore, syncSelectedSession],
  );

  useEffect(() => {
    const runId = activeSession?.activeRun?.id;
    if (!runId || state.phase !== "idle" || resumedRunsRef.current.has(runId)) return;
    resumedRunsRef.current.add(runId);
    const viewKey = state.viewKey;
    dispatch({ type: "RESUME", runId, viewKey });
    void consumeStream(
      (signal) => resumeAgentStream(runId, signal),
      viewKey,
      state.sessionId,
      runId,
    );
  }, [activeSession?.activeRun?.id, consumeStream, state.phase, state.sessionId, state.viewKey]);

  const selectSession = (sessionId: string | undefined) => {
    if (sessionId === state.sessionId) return;
    streamStore.set(undefined);
    dispatch({ type: "SELECT_SESSION", sessionId });
    syncSelectedSession(sessionId);
  };

  const deleteSession = (sessionId: string) => {
    deleteSessionMutation.mutate(sessionId, {
      onSuccess: () => {
        refreshSessionData(undefined);
        if (sessionId === state.sessionId) selectSession(undefined);
      },
    });
  };

  const sendPrompt = (prompt: string) => {
    const text = prompt.trim();
    if (!text || !canSend || !novelId) return;

    const message: AgentMessage = {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text }],
    };
    const viewKey = state.viewKey;
    dispatch({ type: "SEND", message });
    void consumeStream(
      (signal) =>
        startAgentStream(
          { novelId, ...(chapterId && { chapterId }) },
          text,
          state.sessionId,
          signal,
        ),
      viewKey,
      state.sessionId,
    );
  };

  const answerQuestion = (output: AskUserOutput) => {
    const sessionId = state.sessionId;
    if (!pendingQuestion || busy || !sessionId) return;
    const { toolCallId } = pendingQuestion;
    const viewKey = state.viewKey;
    dispatch({ type: "ANSWER", toolCallId, output });
    void consumeStream(
      (signal) => answerAgentStream(sessionId, toolCallId, output, signal),
      viewKey,
      sessionId,
    );
  };

  const pauseConversation = async () => {
    const runId = state.runId;
    if (!runId || state.phase !== "streaming") return;
    const viewKey = state.viewKey;
    pauseRequestedViewsRef.current.add(viewKey);
    dispatch({ type: "PAUSE", runId, viewKey });
    try {
      await pauseAgentRunIfActive(runId);
      abortRef.current?.abort();
    } catch (error) {
      pauseRequestedViewsRef.current.delete(viewKey);
      dispatch({ type: "PAUSE_FAILED", viewKey, message: getErrorMessage(error) });
    }
  };

  const showWelcome = state.messages.length === 0 && state.phase === "idle";

  return (
    <section className="flex h-full min-h-0 flex-col bg-card" aria-label={t("title")}>
      <SessionSwitcher
        sessions={sessions}
        activeSessionId={state.sessionId}
        disabled={state.phase === "hydrating" || busy}
        loading={sessionsQuery.isLoading}
        onSelect={(sessionId) => selectSession(sessionId)}
        onNew={() => selectSession(undefined)}
        onDelete={deleteSession}
      />

      {state.phase === "hydrating" ? (
        <div className="flex min-h-0 flex-1 items-center justify-center text-muted-foreground">
          <LoaderCircleIcon className="animate-spin" aria-label={t("sessions.loading")} />
        </div>
      ) : showWelcome ? (
        <div className="flex min-h-0 flex-1 overflow-y-auto">
          <div className="m-auto flex w-full max-w-md flex-col px-4 py-6">
            <Welcome disabled={!canSend} onSelectPrompt={sendPrompt}>
              <Composer
                className="p-0"
                busy={busy}
                pausing={state.phase === "pausing"}
                canPause={Boolean(state.runId)}
                canSend={canSend}
                onSubmit={sendPrompt}
                onPause={() => void pauseConversation()}
              />
            </Welcome>
          </div>
        </div>
      ) : (
        <Messages messages={state.messages} busy={busy} store={streamStore} />
      )}

      {state.error ? (
        <div className="px-4 pb-3">
          <Alert variant="destructive">
            <AlertTitle>{t("error.title")}</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        </div>
      ) : null}

      {pendingQuestion ? (
        <div className="px-4 pt-2">
          <AskUserPanel
            key={pendingQuestion.toolCallId}
            question={pendingQuestion}
            onSubmit={answerQuestion}
            onSkip={() => answerQuestion({ status: "skipped", reason: "user_skipped" })}
          />
        </div>
      ) : null}

      {showWelcome ? null : (
        <Composer
          busy={busy}
          pausing={state.phase === "pausing"}
          canPause={Boolean(state.runId)}
          canSend={canSend}
          onSubmit={sendPrompt}
          onPause={() => void pauseConversation()}
        />
      )}
    </section>
  );
}
