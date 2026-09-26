"use client";

import { ChevronDownIcon, CircleAlertIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "cn";

import { Spinner } from "@/components/ui/spinner";

import { isActive, type ToolStatus } from "./types";

/** 连续的工具调用收进同一个卡片，外观与输入框上方的提问面板一致。 */
export function ToolGroup({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col rounded-lg border border-input bg-muted/30 py-1">{children}</div>
  );
}

interface ToolRowProps {
  icon: LucideIcon;
  title: string;
  summary?: string;
  status: ToolStatus;
  /** 用户未手动切换前，展开状态跟随该值。 */
  autoOpen?: boolean;
  children?: ReactNode;
}

export function ToolRow({
  icon: Icon,
  title,
  summary,
  status,
  autoOpen = false,
  children,
}: ToolRowProps) {
  const t = useTranslations("agui.status");
  const [userOpen, setUserOpen] = useState<boolean>();
  const open = userOpen ?? autoOpen;
  const active = isActive(status);
  const expandable = Boolean(children);

  const content = (
    <>
      {status === "error" ? (
        <CircleAlertIcon className="size-3.5 shrink-0 text-destructive" />
      ) : (
        <Icon className="size-3.5 shrink-0" />
      )}
      <span className={cn("shrink-0", active && "animate-pulse")}>{title}</span>
      {summary ? (
        <span
          className={cn(
            "min-w-0 truncate",
            status === "error" ? "text-destructive" : "text-foreground/70",
          )}
        >
          {summary}
        </span>
      ) : null}
      <span className="ms-auto flex shrink-0 items-center gap-1 ps-1">
        {status === "interrupted" ? <span>{t("interrupted")}</span> : null}
        {active ? <Spinner className="size-3.5" /> : null}
        {expandable && !active ? (
          <ChevronDownIcon className={cn("size-3.5 transition-transform", open && "rotate-180")} />
        ) : null}
      </span>
    </>
  );

  return (
    <div className="px-3 py-1 text-xs text-muted-foreground">
      {expandable ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setUserOpen(!open)}
          className="flex w-full min-w-0 items-center gap-1.5 rounded-md py-0.5 text-start transition-colors outline-none hover:text-foreground focus-visible:text-foreground"
        >
          {content}
        </button>
      ) : (
        <div className="flex w-full min-w-0 items-center gap-1.5 py-0.5">{content}</div>
      )}
      {open && children ? (
        <div className="flex flex-col gap-2 ps-5 pt-1 pb-1.5">{children}</div>
      ) : null}
    </div>
  );
}

export function ToolField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
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
        "max-h-48 overflow-y-auto rounded-md bg-muted px-2.5 py-2 text-xs leading-relaxed wrap-break-word whitespace-pre-wrap",
        tone === "error" ? "text-destructive" : "text-foreground/80",
      )}
    >
      {children}
    </div>
  );
}

export function ToolMeta({ items }: { items: Array<string | false | undefined> }) {
  const visible = items.filter((item): item is string => Boolean(item));
  if (!visible.length) return null;
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground tabular-nums">
      {visible.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

export function ToolMarkdown({ children }: { children: ReactNode }) {
  return (
    <div className="max-h-80 overflow-y-auto rounded-md bg-muted px-3 py-2 text-sm text-foreground">
      {children}
    </div>
  );
}
