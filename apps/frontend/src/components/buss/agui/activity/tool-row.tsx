"use client";

import { ChevronRightIcon, CircleAlertIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "cn";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Spinner } from "@/components/ui/spinner";
import { isActive, type ToolStatus } from "../tools/tool-call";

export function ToolGroup({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 flex-col">{children}</div>;
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

/** A stable row throughout execution; completing a tool never replaces its container. */
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
    <span className="flex min-w-0 flex-1 items-center gap-2 py-1 text-start text-sm text-muted-foreground">
      {failed ? (
        <CircleAlertIcon className="size-3.5 shrink-0 text-destructive" />
      ) : (
        <Icon className="size-3.5 shrink-0" />
      )}
      <span className={cn("shrink-0", active && "animate-pulse", failed && "text-destructive")}>
        {title}
      </span>
      {summary ? (
        <span className="min-w-0 truncate text-muted-foreground/70">{summary}</span>
      ) : null}
      {status === "interrupted" ? (
        <span className="shrink-0 text-xs text-muted-foreground/70">{t("interrupted")}</span>
      ) : null}
      <span className="ms-auto flex shrink-0 items-center gap-1.5 ps-2 text-xs text-muted-foreground/70">
        {trailing}
        {active ? <Spinner className="size-3.5" /> : null}
        {expandable && !active ? (
          <ChevronRightIcon
            className={cn(
              "size-3.5 opacity-0 transition group-hover/tool:opacity-100 group-focus-visible/tool:opacity-100 motion-reduce:transition-none",
              open && "rotate-90 opacity-100",
            )}
          />
        ) : null}
      </span>
    </span>
  );

  return (
    <div className="min-w-0">
      <Collapsible open={open} onOpenChange={setUserOpen}>
        {expandable ? (
          <CollapsibleTrigger
            render={
              <button
                type="button"
                className="group/tool flex w-full min-w-0 rounded-md outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            }
          >
            {header}
          </CollapsibleTrigger>
        ) : (
          <div className="flex w-full min-w-0">{header}</div>
        )}
        {expandable ? (
          <CollapsibleContent>
            <div className="ms-5.5 mt-0.5 mb-2 flex min-w-0 flex-col gap-2 text-muted-foreground">
              {children}
            </div>
          </CollapsibleContent>
        ) : null}
      </Collapsible>
      {result ? <div className="mt-1 mb-2">{result}</div> : null}
    </div>
  );
}
