import { isToolUIPart } from "ai";

import type { AgentMessage } from "./chat-types";

/** 消息是否包含可渲染内容（非空文本或工具调用）。 */
export function hasRenderablePart(message: AgentMessage) {
  return message.parts.some(
    (part) => (part.type === "text" && part.text.trim()) || isToolUIPart(part),
  );
}
