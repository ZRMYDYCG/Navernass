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
import { resolveAgentMessageId } from "@/lib/agent/chat-types";
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

export function Messages({ messages, busy, store }: MessagesProps) {
  const streamingMessage = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
  // Keep the streaming row in the same keyed list when it becomes history.
  const visibleMessages = busy && streamingMessage ? [...messages, streamingMessage] : messages;

  return (
    <MessageScrollerProvider autoScroll defaultScrollPosition="end" scrollPreviousItemPeek={64}>
      <div className="min-h-0 flex-1 px-4 py-6">
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent>
              {visibleMessages.map((message, index) => {
                const messageId = resolveAgentMessageId(message, `${message.role}-${index}`);
                const streaming = busy && message === streamingMessage;
                return (
                  <MessageScrollerItem
                    key={messageId}
                    messageId={messageId}
                    scrollAnchor={message.role === "user"}
                  >
                    {streaming && message.parts.length === 0 ? (
                      <Message>
                        <MessageContent>
                          <AgentConnecting />
                        </MessageContent>
                      </Message>
                    ) : (
                      <MessageView message={message} streaming={streaming} />
                    )}
                  </MessageScrollerItem>
                );
              })}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </div>
    </MessageScrollerProvider>
  );
}
