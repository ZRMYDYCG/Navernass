"use client";

import { readUIMessageStream } from "ai";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useReducer, useRef } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { AgentMessage } from "@/lib/agent/chat-types";
import { chatReducer, initialChatState } from "@/lib/agent/chat-machine";
import { findPendingQuestion, hasRenderablePart } from "@/lib/agent/message-utils";
import { StreamStore } from "@/lib/agent/stream-store";
import { answerAgentStream, getSessionMessages, startAgentStream } from "@/lib/api/agent.api";
import { getErrorMessage } from "@/lib/http/error";
import type { AskUserOutput } from "@/schemas/agent.schema";

import { AskUserPanel } from "./ask-user";
import { Composer } from "./composer";
import { Messages } from "./messages";
import { Welcome } from "./welcome";

interface ChatPanelProps {
  novelId?: string;
  chapterId?: string;
  sessionId?: string;
}

function getSessionId(message: AgentMessage | undefined) {
  return message?.metadata?.sessionId;
}

function getDebugSessionStorageKey(novelId: string | undefined, chapterId: string | undefined) {
  if (!novelId) return undefined;
  return `narraverse:agent-session:${novelId}:${chapterId ?? "workspace"}`;
}

export function ChatPanel({ novelId, chapterId, sessionId: initialSessionId }: ChatPanelProps) {
  const t = useTranslations("chat");
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialChatState,
    sessionId: initialSessionId,
  });
  const streamStore = useMemo(() => new StreamStore(), []);
  const abortRef = useRef<AbortController>(null);
  const liveSessionRef = useRef<string | undefined>(undefined);
  const sessionStorageKey = useMemo(
    () => getDebugSessionStorageKey(novelId, chapterId),
    [novelId, chapterId],
  );

  const busy = state.phase === "streaming";
  const canSend = Boolean(novelId) && !busy;
  const pendingQuestion = useMemo(
    () => (busy ? undefined : findPendingQuestion(state.messages)),
    [busy, state.messages],
  );

  useEffect(() => {
    if (initialSessionId || !sessionStorageKey) return;
    const storedSessionId = window.localStorage.getItem(sessionStorageKey);
    if (storedSessionId) dispatch({ type: "RESTORE_SESSION", sessionId: storedSessionId });
  }, [initialSessionId, sessionStorageKey]);

  useEffect(() => {
    if (!state.sessionId || state.sessionId === liveSessionRef.current) return;
    let active = true;
    void getSessionMessages(state.sessionId)
      .then((messages) => {
        if (active) dispatch({ type: "HYDRATE", messages });
      })
      .catch((error: unknown) => {
        if (active) dispatch({ type: "FAIL", message: getErrorMessage(error) });
      });
    return () => {
      active = false;
    };
  }, [state.sessionId]);

  useEffect(() => {
    if (!state.sessionId || !sessionStorageKey) return;
    window.localStorage.setItem(sessionStorageKey, state.sessionId);

    const url = new URL(window.location.href);
    if (url.searchParams.get("sessionId") === state.sessionId) return;
    url.searchParams.set("sessionId", state.sessionId);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [sessionStorageKey, state.sessionId]);

  const consumeStream = async (
    createStream: (signal: AbortSignal) => ReturnType<typeof startAgentStream>,
  ) => {
    const controller = new AbortController();
    abortRef.current = controller;
    let finalMessage: AgentMessage | undefined;
    const streamFallbackId = `assistant-${crypto.randomUUID()}`;
    streamStore.set({ id: streamFallbackId, role: "assistant", parts: [] });

    try {
      const stream = await createStream(controller.signal);
      for await (const message of readUIMessageStream<AgentMessage>({
        stream,
        terminateOnError: true,
      })) {
        finalMessage = { ...message, id: streamFallbackId };
        streamStore.set(finalMessage);
      }

      liveSessionRef.current = getSessionId(finalMessage) ?? state.sessionId;
      dispatch({
        type: "STREAM_DONE",
        message: finalMessage && hasRenderablePart(finalMessage) ? finalMessage : undefined,
        sessionId: getSessionId(finalMessage) ?? state.sessionId,
      });
    } catch (error) {
      if (controller.signal.aborted) {
        dispatch({
          type: "STOP",
          message: finalMessage && hasRenderablePart(finalMessage) ? finalMessage : undefined,
        });
      } else {
        dispatch({ type: "FAIL", message: getErrorMessage(error) });
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const sendPrompt = (prompt: string) => {
    const text = prompt.trim();
    if (!text || !canSend || !novelId) return;

    const message: AgentMessage = {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text }],
    };
    dispatch({ type: "SEND", message });
    void consumeStream((signal) =>
      startAgentStream({ novelId, ...(chapterId && { chapterId }) }, text, state.sessionId, signal),
    );
  };

  const answerQuestion = (output: AskUserOutput) => {
    const sessionId = state.sessionId;
    if (!pendingQuestion || busy || !sessionId) return;
    const { toolCallId } = pendingQuestion;
    dispatch({ type: "ANSWER", toolCallId, output });
    void consumeStream((signal) => answerAgentStream(sessionId, toolCallId, output, signal));
  };

  // 空状态：欢迎页独立于消息滚动区，不参与消息布局。
  const showWelcome = state.messages.length === 0 && !busy;

  return (
    <section className="flex h-full min-h-0 flex-col bg-card" aria-label={t("title")}>
      {showWelcome ? (
        <div className="flex min-h-0 flex-1 overflow-y-auto">
          <div className="m-auto w-full px-4 py-6">
            <Welcome disabled={!canSend} onSelectPrompt={sendPrompt} />
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

      <Composer
        busy={busy}
        canSend={canSend}
        onSubmit={sendPrompt}
        onStop={() => abortRef.current?.abort()}
      />
    </section>
  );
}
