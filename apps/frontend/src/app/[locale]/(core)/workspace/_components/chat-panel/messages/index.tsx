"use client";

import { getToolName, isToolUIPart } from "ai";
import { useTranslations } from "next-intl";
import { memo, useSyncExternalStore } from "react";
import { Streamdown } from "streamdown";

import { Badge } from "@/components/ui/badge";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Message, MessageContent } from "@/components/ui/message";
import { Spinner } from "@/components/ui/spinner";
import type { AgentMessage } from "@/lib/agent/chat-types";
import { askUserPartType, hasRenderablePart } from "@/lib/agent/message-utils";
import type { StreamStore } from "@/lib/agent/stream-store";
import { askUserOutputSchema } from "@/schemas/agent.schema";

interface MessagesProps {
  messages: AgentMessage[];
  busy: boolean;
  store: StreamStore;
}

function AskUserMarker({ state, output }: { state: string; output: unknown }) {
  const t = useTranslations("chat.askUser");
  const result = state === "output-available" ? askUserOutputSchema.safeParse(output) : undefined;
  const label = !result
    ? t("asking")
    : result.success && result.data.status === "answered"
      ? t("answered")
      : t("skipped");
  return <div className="text-sm text-muted-foreground">{label}</div>;
}

function MessageBody({
  message,
  streaming = false,
}: {
  message: AgentMessage;
  streaming?: boolean;
}) {
  if (message.role === "user") {
    const text = message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("");

    return (
      <Message align="end">
        <MessageContent>
          <Bubble align="end">
            <BubbleContent>{text}</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    );
  }

  return (
    <Message>
      <MessageContent>
        {message.parts.map((part, index) => {
          if (part.type === "text") {
            return (
              <Streamdown key={`text-${index}`} mode={streaming ? "streaming" : "static"}>
                {part.text}
              </Streamdown>
            );
          }
          if (part.type === askUserPartType && isToolUIPart(part)) {
            return <AskUserMarker key={part.toolCallId} state={part.state} output={part.output} />;
          }
          if (isToolUIPart(part)) {
            const running = part.state === "input-streaming" || part.state === "input-available";
            return (
              <div
                key={part.toolCallId}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                {running ? <Spinner /> : null}
                <Badge variant="secondary">{getToolName(part)}</Badge>
                <span>{running ? "工具执行中" : "工具执行完成"}</span>
              </div>
            );
          }
          return null;
        })}
        {streaming && !hasRenderablePart(message) ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            <span>正在思考</span>
          </div>
        ) : null}
      </MessageContent>
    </Message>
  );
}

/** 历史消息只有对象引用变化时才渲染。 */
const MessageView = memo(MessageBody);

function StreamingMessage({ store }: { store: StreamStore }) {
  const message = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  if (!message) {
    return (
      <Message>
        <MessageContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            <span>正在连接 Agent</span>
          </div>
        </MessageContent>
      </Message>
    );
  }

  return <MessageBody message={message} streaming />;
}

export function Messages({ messages, busy, store }: MessagesProps) {
  return (
    <MessageScrollerProvider>
      <MessageScroller>
        <MessageScrollerViewport>
          <MessageScrollerContent>
            <div className="flex min-h-full flex-col gap-6 px-4 py-6">
              {messages.map((message) => (
                <MessageScrollerItem key={message.id}>
                  <MessageView message={message} />
                </MessageScrollerItem>
              ))}
              {busy ? (
                <MessageScrollerItem scrollAnchor>
                  <StreamingMessage store={store} />
                </MessageScrollerItem>
              ) : null}
            </div>
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
