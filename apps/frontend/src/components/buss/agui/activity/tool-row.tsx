"use client";

import { ChevronDownIcon, CircleAlertIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "cn";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { isActive, type ToolStatus } from "../tools/tool-call";

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

const headerClass = "flex max-w-full min-w-0 items-center gap-2 text-sm text-muted-foreground";

/** 与推理组件同一套视觉：图标 + 标题 + 摘要 + 紧随的箭头，执行中标题流光。 */
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
  const [userOpen, setUserOpen] = useState<boolean>();
  const [initialOpen] = useState(defaultOpen);
  const open = userOpen ?? initialOpen;
  const active = isActive(status);
  const failed = status === "error";
  const expandable = Boolean(children);

  const header = (
    <>
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
        <span className="shrink-0 text-xs text-muted-foreground/60 tabular-nums">{trailing}</span>
      ) : null}
      {expandable ? (
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 transition-transform motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      ) : null}
    </>
  );

  return (
    <div className="min-w-0">
      <Collapsible open={open} onOpenChange={setUserOpen}>
        {expandable ? (
          <CollapsibleTrigger
            render={
              <button
                type="button"
                className={cn(
                  headerClass,
                  "rounded-md text-start transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
                )}
              />
            }
          >
            {header}
          </CollapsibleTrigger>
        ) : (
          <div className={headerClass}>{header}</div>
        )}
        {expandable ? (
          <CollapsibleContent>
            <div className="mt-3 mb-1 flex min-w-0 flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
              {children}
            </div>
          </CollapsibleContent>
        ) : null}
      </Collapsible>
      {result ? <div className="mt-3">{result}</div> : null}
    </div>
  );
}
