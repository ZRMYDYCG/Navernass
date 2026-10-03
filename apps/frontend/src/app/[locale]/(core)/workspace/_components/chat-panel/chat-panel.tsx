"use client";

import { useQueryClient } from "@tanstack/react-query";
import { getToolName, isToolUIPart, readUIMessageStream } from "ai";
import { LoaderCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

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
import {
  askUserInputSchema,
  type AskUserOutput,
  type ChatSession,
} from "@/lib/http/modules/agent.schema";
import {
  articleWriteOutputSchema,
  chapterOutputSchema,
} from "@/lib/http/modules/agent-tool.schema";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AskUserPanel } from "./ask-user-panel";
import { Composer } from "./chat-composer";
import { Messages, StreamingMessageStore } from "./chat-messages";
import type { ActivationBlock } from "@/components/buss/prompt-input";
import { chatReducer, initialChatState } from "./machine";
import { SessionSwitcher } from "./session-switcher";
import type { ChatMessage } from "./types";

interface ChatPanelProps {
  novelId?: string;
  chapterId?: string;
  onBeforeSend?: () => Promise<void> | void;
  /** Agents 窗口由侧栏切换会话，不需要面板内的会话栏。 */
  sessionSwitcher?: boolean;
  agentSidebarOpen?: boolean;
  onToggleAgentSidebar?: () => void;
  newAgentRequest?: number;
  openDraftRequest?: { id: string; count: number };
  /** 传入时空会话改为居中输入框布局，内容渲染在输入框上方。 */
  welcomeHeader?: ReactNode;
}

function getSessionId(message: ChatMessage | undefined) {
  return message?.metadata?.sessionId;
}

const askUserPartType = "tool-askUser";

/** 消息是否包含可渲染内容（非空文本、推理或工具调用）。 */
function hasRenderablePart(message: ChatMessage) {
  return message.parts.some(
    (part) =>
      ((part.type === "text" || part.type === "reasoning") && part.text.trim()) ||
      isToolUIPart(part),
  );
}

/** 只有最后一条助手消息里尚未得到结果的 askUser 才需要弹出面板。 */
function findPendingQuestion(messages: ChatMessage[]) {
  const last = messages.at(-1);
  if (last?.role !== "assistant") return undefined;
  for (const part of last.parts) {
    if (part.type !== askUserPartType || !isToolUIPart(part)) continue;
    if (part.state !== "input-available") continue;
    const input = askUserInputSchema.safeParse(part.input);
    if (input.success) return { toolCallId: part.toolCallId, input: input.data };
  }
  return undefined;
}

export const chapterWritingTools = new Set(["editArticle", "writeArticle", "patchArticle"]);
const emptySessions: ChatSession[] = [];

export interface AgentTab {
  id: string;
  sessionId?: string;
}

function createAgentTab(sessionId?: string): AgentTab {
  return { id: crypto.randomUUID(), sessionId };
}

