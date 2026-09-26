"use client";

import { isReasoningUIPart, isTextUIPart, isToolUIPart } from "ai";
import type { UIMessage } from "ai";
import { LinkIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Spinner } from "@/components/ui/spinner";

import { Reasoning } from "./reasoning";
import { StreamText } from "./stream-text";
import { ToolGroup, ToolRow } from "./tool-shell";
import { resolveTool } from "./tools/registry";
import type { ResolvedTool } from "./tools/define";
import { isActive, toToolCall, type ToolCall } from "./types";

type Part = UIMessage["parts"][number];

interface ResolvedCall {
  call: ToolCall;
  view: ResolvedTool;
}

type Segment =
  | { kind: "text"; key: string; text: string }
  | { kind: "reasoning"; key: string; text: string; active: boolean }
  | { kind: "tools"; key: string; calls: ResolvedCall[] }
  | { kind: "card"; key: string; card: ReactNode };

interface Source {
  id: string;
  url: string;
  title?: string;
}

/** 把 parts 切成渲染片段：连续的工具调用合并为一组，step-start 不打断分组。 */
function segment(parts: Part[], streaming: boolean, resolve: (call: ToolCall) => ResolvedTool) {
  const segments: Segment[] = [];
  const sources: Source[] = [];
  parts.forEach((part, index) => {
    if (isTextUIPart(part)) {
      if (part.text.trim()) segments.push({ kind: "text", key: `text-${index}`, text: part.text });
      return;
    }
    if (isReasoningUIPart(part)) {
      if (part.text.trim())
        segments.push({
          kind: "reasoning",
          key: `reasoning-${index}`,
          text: part.text,
          active: streaming && part.state === "streaming",
        });
      return;
    }
    if (isToolUIPart(part)) {
      const call = toToolCall(part, streaming);
      const view = resolve(call);
      if (view.card) {
        segments.push({ kind: "card", key: call.toolCallId, card: view.card });
        return;
      }
      const last = segments.at(-1);
      if (last?.kind === "tools") last.calls.push({ call, view });
      else segments.push({ kind: "tools", key: call.toolCallId, calls: [{ call, view }] });
      return;
    }
    if (part.type === "source-url")
      sources.push({ id: part.sourceId, url: part.url, title: part.title });
  });
  return { segments, sources };
}

function Pending({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}

interface AssistantPartsProps {
  parts: Part[];
  streaming?: boolean;
}

/** 渲染助手消息的全部 parts：流式文本、推理、工具调用组、需要用户操作的卡片和来源。 */
export function AssistantParts({ parts, streaming = false }: AssistantPartsProps) {
  const t = useTranslations("agui");
  const { segments, sources } = segment(parts, streaming, (call) => resolveTool(call, t));
  const last = segments.at(-1);
  // 推理或工具已结束、下一段输出尚未到达时显示占位，避免界面静止。
  const waiting =
    streaming &&
    (!last ||
      last.kind === "card" ||
      (last.kind === "reasoning" && !last.active) ||
      (last.kind === "tools" && !last.calls.some(({ call }) => isActive(call.status))));

  return (
    <>
      {segments.map((item) => {
        switch (item.kind) {
          case "text":
            return (
              <StreamText key={item.key} text={item.text} streaming={streaming && item === last} />
            );
          case "reasoning":
            return <Reasoning key={item.key} text={item.text} active={item.active} />;
          case "tools":
            return (
              <ToolGroup key={item.key}>
                {item.calls.map(({ call, view }) => (
                  <ToolRow
                    key={call.toolCallId}
                    icon={view.icon}
                    title={view.title}
                    summary={view.summary}
                    status={call.status}
                  >
                    {view.detail}
                  </ToolRow>
                ))}
              </ToolGroup>
            );
          case "card":
            return <div key={item.key}>{item.card}</div>;
        }
      })}
      {sources.length ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <LinkIcon className="size-3.5" />
            {t("sources")}
          </span>
          {sources.map((source) => (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="max-w-48 truncate underline-offset-3 hover:text-foreground hover:underline"
            >
              {source.title ?? source.url}
            </a>
          ))}
        </div>
      ) : null}
      {waiting ? <Pending label={t("working")} /> : null}
    </>
  );
}

export function AgentConnecting() {
  const t = useTranslations("agui");
  return <Pending label={t("connecting")} />;
}
