"use client";

import { getToolName, isToolUIPart } from "ai";
import { memo, useSyncExternalStore } from "react";
import { Streamdown } from "streamdown";

import { Badge } from "@/components/ui/badge";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import { Spinner } from "@/components/ui/spinner";
import type { AgentMessage } from "@/lib/agent/chat-types";
import { hasRenderablePart } from "@/lib/agent/message-utils";
import type { StreamStore } from "@/lib/agent/stream-store";

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
          if (isToolUIPart(part) && getToolName(part) !== "askUser") {
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
export const MessageView = memo(MessageBody);

export function StreamingMessageView({ store }: { store: StreamStore }) {
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
