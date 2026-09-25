import type { PendingQuestion } from "@/schemas/agent.schema";

import type { AgentMessage } from "./chat-types";

export type ChatPhase = "idle" | "streaming" | "waiting_input" | "error";

export interface ChatState {
  phase: ChatPhase;
  messages: AgentMessage[];
  sessionId?: string;
  question?: PendingQuestion;
  error?: string;
}

export type ChatEvent =
  | { type: "HYDRATE"; messages: AgentMessage[]; question?: PendingQuestion }
  | { type: "SEND"; message: AgentMessage }
  | { type: "RESUME" }
  | {
      type: "STREAM_DONE";
      message?: AgentMessage;
      sessionId?: string;
      question?: PendingQuestion;
    }
  | { type: "STOP"; message?: AgentMessage }
  | { type: "FAIL"; message: string }
  | { type: "DISMISS_QUESTION" };

export const initialChatState: ChatState = {
  phase: "idle",
  messages: [],
};

/** 显式状态迁移，避免网络状态、提问中断和 UI 状态互相污染。 */
export function chatReducer(state: ChatState, event: ChatEvent): ChatState {
  switch (event.type) {
    case "HYDRATE":
      return {
        ...state,
        phase: event.question ? "waiting_input" : "idle",
        messages: event.messages,
        question: event.question,
        error: undefined,
      };
    case "SEND":
      return {
        ...state,
        phase: "streaming",
        messages: [...state.messages, event.message],
        question: undefined,
        error: undefined,
      };
    case "RESUME":
      return { ...state, phase: "streaming", question: undefined, error: undefined };
    case "STREAM_DONE":
      return {
        ...state,
        phase: event.question ? "waiting_input" : "idle",
        messages: event.message ? [...state.messages, event.message] : state.messages,
        sessionId: event.sessionId ?? state.sessionId,
        question: event.question,
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
    case "DISMISS_QUESTION":
      return { ...state, phase: "idle", question: undefined };
  }
}
