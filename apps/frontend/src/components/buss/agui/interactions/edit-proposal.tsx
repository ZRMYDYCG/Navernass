"use client";

import { ChevronDownIcon, ChevronUpIcon, CornerDownLeftIcon, FilePenLineIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/http/error";
import { useApplyEdit, useEditStatus, useRejectEdit } from "@/lib/query/editor.query";
import {
  type EditOperation,
  type EditProposal,
  type EditStatus,
} from "@/schemas/agent-tool.schema";

import { OptionBadge, optionLetter } from "../shared/option-badge";
import type { ToolCall } from "../tools/tool-call";

const statusVariant: Record<EditStatus, "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  applied: "outline",
  rejected: "outline",
  stale: "destructive",
};

const anchorLength = 40;

function DiffLine({ kind, children }: { kind: "add" | "remove" | "context"; children: ReactNode }) {
  return (
    <span
      className={cn(
        "flex gap-2 px-2 py-1 whitespace-pre-wrap",
        kind === "add" && "bg-accent text-accent-foreground",
        kind === "remove" && "bg-destructive/10 text-destructive",
        kind === "context" && "text-muted-foreground",
      )}
    >
      <span aria-hidden="true" className="w-2 shrink-0 opacity-60 select-none">
        {kind === "add" ? "+" : kind === "remove" ? "−" : ""}
      </span>
      <span className="max-h-40 min-w-0 flex-1 overflow-y-auto wrap-break-word">{children}</span>
    </span>
  );
}

function DiffBlock({ operation }: { operation: EditOperation }) {
  const anchor = operation.anchor;
  const before =
    operation.type === "insert_after" && anchor
      ? `${anchor.length > anchorLength ? "…" : ""}${anchor.slice(-anchorLength)}`
      : undefined;
  const after =
    operation.type === "insert_before" && anchor
      ? `${anchor.slice(0, anchorLength)}${anchor.length > anchorLength ? "…" : ""}`
      : undefined;
  return (
    <span className="flex flex-col overflow-hidden rounded-md border border-input font-mono text-xs leading-relaxed">
      {before ? <DiffLine kind="context">{before}</DiffLine> : null}
      {operation.oldText ? <DiffLine kind="remove">{operation.oldText}</DiffLine> : null}
      {operation.newText ? <DiffLine kind="add">{operation.newText}</DiffLine> : null}
      {after ? <DiffLine kind="context">{after}</DiffLine> : null}
    </span>
  );
}

/** 修改提案卡片：与提问面板一致的字母快捷键，字母切换勾选，Enter 应用所选。 */
export function EditProposalCard({ output }: { call: ToolCall; output: EditProposal }) {
  const t = useTranslations("agui.edit");
  const { proposalId, operations } = output;
  const remote = useEditStatus(proposalId, { enabled: output.status === "pending" });
  const apply = useApplyEdit(proposalId);
  const reject = useRejectEdit(proposalId);
  const [collapsed, setCollapsed] = useState(false);
  const [selected, setSelected] = useState(() => operations.map((operation) => operation.id));

  const status = remote.data?.status ?? output.status;
  const pending = status === "pending";
  const busy = apply.isPending || reject.isPending;
  const error = apply.error ?? reject.error;
  const interactive = pending && !busy;

  const toggle = (id: string) => {
    if (!interactive) return;
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const submit = () => {
    if (interactive && selected.length) apply.mutate(selected);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.nativeEvent.isComposing || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === "Enter") {
      // Let focused buttons perform their own action (especially Reject).
      if (event.target !== event.currentTarget) return;
      event.preventDefault();
      submit();
      return;
    }
    if (!/^[a-z]$/i.test(event.key)) return;
    const operation = operations[event.key.toLowerCase().charCodeAt(0) - 97];
    if (!operation) return;
    event.preventDefault();
    toggle(operation.id);
  };

  return (
    <div
      tabIndex={0}
      role="group"
      aria-label={t("title")}
      onKeyDown={handleKeyDown}
      className="min-w-0 rounded-lg border border-border bg-background outline-none focus-visible:border-ring"
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-muted-foreground">
        <div className="flex min-w-0 items-center gap-1.5">
          <FilePenLineIcon className="size-3.5 shrink-0" />
          <span className="shrink-0">{t("title")}</span>
          <span className="min-w-0 truncate text-foreground/70">{output.chapterTitle}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Badge variant={statusVariant[status]}>{t(`status.${status}`)}</Badge>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={collapsed ? t("expand") : t("collapse")}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
          </Button>
        </div>
      </div>

      {collapsed ? null : (
        <>
          <div className="px-3 pb-2">
            <p className="mb-2 text-sm font-medium">{output.summary}</p>
            <div role="group" aria-label={output.summary} className="flex flex-col gap-0.5">
              {operations.map((operation, position) => {
                const checked = selected.includes(operation.id);
                return (
                  <button
                    key={operation.id}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    data-checked={checked || undefined}
                    disabled={!interactive}
                    onClick={() => toggle(operation.id)}
                    className="group/option flex w-full items-start gap-2.5 rounded-md px-2 py-1.5 text-start text-sm transition-colors outline-none enabled:hover:bg-muted focus-visible:bg-muted disabled:cursor-default data-checked:bg-muted"
                  >
                    <OptionBadge>{optionLetter(position)}</OptionBadge>
                    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span className="text-xs text-muted-foreground">
                        {t(`type.${operation.type}`)} · {operation.reason}
                      </span>
                      <DiffBlock operation={operation} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {error ? (
            <p className="px-3 pb-2 text-xs text-destructive">{getErrorMessage(error)}</p>
          ) : null}
          {status === "stale" ? (
            <p className="px-3 pb-3 text-xs text-muted-foreground">{t("staleHint")}</p>
          ) : null}
          {pending ? (
            <div className="flex flex-wrap items-center justify-end gap-1 border-t border-border px-3 py-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => reject.mutate()}
              >
                {t("reject")}
              </Button>
              <Button type="button" size="sm" disabled={!selected.length || busy} onClick={submit}>
                {t("apply", { count: selected.length, total: operations.length })}
                <CornerDownLeftIcon className="opacity-70" />
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
