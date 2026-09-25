"use client";

import { readUIMessageStream } from "ai";
import { BotIcon, SendHorizontalIcon, SquareIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { AskUser } from "@/components/buss/agui/ask-user";
import { MessageView, StreamingMessageView } from "@/components/buss/agui/message-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
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

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

interface ChatPanelProps {
  initialNovelId?: string;
  initialChapterId?: string;
  initialSessionId?: string;
}

function getSessionId(message: AgentMessage | undefined) {
  return message?.metadata?.sessionId;
}

export function ChatPanel({
  initialNovelId = "",
  initialChapterId = "",
  initialSessionId,
}: ChatPanelProps) {
  const t = useTranslations("chat");
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialChatState,
    sessionId: initialSessionId,
  });
  const [draft, setDraft] = useState("");
  const [novelId, setNovelId] = useState(initialNovelId);
  const [chapterId, setChapterId] = useState(initialChapterId);
  const streamStore = useMemo(() => new StreamStore(), []);
  const abortRef = useRef<AbortController>(null);

  const contextValid = isUuid(novelId);
  const chapterValid = !chapterId || isUuid(chapterId);
  const busy = state.phase === "streaming";

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

  const send = () => {
    const prompt = draft.trim();
    if (!prompt || busy || !contextValid || !chapterValid) return;

    const context: AgentContext = {
      novelId,
      ...(chapterId && { chapterId }),
    };
    const message: AgentMessage = {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text: prompt }],
    };
    setDraft("");
    dispatch({ type: "SEND", message });
    void consumeStream((signal) => startAgentStream(context, prompt, state.sessionId, signal));
  };

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
      <header className="flex flex-col gap-3 border-b p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-medium">{t("title")}</h1>
            <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
          </div>
          <Badge variant={state.phase === "error" ? "destructive" : "secondary"}>
            {t(`status.${state.phase}`)}
          </Badge>
        </div>
        <div className="grid gap-2">
          <Input
            aria-label={t("context.novel")}
            placeholder={t("context.novelPlaceholder")}
            value={novelId}
            disabled={busy}
            aria-invalid={Boolean(novelId) && !contextValid}
            onChange={(event) => setNovelId(event.target.value)}
          />
          <Input
            aria-label={t("context.chapter")}
            placeholder={t("context.chapterPlaceholder")}
            value={chapterId}
            disabled={busy}
            aria-invalid={!chapterValid}
            onChange={(event) => setChapterId(event.target.value)}
          />
        </div>
      </header>

      <MessageScrollerProvider>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent>
              <div className="flex min-h-full flex-col gap-6 px-4 py-6">
                {state.messages.length === 0 && !busy ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <BotIcon />
                      </EmptyMedia>
                      <EmptyTitle>{t("empty.title")}</EmptyTitle>
                      <EmptyDescription>{t("empty.description")}</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
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

      <form
        className="px-4 pt-2 pb-6"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <InputGroup>
          <InputGroupTextarea
            rows={3}
            value={draft}
            placeholder={state.question ? t("composer.waiting") : t("composer.placeholder")}
            disabled={busy || Boolean(state.question)}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
          />
          <InputGroupAddon align="block-end" className="justify-end">
            {busy ? (
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
                type="submit"
                size="icon-sm"
                variant="default"
                aria-label={t("composer.send")}
                disabled={
                  !draft.trim() || !contextValid || !chapterValid || Boolean(state.question)
                }
              >
                <SendHorizontalIcon />
              </InputGroupButton>
            )}
          </InputGroupAddon>
        </InputGroup>
        {!contextValid || !chapterValid ? (
          <p className="mt-2 text-xs text-destructive">{t("context.invalid")}</p>
        ) : null}
      </form>
    </section>
  );
}
