import { isToolUIPart } from "ai";

import { askUserInputSchema, type AskUserInput, type AskUserOutput } from "@/schemas/agent.schema";

import type { AgentMessage } from "./chat-types";

export const askUserPartType = "tool-askUser";

export interface PendingQuestion {
  toolCallId: string;
  input: AskUserInput;
}

/** 消息是否包含可渲染内容（非空文本或工具调用）。 */
export function hasRenderablePart(message: AgentMessage) {
  return message.parts.some(
    (part) => (part.type === "text" && part.text.trim()) || isToolUIPart(part),
  );
}

/** 只有最后一条助手消息里尚未得到结果的 askUser 才需要弹出面板。 */
export function findPendingQuestion(messages: AgentMessage[]): PendingQuestion | undefined {
  const last = messages.at(-1);
  if (last?.role !== "assistant") return undefined;
  for (const part of last.parts) {
    if (part.type !== askUserPartType || !isToolUIPart(part)) continue;
    if (part.state !== "input-available") continue;
    const input = askUserInputSchema.safeParse(part.input);
    if (input.success) return { toolCallId: part.toolCallId, input: input.data };
  }
  return undefined;
}

/** 把最后一条消息里悬挂的 askUser 补上结果；不传 toolCallId 时全部记为该结果。 */
export function resolveQuestion(
  messages: AgentMessage[],
  output: AskUserOutput,
  toolCallId?: string,
): AgentMessage[] {
  const last = messages.at(-1);
  if (last?.role !== "assistant") return messages;
  const parts = last.parts.map((part) =>
    part.type === askUserPartType &&
    isToolUIPart(part) &&
    part.state === "input-available" &&
    (!toolCallId || part.toolCallId === toolCallId)
      ? ({ ...part, state: "output-available", output } as AgentMessage["parts"][number])
      : part,
  );
  return [...messages.slice(0, -1), { ...last, parts }];
}
