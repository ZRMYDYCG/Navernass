"use client";

import { readUIMessageStream } from "ai";
import { SendHorizontalIcon, SquareIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { AskUser } from "@/components/buss/agui/ask-user";
import { ChatWelcome } from "@/components/buss/agui/chat-welcome";
import { MessageView, StreamingMessageView } from "@/components/buss/agui/message-view";
import { PromptInput } from "@/components/buss/prompt-input/prompt-input";
import type { PromptInputHandle } from "@/components/buss/prompt-input/prompt-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InputGroupButton } from "@/components/ui/input-group";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { chatReducer, initialChatState } from "@/lib/agent/chat-machine";
import type { AgentContext, AgentMessage, AnswerValue } from "@/lib/agent/chat-types";
import { hasRenderablePart } from "@/lib/agent/message-utils";
import { StreamStore } from "@/lib/agent/stream-store";
import {
  answerAgentStream,
  dismissQuestion,
  getPendingQuestion,
  getSessionMessages,
  startAgentStream,
} from "@/lib/api/agent.api";
import { getErrorMessage } from "@/lib/http/error";

interface ChatPanelProps {
  novelId?: string;
  chapterId?: string;
  sessionId?: string;
}

function getSessionId(message: AgentMessage | undefined) {
  return message?.metadata?.sessionId;
}

export function ChatPanel({ novelId, chapterId, sessionId: initialSessionId }: ChatPanelProps) {
  const t = useTranslations("chat");
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialChatState,
    sessionId: initialSessionId,
  });
  const [draft, setDraft] = useState("");
  const streamStore = useMemo(() => new StreamStore(), []);
  const abortRef = useRef<AbortController>(null);
  const inputRef = useRef<PromptInputHandle>(null);

  const busy = state.phase === "streaming";
  const canSend = Boolean(novelId) && !busy && !state.question;

  useEffect(() => {
    if (!initialSessionId) return;
    let active = true;
    void Promise.all([getSessionMessages(initialSessionId), getPendingQuestion(initialSessionId)])
      .then(([messages, question]) => {
        if (active) dispatch({ type: "HYDRATE", messages, question });
      })
      .catch((error: unknown) => {
        if (active) dispatch({ type: "FAIL", message: getErrorMessage(error) });
      });
    return () => {
      active = false;
    };
  }, [initialSessionId]);

  const consumeStream = useCallback(
    async (createStream: (signal: AbortSignal) => ReturnType<typeof startAgentStream>) => {
      const controller = new AbortController();
      abortRef.current = controller;
      streamStore.set(undefined);
      let finalMessage: AgentMessage | undefined;

      try {
        const stream = await createStream(controller.signal);
        for await (const message of readUIMessageStream<AgentMessage>({
          stream,
          terminateOnError: true,
        })) {
          finalMessage = message;
          streamStore.set(message);
        }

        const sessionId = getSessionId(finalMessage) ?? state.sessionId;
        const question = sessionId ? await getPendingQuestion(sessionId) : undefined;
        dispatch({
          type: "STREAM_DONE",
          message: finalMessage && hasRenderablePart(finalMessage) ? finalMessage : undefined,
          sessionId,
          question,
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
        streamStore.set(undefined);
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [state.sessionId, streamStore],
  );

  const sendPrompt = (prompt: string) => {
    const text = prompt.trim();
    if (!text || !canSend || !novelId) return;

    const context: AgentContext = {
      novelId,
      ...(chapterId && { chapterId }),
    };
    const message: AgentMessage = {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text }],
    };
    setDraft("");
    inputRef.current?.clear();
    dispatch({ type: "SEND", message });
    void consumeStream((signal) => startAgentStream(context, text, state.sessionId, signal));
  };

  const send = () => sendPrompt(draft);

  const answer = (answers: Record<string, AnswerValue>) => {
    if (!state.question || busy) return;
    const questionId = state.question.id;
    dispatch({ type: "RESUME" });
    void consumeStream((signal) => answerAgentStream(questionId, answers, signal));
  };

  const dismiss = () => {
    if (!state.question || busy) return;
    void dismissQuestion(state.question.id)
      .then(() => dispatch({ type: "DISMISS_QUESTION" }))
      .catch((error: unknown) => dispatch({ type: "FAIL", message: getErrorMessage(error) }));
  };

  return (
    <section className="flex h-full min-h-0 flex-col bg-card" aria-label={t("title")}>
      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent>
              <div className="flex min-h-full flex-col gap-6 px-4 py-6">
                {state.messages.length === 0 && !busy ? (
                  <ChatWelcome disabled={!canSend} onSelectPrompt={sendPrompt} />
                ) : null}
                {state.messages.map((message) => (
                  <MessageScrollerItem key={message.id}>
                    <MessageView message={message} />
                  </MessageScrollerItem>
                ))}
                {busy ? (
                  <MessageScrollerItem scrollAnchor>
                    <StreamingMessageView store={streamStore} />
                  </MessageScrollerItem>
                ) : null}
              </div>
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      {state.error ? (
        <div className="px-4 pb-3">
          <Alert variant="destructive">
            <AlertTitle>{t("error.title")}</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        </div>
      ) : null}

      {state.question ? (
        <AskUser question={state.question} disabled={busy} onAnswer={answer} onDismiss={dismiss} />
      ) : null}

      <div className="px-4 pt-2 pb-6">
        <PromptInput
          ref={inputRef}
          placeholder={state.question ? t("composer.waiting") : t("composer.placeholder")}
          disabled={busy || Boolean(state.question)}
          ariaLabel={t("composer.placeholder")}
          onChange={setDraft}
          onSubmit={send}
          addon={
            busy ? (
              <InputGroupButton
                type="button"
                size="icon-sm"
                variant="secondary"
                aria-label={t("composer.stop")}
                onClick={() => abortRef.current?.abort()}
              >
                <SquareIcon />
              </InputGroupButton>
            ) : (
              <InputGroupButton
                type="button"
                size="icon-sm"
                variant="default"
                aria-label={t("composer.send")}
                disabled={!draft.trim() || !canSend}
              >
                <SendHorizontalIcon />
              </InputGroupButton>
            )
          }
        />
      </div>
    </section>
  );
}
