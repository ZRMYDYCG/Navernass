"use client";

import { memo, useSyncExternalStore } from "react";

import { AgentConnecting, AssistantParts } from "@/components/buss/agui";
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
import type { AgentMessage } from "@/lib/agent/chat-types";
import type { StreamStore } from "@/lib/agent/stream-store";

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
        <AssistantParts parts={message.parts} streaming={streaming} />
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
          <AgentConnecting />
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
