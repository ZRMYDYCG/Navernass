import type { AskUserOutput } from "@/schemas/agent.schema";

import type { AgentMessage } from "./chat-types";
import { resolveQuestion } from "./message-utils";

export type ChatPhase = "hydrating" | "idle" | "streaming" | "pausing" | "error";

export interface ChatState {
  phase: ChatPhase;
  messages: AgentMessage[];
  sessionId?: string;
  runId?: string;
  error?: string;
  viewKey: number;
}

export type ChatEvent =
  | { type: "SELECT_SESSION"; sessionId?: string }
  | { type: "STREAM_IDENTIFIED"; sessionId?: string; runId?: string; viewKey: number }
  | { type: "HYDRATE"; sessionId: string; messages: AgentMessage[] }
  | { type: "RESUME"; runId: string; viewKey: number }
  | { type: "SEND"; message: AgentMessage }
  | { type: "ANSWER"; toolCallId: string; output: AskUserOutput }
  | { type: "PAUSE"; runId: string; viewKey: number }
  | { type: "PAUSE_FAILED"; viewKey: number; message: string }
  | { type: "STREAM_DONE"; viewKey: number; message?: AgentMessage; sessionId?: string }
  | { type: "STOP"; viewKey: number; message?: AgentMessage }
  | { type: "FAIL"; viewKey: number; message: string };

export const initialChatState: ChatState = {
  phase: "idle",
  messages: [],
  viewKey: 0,
};

/** 显式状态迁移，避免网络状态和 UI 状态互相污染。 */
export function chatReducer(state: ChatState, event: ChatEvent): ChatState {
  switch (event.type) {
    case "SELECT_SESSION":
      return {
        phase: event.sessionId ? "hydrating" : "idle",
        messages: [],
        sessionId: event.sessionId,
        viewKey: state.viewKey + 1,
      };
    case "STREAM_IDENTIFIED":
      return event.viewKey === state.viewKey
        ? {
            ...state,
            sessionId: event.sessionId ?? state.sessionId,
            runId: event.runId ?? state.runId,
          }
        : state;
    case "HYDRATE":
      return event.sessionId === state.sessionId && !["streaming", "pausing"].includes(state.phase)
        ? { ...state, phase: "idle", messages: event.messages, error: undefined }
        : state;
    case "RESUME":
      return event.viewKey === state.viewKey
        ? { ...state, phase: "streaming", runId: event.runId, error: undefined }
        : state;
    case "SEND":
      return {
        ...state,
        phase: "streaming",
        runId: undefined,
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
        runId: undefined,
        messages: resolveQuestion(state.messages, event.output, event.toolCallId),
        error: undefined,
      };
    case "PAUSE":
      return event.viewKey === state.viewKey && event.runId === state.runId
        ? { ...state, phase: "pausing", error: undefined }
        : state;
    case "PAUSE_FAILED":
      return event.viewKey === state.viewKey
        ? { ...state, phase: "streaming", error: event.message }
        : state;
    case "STREAM_DONE":
      if (event.viewKey !== state.viewKey) return state;
      return {
        ...state,
        phase: "idle",
        runId: undefined,
        messages: event.message ? [...state.messages, event.message] : state.messages,
        sessionId: event.sessionId ?? state.sessionId,
        error: undefined,
      };
    case "STOP":
      if (event.viewKey !== state.viewKey) return state;
      return {
        ...state,
        phase: "idle",
        runId: undefined,
        messages: event.message ? [...state.messages, event.message] : state.messages,
      };
    case "FAIL":
      return event.viewKey === state.viewKey
        ? { ...state, phase: "error", runId: undefined, error: event.message }
        : state;
  }
}
