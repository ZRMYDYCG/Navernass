"use client";

import { getToolName } from "ai";
import type { DynamicToolUIPart, ToolUIPart } from "ai";
import type { LucideIcon } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { z } from "zod";

import { cn } from "cn";

/**
 * ─── 运行时状态机 ─────────────────────────────────────────────────────────
 * streaming：模型仍在生成参数；running：工具执行中；waiting：等待用户（askUser）；
 * interrupted：流已结束但没有结果（停止生成或异常中断）。
 */
export type ToolStatus = "streaming" | "running" | "waiting" | "done" | "error" | "interrupted";

export interface ToolCall {
  toolCallId: string;
  tool: string;
  status: ToolStatus;
  input: unknown;
  output: unknown;
  errorText?: string;
}

export type Translate = (key: string, values?: Record<string, string | number>) => string;

const interactiveTools = new Set(["askUser"]);

export function toToolCall(part: ToolUIPart | DynamicToolUIPart, streaming: boolean): ToolCall {
  const tool = getToolName(part);
  const base = { toolCallId: part.toolCallId, tool, input: part.input };
  switch (part.state) {
    case "output-available":
      return { ...base, status: "done", output: part.output };
    case "output-error":
      return { ...base, status: "error", output: undefined, errorText: part.errorText };
    case "output-denied":
      return { ...base, status: "interrupted", output: undefined };
    default: {
      if (interactiveTools.has(tool) && part.state === "input-available")
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

/**
 * ─── 物料协议 ─────────────────────────────────────────────────────────────
 * 一个物料 = 一份与后端工具的匹配声明：匹配键（tool）+ 数据契约（input/output
 * 的 zod schema，即 JSON-Schema 思想下前后端共享的字段契约）+ 视图（title /
 * summary / detail / card）。所有物料同构；注册中心只认协议，不认具体工具。
 */
export interface MaterialContext<I, O> {
  call: ToolCall;
  input: I | undefined;
  output: O | undefined;
}

export interface ToolMaterial<I, O> {
  /** 匹配键：与后端 ToolService.build 暴露的工具名一一对应。 */
  tool: string;
  icon: LucideIcon;
  /** 契约：声明渲染所需的字段，引擎据此校验边界数据并推导视图类型。 */
  input?: z.ZodType<I>;
  output?: z.ZodType<O>;
  /** 缺省使用 agui.tools.<tool>.running|done。 */
  title?: (t: Translate, ctx: MaterialContext<I, O>) => string;
  summary?: (t: Translate, ctx: MaterialContext<I, O>) => string | undefined;
  /** 折叠详情；未声明时该物料行不可展开。 */
  detail?: ComponentType<MaterialContext<I, O>>;
  /** 交互卡片：固定展示在工具行下方（如修改提案），不随详情折叠。 */
  card?: ComponentType<{ call: ToolCall; output: O }>;
}

export interface MaterialView {
  icon: LucideIcon;
  title: string;
  summary?: string;
  detail?: ReactNode;
  card?: ReactNode;
}

export interface MaterialEntry {
  tool: string;
  resolve: (call: ToolCall, t: Translate) => MaterialView;
}

export function toolPhase(call: ToolCall) {
  return call.status === "done" || call.status === "error" ? "done" : "running";
}

export function quote(text: string) {
  return `“${text}”`;
}

/** 未声明 schema 时数据原样透传；声明了则校验失败按缺失处理，不渲染半截视图。 */
function parse<T>(schema: z.ZodType<T> | undefined, value: unknown) {
  if (value === undefined) return undefined;
  if (!schema) return value as T;
  const result = schema.safeParse(value);
  return result.success ? result.data : undefined;
}

export function defineMaterial<I, O>(material: ToolMaterial<I, O>): MaterialEntry {
  const { icon, title, summary, detail: Detail, card: Card, input, output } = material;
  return {
    tool: material.tool,
    resolve: (call, t) => {
      const ctx: MaterialContext<I, O> = {
        call,
        input: parse(input, call.input),
        output: call.status === "done" ? parse(output, call.output) : undefined,
      };
      const failed = call.status === "error";
      const hasData = ctx.input !== undefined || ctx.output !== undefined;
      return {
        icon,
        title: failed
          ? t("failedTool")
          : call.status === "interrupted"
            ? t("interruptedTool")
            : (title?.(t, ctx) ?? t(`tools.${call.tool}.${toolPhase(call)}`)),
        summary: summary?.(t, ctx),
        detail: failed ? (
          <ToolExcerpt tone="error">{call.errorText}</ToolExcerpt>
        ) : Detail && hasData ? (
          <Detail {...ctx} />
        ) : hasData ? (
          <RawToolDetail {...ctx} />
        ) : undefined,
        card:
          Card && ctx.output !== undefined ? <Card call={call} output={ctx.output} /> : undefined,
      };
    },
  };
}

/**
 * ─── 协议渲染原子 ─────────────────────────────────────────────────────────
 * 物料 detail 视图的标准构件；保证所有物料的详情具有同一套视觉。
 */
export function ToolField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export function ToolExcerpt({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "error";
}) {
  return (
    <div
      className={cn(
        "max-h-72 overflow-auto text-sm leading-relaxed wrap-break-word whitespace-pre-wrap",
        tone === "error" ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {children}
    </div>
  );
}

function ToolValue({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    if (!value.length) return <span className="text-muted-foreground">—</span>;
    if (value.every((item) => item === null || typeof item !== "object"))
      return <span className="wrap-break-word">{value.map(String).join("、")}</span>;
    return (
      <div className="flex min-w-0 flex-col gap-2">
        {value.map((item, index) => (
          <div key={index} className="min-w-0">
            <ToolValue value={item} />
          </div>
        ))}
      </div>
    );
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value);
    if (!entries.length) return <span className="text-muted-foreground">—</span>;
    return (
      <dl className="min-w-0 divide-y overflow-hidden rounded-md border">
        {entries.map(([key, item]) => (
          <div key={key} className="flex min-w-0 gap-3 px-2.5 py-1.5">
            <dt className="w-28 shrink-0 truncate font-mono text-xs text-muted-foreground">
              {key}
            </dt>
            <dd className="min-w-0 flex-1 text-foreground">
              <ToolValue value={item} />
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <span className="wrap-break-word whitespace-pre-wrap text-foreground">
      {value === null || value === "" ? "—" : String(value)}
    </span>
  );
}

export function RawToolDetail({ input, output }: MaterialContext<unknown, unknown>) {
  const t = useTranslations("agui.detail");
  return (
    <>
      {input === undefined ? null : (
        <ToolField label={t("input")}>
          <ToolValue value={input} />
        </ToolField>
      )}
      {output === undefined ? null : (
        <ToolField label={t("output")}>
          <ToolValue value={output} />
        </ToolField>
      )}
    </>
  );
}

export function ToolMeta({ items }: { items: Array<string | false | undefined> }) {
  const visible = items.filter((item): item is string => Boolean(item));
  if (!visible.length) return null;
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground tabular-nums">
      {visible.map((item, index) => (
        <span key={`${index}-${item}`}>{item}</span>
      ))}
    </div>
  );
}

export function ToolMarkdown({ children }: { children: ReactNode }) {
  return (
    <div className="max-h-80 overflow-auto text-sm leading-relaxed text-foreground">{children}</div>
  );
}