export function ChatPanel({
  novelId,
  chapterId,
  onBeforeSend,
  sessionSwitcher = true,
  agentSidebarOpen,
  onToggleAgentSidebar,
  newAgentRequest = 0,
  openDraftRequest,
  welcomeHeader,
}: ChatPanelProps) {
  const t = useTranslations("chat");
  const queryClient = useQueryClient();
  // 组件按 novelId 重建，这里在挂载时读取该小说最近使用的会话。
  const storedSessionId = useWorkspaceStore((state) =>
    novelId ? state.sessionIds[novelId] : undefined,
  );
  const agentDrafts = useWorkspaceStore((state) => state.agentDrafts);
  const upsertAgentDraft = useWorkspaceStore((state) => state.upsertAgentDraft);
  const updateAgentDraftText = useWorkspaceStore((state) => state.updateAgentDraftText);
  const removeAgentDraft = useWorkspaceStore((state) => state.removeAgentDraft);
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialChatState,
    phase: storedSessionId ? "hydrating" : "idle",
    sessionId: storedSessionId,
  });
  const [initialAgentId] = useState(() => crypto.randomUUID());
  const [agentTabs, setAgentTabs] = useState<AgentTab[]>(() => [
    { id: initialAgentId, sessionId: storedSessionId },
  ]);
  const [activeAgentId, setActiveAgentId] = useState(initialAgentId);
  const activeAgentIdRef = useRef(activeAgentId);
  const handledNewAgentRequestRef = useRef(newAgentRequest);
  const streamStore = useMemo(() => new StreamingMessageStore(), []);
  const abortRef = useRef<AbortController>(null);
  const resumedRunsRef = useRef(new Set<string>());
  const pauseRequestedViewsRef = useRef(new Set<number>());
  const handledToolOutputsRef = useRef(new Set<string>());
  const sessionsQuery = useChatSessions(novelId);
  const messagesQuery = useSessionMessages(state.sessionId);
  const deleteSessionMutation = useDeleteChatSession();
  const sessions = sessionsQuery.data ?? emptySessions;
  const activeSession = sessions.find((session) => session.id === state.sessionId);
  const activeDraft = agentDrafts[activeAgentId];
  const orderedAgentTabs = useMemo(
    () =>
      [...agentTabs].sort((a, b) => {
        const aPinned = a.sessionId
          ? sessions.find((session) => session.id === a.sessionId)?.pinned
          : agentDrafts[a.id]?.pinned;
        const bPinned = b.sessionId
          ? sessions.find((session) => session.id === b.sessionId)?.pinned
          : agentDrafts[b.id]?.pinned;
        return Number(bPinned) - Number(aPinned);
      }),
    [agentDrafts, agentTabs, sessions],
  );

  useEffect(() => {
    activeAgentIdRef.current = activeAgentId;
  }, [activeAgentId]);

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
    if (storedSessionId === state.sessionId) return;
    streamStore.set(undefined);
    dispatch({ type: "SELECT_SESSION", sessionId: storedSessionId });
    // oxlint-disable-next-line react/set-state-in-effect -- 外部 workspace store 切换会话时，需要同步本地 Agent tabs。
    setAgentTabs((tabs) => {
      if (!storedSessionId) {
        if (!state.sessionId) return tabs;
        const tab = createAgentTab();
        setActiveAgentId(tab.id);
        return [...tabs, tab];
      }
      const existing = tabs.find((tab) => tab.sessionId === storedSessionId);
      if (existing) {
        setActiveAgentId(existing.id);
        return tabs;
      }
      const tab = createAgentTab(storedSessionId);
      setActiveAgentId(tab.id);
      return [...tabs, tab];
    });
  }, [state.sessionId, storedSessionId, streamStore]);

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

  const handleToolEffects = useCallback(
    (message: ChatMessage) => {
      if (!novelId) return;

      for (const part of message.parts) {
        if (!isToolUIPart(part) || part.state !== "output-available") continue;
        const key = `${part.toolCallId}:output`;
        if (handledToolOutputsRef.current.has(key)) continue;
        handledToolOutputsRef.current.add(key);

        const toolName = getToolName(part);
        if (toolName === "createChapter") {
          const parsed = chapterOutputSchema.safeParse(part.output);
          if (!parsed.success) continue;
          void queryClient.invalidateQueries({
            queryKey: libraryKeys.chapters(novelId),
            exact: true,
          });
          void queryClient.invalidateQueries({
            queryKey: libraryKeys.chapter(parsed.data.id),
            exact: true,
          });
          useWorkspaceStore.getState().selectChapter(parsed.data.id);
          continue;
        }

        if (toolName === "renameChapter") {
          const parsed = chapterOutputSchema.safeParse(part.output);
          if (!parsed.success) continue;
          void queryClient.invalidateQueries({
            queryKey: libraryKeys.chapters(novelId),
            exact: true,
          });
          void queryClient.invalidateQueries({
            queryKey: libraryKeys.chapter(parsed.data.id),
            exact: true,
          });
          continue;
        }

        if (toolName === "createVolume") {
          void queryClient.invalidateQueries({
            queryKey: libraryKeys.volumes(novelId),
            exact: true,
          });
          continue;
        }

        if (chapterWritingTools.has(toolName)) {
          const parsed = articleWriteOutputSchema.safeParse(part.output);
          if (!parsed.success) continue;
          void queryClient.invalidateQueries({
            queryKey: libraryKeys.chapter(parsed.data.chapterId),
            exact: true,
          });
          void queryClient.invalidateQueries({
            queryKey: libraryKeys.chapters(novelId),
            exact: true,
          });
        }
      }
    },
    [novelId, queryClient],
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
      let finalMessage: ChatMessage | undefined;
      let streamSessionId = knownSessionId;
      let streamRunId = knownRunId;
      const streamFallbackId = `assistant-${crypto.randomUUID()}`;
      streamStore.set({ id: streamFallbackId, role: "assistant", parts: [] });

      try {
        const stream = await createStream(controller.signal);
        refreshSessionData(streamSessionId);
        for await (const message of readUIMessageStream<ChatMessage>({
          stream,
          terminateOnError: true,
        })) {
          finalMessage = { ...message, id: streamFallbackId };
          streamStore.set(finalMessage);
          handleToolEffects(message);
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
            setAgentTabs((tabs) =>
              tabs.map((tab) =>
                tab.id === activeAgentIdRef.current
                  ? { ...tab, sessionId: assignedSessionId }
                  : tab,
              ),
            );
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
    [handleToolEffects, refreshSessionData, streamStore, syncSelectedSession],
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
    if (sessionId) {
      setAgentTabs((tabs) => {
        const existing = tabs.find((tab) => tab.sessionId === sessionId);
        if (existing) {
          setActiveAgentId(existing.id);
          return tabs;
        }
        const tab = createAgentTab(sessionId);
        setActiveAgentId(tab.id);
        return [...tabs, tab];
      });
    }
    streamStore.set(undefined);
    dispatch({ type: "SELECT_SESSION", sessionId });
    syncSelectedSession(sessionId);
  };

  const selectAgentTab = (tab: AgentTab) => {
    if (tab.id === activeAgentId) return;
    setActiveAgentId(tab.id);
    streamStore.set(undefined);
    dispatch({ type: "SELECT_SESSION", sessionId: tab.sessionId });
    syncSelectedSession(tab.sessionId);
  };

  const newAgentTab = useCallback(() => {
    const tab = createAgentTab();
    setAgentTabs((tabs) => [...tabs, tab]);
    setActiveAgentId(tab.id);
    streamStore.set(undefined);
    dispatch({ type: "SELECT_SESSION", sessionId: undefined });
    syncSelectedSession(undefined);
  }, [streamStore, syncSelectedSession]);

  const updateActiveDraft = (text: string) => {
    if (!novelId || state.sessionId) return;
    const existing = agentDrafts[activeAgentId];
    if (existing) {
      updateAgentDraftText(activeAgentId, text);
      return;
    }
    if (!text.trim()) return;
    const now = Date.now();
    upsertAgentDraft({
      id: activeAgentId,
      novelId,
      text,
      createdAt: now,
      updatedAt: now,
    });
  };

  useEffect(() => {
    if (handledNewAgentRequestRef.current === newAgentRequest) return;
    handledNewAgentRequestRef.current = newAgentRequest;
    newAgentTab();
  }, [newAgentRequest, newAgentTab]);

  useEffect(() => {
    if (!openDraftRequest) return;
    const draft = agentDrafts[openDraftRequest.id];
    if (!draft) return;
    // oxlint-disable-next-line react/set-state-in-effect -- 右侧草稿列表选择时需要同步打开对应本地 Agent tab。
    setAgentTabs((tabs) => {
      const existing = tabs.find((tab) => tab.id === draft.id);
      if (existing) return tabs;
      return [...tabs, { id: draft.id }];
    });
    setActiveAgentId(draft.id);
    streamStore.set(undefined);
    dispatch({ type: "SELECT_SESSION", sessionId: undefined });
    syncSelectedSession(undefined);
  }, [agentDrafts, openDraftRequest, streamStore, syncSelectedSession]);

  const closeAgentTab = (id: string) => {
    setAgentTabs((tabs) => {
      if (tabs.length === 1) return tabs;
      const index = tabs.findIndex((tab) => tab.id === id);
      const next = tabs.filter((tab) => tab.id !== id);
      if (id === activeAgentId) {
        const target = next[Math.max(0, index - 1)] ?? next[0];
        if (target) {
          setActiveAgentId(target.id);
          streamStore.set(undefined);
          dispatch({ type: "SELECT_SESSION", sessionId: target.sessionId });
          syncSelectedSession(target.sessionId);
        }
      }
      return next;
    });
  };

  const deleteSession = (sessionId: string) => {
    deleteSessionMutation.mutate(sessionId, {
      onSuccess: () => {
        refreshSessionData(undefined);
        if (sessionId === state.sessionId) selectSession(undefined);
      },
    });
  };

  const sendPrompt = async (prompt: string, activationBlocks: ActivationBlock[]) => {
    const text = prompt.trim();
    if (!text || !canSend || !novelId) return;
    await onBeforeSend?.();
    if (!state.sessionId) removeAgentDraft(activeAgentId);

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      metadata: { activationBlocks },
      parts: [{ type: "text", text }],
    };
    const viewKey = state.viewKey;
    dispatch({ type: "SEND", message });
    void consumeStream(
      (signal) =>
        startAgentStream(
          { novelId, ...(chapterId && { chapterId }), activationBlocks },
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
    const controller = abortRef.current;
    pauseRequestedViewsRef.current.add(viewKey);
    dispatch({ type: "PAUSE", runId, viewKey });
    try {
      await pauseAgentRunIfActive(runId);
      controller?.abort();
    } catch (error) {
      pauseRequestedViewsRef.current.delete(viewKey);
      dispatch({ type: "PAUSE_FAILED", viewKey, message: getErrorMessage(error) });
    }
  };

  const showWelcome = state.messages.length === 0 && state.phase === "idle";
  const composerProps = {
    novelId,
    value: state.sessionId ? undefined : (activeDraft?.text ?? ""),
    onChange: updateActiveDraft,
    busy,
    pausing: state.phase === "pausing",
    canPause: Boolean(state.runId),
    canSend,
    onSubmit: sendPrompt,
    onPause: () => void pauseConversation(),
  };

  return (
    <section className="flex h-full min-h-0 flex-col bg-card" aria-label={t("title")}>
      {sessionSwitcher ? (
        <SessionSwitcher
          sessions={sessions}
          activeAgentId={activeAgentId}
          agentTabs={orderedAgentTabs}
          disabled={state.phase === "hydrating" || busy}
          loading={sessionsQuery.isLoading}
          error={sessionsQuery.error ? getErrorMessage(sessionsQuery.error) : undefined}
          onRetry={() => void sessionsQuery.refetch()}
          onSelectAgentTab={selectAgentTab}
          onSelect={(sessionId) => selectSession(sessionId)}
          onNew={newAgentTab}
          onCloseAgentTab={closeAgentTab}
          onDelete={deleteSession}
          agentSidebarOpen={agentSidebarOpen}
          onToggleAgentSidebar={onToggleAgentSidebar}
        />
      ) : null}

      {state.phase === "hydrating" ? (
        <div className="flex min-h-0 flex-1 items-center justify-center text-muted-foreground">
          <LoaderCircleIcon className="animate-spin" aria-label={t("sessions.loading")} />
        </div>
      ) : showWelcome && welcomeHeader ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 pb-24">
          <div className="flex w-full max-w-2xl flex-col gap-2">
            {welcomeHeader}
            <Composer className="p-0" {...composerProps} />
            <PromptChips disabled={!canSend} onSelect={updateActiveDraft} />
          </div>
        </div>
      ) : showWelcome ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <Composer className="mx-auto w-full max-w-3xl p-0" {...composerProps} />
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

      {showWelcome ? null : <Composer {...composerProps} />}
    </section>
  );
}

const PROMPT_CHIPS = ["continue", "plot", "character", "polish"] as const;

function PromptChips({
  disabled,
  onSelect,
}: {
  disabled: boolean;
  onSelect: (prompt: string) => void;
}) {
  const t = useTranslations("chat.welcome.actions");
  return (
    <div className="flex flex-wrap gap-2">
      {PROMPT_CHIPS.map((id) => (
        <button
          key={id}
          type="button"
          disabled={disabled}
          className="h-6 rounded-full border border-border px-2.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
          onClick={() => onSelect(t(`${id}.prompt`))}
        >
          {t(`${id}.title`)}
        </button>
      ))}
    </div>
  );
}
