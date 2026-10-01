"use client";

import { memo, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

import {
  AgentConnecting,
  AssistantParts,
} from "@/app/[locale]/(core)/workspace/_components/agent-ui/message/assistant-message";
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
import type { AgentMessage } from "@/app/[locale]/(core)/workspace/_components/chat-panel/model/chat-types";
import { resolveAgentMessageId } from "@/app/[locale]/(core)/workspace/_components/chat-panel/model/chat-types";
import type { StreamStore } from "@/app/[locale]/(core)/workspace/_components/chat-panel/model/stream-store";

interface MessagesProps {
  messages: AgentMessage[];
  busy: boolean;
  store: StreamStore;
}

function MessageBody({
  message,
  streaming = false,
}: {
  message: AgentMessage;
  streaming?: boolean;
}) {
  const t = useTranslations("chat.message");
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
        <AssistantParts
          parts={message.parts}
          streaming={streaming}
          toolTimings={message.metadata?.toolTimings}
        />
        {message.metadata?.interrupted ? (
          <span className="text-xs text-muted-foreground">
            {message.metadata.paused ? t("paused") : t("interrupted")}
          </span>
        ) : null}
      </MessageContent>
    </Message>
  );
}

/** 历史消息只有对象引用变化时才渲染。 */
const MessageView = memo(MessageBody);

export function Messages({ messages, busy, store }: MessagesProps) {
  return (
    <MessageScrollerProvider autoScroll defaultScrollPosition="end" scrollPreviousItemPeek={64}>
      <div className="min-h-0 flex-1 px-4 py-6">
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent>
              {messages.map((message, index) => {
                const messageId = resolveAgentMessageId(message, `${message.role}-${index}`);
                return (
                  <MessageScrollerItem
                    key={messageId}
                    messageId={messageId}
                    scrollAnchor={message.role === "user"}
                  >
                    <MessageView message={message} />
                  </MessageScrollerItem>
                );
              })}
              {busy ? <StreamingMessageItem key="assistant-streaming" store={store} /> : null}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </div>
    </MessageScrollerProvider>
  );
}

function StreamingMessageItem({ store }: { store: StreamStore }) {
  const message = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  if (!message) return null;

  const messageId = resolveAgentMessageId(message, "assistant-streaming");
  return (
    <MessageScrollerItem messageId={messageId} scrollAnchor={false}>
      {message.parts.length === 0 ? (
        <Message>
          <MessageContent>
            <AgentConnecting />
          </MessageContent>
        </Message>
      ) : (
        <MessageView message={message} streaming />
      )}
    </MessageScrollerItem>
  );
}
