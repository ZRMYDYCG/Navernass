"use client";

import { CircleAlertIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { useId } from "react";
import type { ReactNode } from "react";
import { cn } from "cn";

import {
  TreeExpander,
  TreeNode,
  TreeNodeContent,
  TreeNodeTrigger,
  TreeProvider,
} from "@/components/ui/tree";
import { isActive, type ToolStatus } from "./protocol";

export function ToolGroup({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 flex-col gap-2">{children}</div>;
}

interface ToolRowProps {
  icon: LucideIcon;
  title: string;
  summary?: string;
  status: ToolStatus;
  defaultOpen?: boolean;
  children?: ReactNode;
  result?: ReactNode;
  trailing?: ReactNode;
}

/** 与推理组件同一套视觉：图标 + 标题 + 摘要 + 紧随的箭头，执行中标题流光；详情以树节点动画展开。 */
export function ToolRow({
  icon: Icon,
  title,
  summary,
  status,
  defaultOpen = false,
  children,
  result,
  trailing,
}: ToolRowProps) {
  const t = useTranslations("agui.status");
  const nodeId = useId();
  const active = isActive(status);
  const failed = status === "error";

  const header = (
    <span className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground">
      {failed ? (
        <CircleAlertIcon className="size-4 shrink-0 text-destructive" />
      ) : (
        <Icon className="size-4 shrink-0" />
      )}
      <span className={cn("shrink-0", active && "text-shimmer", failed && "text-destructive")}>
        {title}
      </span>
      {summary ? (
        <span className="min-w-0 truncate text-muted-foreground/60">{summary}</span>
      ) : null}
      {status === "interrupted" ? (
        <span className="shrink-0 text-muted-foreground/60">· {t("interrupted")}</span>
      ) : null}
      {trailing ? (
        <span className="shrink-0 text-xs text-muted-foreground/60 tabular-nums">· {trailing}</span>
      ) : null}
    </span>
  );

  return (
    <div className="min-w-0">
      {children ? (
        // 流式结束后消息会整体重新挂载，关闭入场动画，避免整组工具行重播。
        <AnimatePresence initial={false}>
          <TreeProvider
            defaultExpandedIds={defaultOpen ? [nodeId] : []}
            selectable={false}
            showLines={false}
          >
            <TreeNode nodeId={nodeId}>
              <TreeNodeTrigger
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  event.currentTarget.click();
                }}
                className="mx-0 -ml-2 w-fit max-w-full min-w-0"
              >
                {header}
                <TreeExpander hasChildren className="ml-1" />
              </TreeNodeTrigger>
              <TreeNodeContent hasChildren>
                <div className="mt-3 mb-1 flex min-w-0 flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
                  {children}
                </div>
              </TreeNodeContent>
            </TreeNode>
          </TreeProvider>
        </AnimatePresence>
      ) : (
        header
      )}
      {result ? <div className="mt-3">{result}</div> : null}
    </div>
  );
}
