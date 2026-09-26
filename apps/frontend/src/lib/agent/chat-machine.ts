import type { AskUserOutput } from "@/schemas/agent.schema";

import type { AgentMessage } from "./chat-types";
import { resolveQuestion } from "./message-utils";

export type ChatPhase = "idle" | "streaming" | "error";

export interface ChatState {
  phase: ChatPhase;
  messages: AgentMessage[];
  sessionId?: string;
  error?: string;
}

export type ChatEvent =
  | { type: "HYDRATE"; messages: AgentMessage[] }
  | { type: "SEND"; message: AgentMessage }
  | { type: "ANSWER"; toolCallId: string; output: AskUserOutput }
  | { type: "STREAM_DONE"; message?: AgentMessage; sessionId?: string }
  | { type: "STOP"; message?: AgentMessage }
  | { type: "FAIL"; message: string };

export const initialChatState: ChatState = {
  phase: "idle",
  messages: [],
};

/** 显式状态迁移，避免网络状态和 UI 状态互相污染。 */
export function chatReducer(state: ChatState, event: ChatEvent): ChatState {
  switch (event.type) {
    case "HYDRATE":
      return { ...state, phase: "idle", messages: event.messages, error: undefined };
    case "SEND":
      return {
        ...state,
        phase: "streaming",
        // 不回答直接发消息等同于跳过提问，与后端的处理保持一致。
        messages: [
          ...resolveQuestion(state.messages, { status: "skipped", reason: "user_sent_message" }),
          event.message,
        ],
        error: undefined,
      };
    case "ANSWER":
      return {
        ...state,
        phase: "streaming",
        messages: resolveQuestion(state.messages, event.output, event.toolCallId),
        error: undefined,
      };
    case "STREAM_DONE":
      return {
        ...state,
        phase: "idle",
        messages: event.message ? [...state.messages, event.message] : state.messages,
        sessionId: event.sessionId ?? state.sessionId,
        error: undefined,
      };
    case "STOP":
      return {
        ...state,
        phase: "idle",
        messages: event.message ? [...state.messages, event.message] : state.messages,
      };
    case "FAIL":
      return { ...state, phase: "error", error: event.message };
  }
}
