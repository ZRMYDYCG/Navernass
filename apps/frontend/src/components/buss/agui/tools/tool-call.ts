import { getToolName } from "ai";
import type { DynamicToolUIPart, ToolUIPart } from "ai";

/**
 * streaming：模型仍在生成参数；running：工具执行中；waiting：等待用户（askUser）；
 * interrupted：流已结束但没有结果（停止生成或异常中断）。
 */
export type ToolStatus = "streaming" | "running" | "waiting" | "done" | "error" | "interrupted";

export interface ToolCall {
  toolCallId: string;
  name: string;
  status: ToolStatus;
  input: unknown;
  output: unknown;
  errorText?: string;
}

export type Translate = (key: string, values?: Record<string, string | number>) => string;

const interactiveTools = new Set(["askUser"]);

export function toToolCall(part: ToolUIPart | DynamicToolUIPart, streaming: boolean): ToolCall {
  const name = getToolName(part);
  const base = { toolCallId: part.toolCallId, name, input: part.input };
  switch (part.state) {
    case "output-available":
      return { ...base, status: "done", output: part.output };
    case "output-error":
      return { ...base, status: "error", output: undefined, errorText: part.errorText };
    case "output-denied":
      return { ...base, status: "interrupted", output: undefined };
    default: {
      if (interactiveTools.has(name) && part.state === "input-available")
        return { ...base, status: "waiting", output: undefined };
      if (!streaming) return { ...base, status: "interrupted", output: undefined };
      return {
        ...base,
        status: part.state === "input-streaming" ? "streaming" : "running",
        output: undefined,
      };
    }
  }
}

export function isActive(status: ToolStatus) {
  return status === "streaming" || status === "running";
}
