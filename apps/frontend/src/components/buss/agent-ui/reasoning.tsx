"use client";

import { BrainIcon } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";
import { cn } from "cn";

import {
  TreeExpander,
  TreeNode,
  TreeNodeContent,
  TreeNodeTrigger,
  TreeProvider,
} from "@/components/ui/tree";

import { StreamText } from "./stream-text";

interface ReasoningProps {
  text: string;
  active: boolean;
}

const autoCloseDelayMs = 1_000;

/** 生成时自动展开，结束后显示思考时长并自动收起；历史消息默认收起。 */
export function Reasoning({ text, active }: ReasoningProps) {
  const t = useTranslations("agui.reasoning");
  const nodeId = useId();
  // 只有在生成中挂载的推理才计时；从历史加载的没有时长。
  const [startedAt] = useState(() => (active ? Date.now() : undefined));
  const [seconds, setSeconds] = useState<number>();
  const [autoClosed, setAutoClosed] = useState(false);
  const [userOpen, setUserOpen] = useState<boolean>();
  const open = userOpen ?? (active || (startedAt !== undefined && !autoClosed));

  useEffect(() => {
    if (active || startedAt === undefined) return;
    const measure = window.setTimeout(() => {
      setSeconds(Math.max(1, Math.round((Date.now() - startedAt) / 1000)));
    }, 0);
    const close = window.setTimeout(() => {
      setAutoClosed(true);
      setUserOpen(undefined);
    }, autoCloseDelayMs);
    return () => {
      window.clearTimeout(measure);
      window.clearTimeout(close);
    };
  }, [active, startedAt]);

  const label = active
    ? t("running")
    : seconds !== undefined
      ? t("duration", { seconds })
      : t("done");

  return (
    // 流式结束后消息会整体重新挂载，关闭入场动画，避免推理行重播。
    <AnimatePresence initial={false}>
      <TreeProvider
        expandedIds={open ? [nodeId] : []}
        onExpandedChange={(ids) => setUserOpen(ids.includes(nodeId))}
        selectable={false}
        showLines={false}
      >
        <TreeNode nodeId={nodeId}>
          <TreeNodeTrigger
            role="button"
            tabIndex={0}
            aria-expanded={open}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              event.currentTarget.click();
            }}
            className="mx-0 -ml-2 w-fit max-w-full min-w-0"
          >
            <span className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground">
              <BrainIcon className="size-4 shrink-0" />
              <span className={cn(active && "text-shimmer")}>{label}</span>
            </span>
            <TreeExpander hasChildren className="ml-1" />
          </TreeNodeTrigger>
          <TreeNodeContent hasChildren>
            <div className="mt-3 text-sm leading-relaxed text-muted-foreground">
              <StreamText text={text} streaming={active} />
            </div>
          </TreeNodeContent>
        </TreeNode>
      </TreeProvider>
    </AnimatePresence>
  );
}
