"use client";

import {
  CheckIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  CirclePauseIcon,
  CircleHelpIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "cn";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Spinner } from "@/components/ui/spinner";
import { isActive, type ToolStatus } from "../tools/tool-call";

export function ToolGroup({ children }: { children: ReactNode }) {
  return <div className="min-w-0 border-s border-border/80 ps-2 font-mono text-xs">{children}</div>;
}

interface ToolRowProps {
  icon: LucideIcon;
  title: string;
  command?: string;
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
  command,
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
  const open = userOpen ?? (initialOpen || status === "error");
  const active = isActive(status);
  const expandable = Boolean(children);
  const StatusIcon =
    status === "error"
      ? CircleAlertIcon
      : status === "interrupted"
        ? CirclePauseIcon
        : status === "waiting"
          ? CircleHelpIcon
          : CheckIcon;
  const header = (
    <div className="flex min-w-0 flex-1 items-start gap-2 py-1.5 text-start">
      <span className="mt-0.5 shrink-0 text-muted-foreground">
        <Icon className="size-3.5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-medium text-foreground">{title}</span>
          {command ? <span className="break-all text-muted-foreground">{command}</span> : null}
        </span>
        {summary ? (
          <span className="line-clamp-2 break-words font-sans text-xs leading-relaxed text-muted-foreground">
            {summary}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "flex shrink-0 items-center gap-1 pt-0.5 text-muted-foreground",
          status === "error" && "text-destructive",
        )}
      >
        {trailing}
        {active ? <Spinner className="size-3" /> : <StatusIcon className="size-3" />}
        <span>{t(status)}</span>
        {expandable ? (
          <ChevronRightIcon
            className={cn(
              "size-3 transition-transform motion-reduce:transition-none",
              open && "rotate-90",
            )}
          />
        ) : null}
      </span>
    </div>
  );
  return (
    <div className="min-w-0">
      <Collapsible open={open} onOpenChange={setUserOpen}>
        {expandable ? (
          <CollapsibleTrigger
            render={
              <button
                type="button"
                className="flex w-full min-w-0 rounded-sm outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
              />
            }
          >
            {header}
          </CollapsibleTrigger>
        ) : (
          header
        )}
        {expandable ? (
          <CollapsibleContent>
            <div className="ms-1.5 mb-2 flex min-w-0 flex-col gap-2 border-s border-border/80 ps-4 pt-1 font-sans">
              {children}
            </div>
          </CollapsibleContent>
        ) : null}
      </Collapsible>
      {result ? <div className="pb-2 pt-1 font-sans">{result}</div> : null}
    </div>
  );
}
