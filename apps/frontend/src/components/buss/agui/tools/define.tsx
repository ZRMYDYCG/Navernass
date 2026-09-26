import type { LucideIcon } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import type { z } from "zod";

import { ToolExcerpt } from "../activity/tool-detail";
import type { ToolCall, Translate } from "./tool-call";

export interface ToolProps<I, O> {
  call: ToolCall;
  input: I | undefined;
  output: O | undefined;
}

export interface ToolDefinition<I, O> {
  icon: LucideIcon;
  input?: z.ZodType<I>;
  output?: z.ZodType<O>;
  /** 默认使用 `agui.tools.<name>.running|done`。 */
  title?: (t: Translate, props: ToolProps<I, O>) => string;
  summary?: (t: Translate, props: ToolProps<I, O>) => string | undefined;
  Detail?: ComponentType<ToolProps<I, O>>;
  /** Interactive result below the stable tool row, outside its collapsed details. */
  Card?: ComponentType<{ call: ToolCall; output: O }>;
}

export interface ResolvedTool {
  icon: LucideIcon;
  title: string;
  summary?: string;
  detail?: ReactNode;
  card?: ReactNode;
}

export type ToolResolver = (call: ToolCall, t: Translate) => ResolvedTool;

/** 未声明 schema 时 I/O 推断为 unknown，原样透传。 */
function parse<T>(schema: z.ZodType<T> | undefined, value: unknown) {
  if (value === undefined) return undefined;
  if (!schema) return value as T;
  const result = schema.safeParse(value);
  return result.success ? result.data : undefined;
}

export function toolPhase(call: ToolCall) {
  return call.status === "done" || call.status === "error" ? "done" : "running";
}

export function defineTool<I, O>(definition: ToolDefinition<I, O>): ToolResolver {
  const { icon, title, summary, Detail, Card } = definition;
  return (call, t) => {
    const props: ToolProps<I, O> = {
      call,
      input: parse(definition.input, call.input),
      output: call.status === "done" ? parse(definition.output, call.output) : undefined,
    };
    const failed = call.status === "error";
    const hasData = props.input !== undefined || props.output !== undefined;
    return {
      icon,
      title: failed
        ? t("failedTool")
        : call.status === "interrupted"
          ? t("interruptedTool")
          : (title?.(t, props) ?? t(`tools.${call.name}.${toolPhase(call)}`)),
      summary: summary?.(t, props),
      detail: failed ? (
        <ToolExcerpt tone="error">{call.errorText}</ToolExcerpt>
      ) : Detail && hasData ? (
        <Detail {...props} />
      ) : undefined,
      card:
        Card && props.output !== undefined ? <Card call={call} output={props.output} /> : undefined,
    };
  };
}

export function quote(text: string) {
  return `“${text}”`;
}
