"use client";

import { memo, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

import { AgentConnecting, AssistantParts } from "@/components/buss/agent-ui/message";
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
import type { ChatMessage } from "./types";

type Listener = () => void;

/**
 * 通知节流：逐字动画会为每个字符挂载 span，token 级高频重渲染容易把
 * 渲染树压爆栈（Maximum call stack）。等价于 useChat 调高
 * experimental_throttle——动画卡顿/报栈时优先调大这个间隔。
 */
const NOTIFY_THROTTLE_MS = 100;

/** 流式消息的外部 store，供 useSyncExternalStore 消费；每个 token 只通知当前输出消息。 */
export class StreamingMessageStore {
  private message: ChatMessage | undefined;
  private readonly listeners = new Set<Listener>();
  private timer: ReturnType<typeof setTimeout> | undefined;

  getSnapshot = () => this.message;

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /** 首帧立即广播，节流窗口内的后续 token 合并为窗口末尾的一次通知。 */
  set(message: ChatMessage | undefined) {
    this.message = message;
    if (this.timer !== undefined) return;
    this.notify();
    this.timer = setTimeout(() => {
      this.timer = undefined;
      this.notify();
    }, NOTIFY_THROTTLE_MS);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}

function resolveMessageId(message: ChatMessage, fallback: string) {
  const id = message.id?.trim();
  if (id) return id;

  const aiSdkMessageId = message.metadata?.aiSdkMessageId?.trim();
  if (aiSdkMessageId) return aiSdkMessageId;

  const runId = message.metadata?.runId?.trim();
  if (runId) return `${message.role}-${runId}`;

  return fallback;
}

interface MessagesProps {
  messages: ChatMessage[];
  busy: boolean;
  store: StreamingMessageStore;
}

function MessageBody({
  message,
  streaming = false,
}: {
  message: ChatMessage;
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
                const messageId = resolveMessageId(message, `${message.role}-${index}`);
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

function StreamingMessageItem({ store }: { store: StreamingMessageStore }) {
  const message = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  if (!message) return null;

  const messageId = resolveMessageId(message, "assistant-streaming");
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
