"use client";

import {
  ChevronDownIcon,
  ChevronUpIcon,
  CornerDownLeftIcon,
  MessageCircleQuestionMarkIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import type { PendingQuestion } from "@/lib/agent/message-utils";
import type { AskUserInput, AskUserOutput } from "@/schemas/agent.schema";

type Question = AskUserInput["questions"][number];

interface Draft {
  selected: string[];
  other: string;
  otherActive: boolean;
}

const emptyDraft: Draft = { selected: [], other: "", otherActive: false };

interface AskUserPanelProps {
  question: PendingQuestion;
  disabled?: boolean;
  onSubmit: (output: AskUserOutput) => void;
  onSkip: () => void;
}

function letter(index: number) {
  return String.fromCharCode(65 + index);
}

function isAnswered(draft: Draft) {
  return draft.selected.length > 0 || Boolean(draft.other.trim());
}

/** 输入框上方的提问面板：字母快捷键选择，Enter 继续，Esc 跳过，不锁定输入框。 */
export function AskUserPanel({ question, disabled = false, onSubmit, onSkip }: AskUserPanelProps) {
  const t = useTranslations("chat.askUser");
  const { questions, title } = question.input;
  const [index, setIndex] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  const current = questions[index] ?? questions[0]!;
  const draftOf = (item: Question) => drafts[item.id] ?? emptyDraft;
  const complete = questions.every((item) => isAnswered(draftOf(item)));

  const update = (item: Question, next: Partial<Draft>) => {
    setDrafts((previous) => ({
      ...previous,
      [item.id]: { ...(previous[item.id] ?? emptyDraft), ...next },
    }));
  };

  const goTo = (next: number) => {
    setIndex(Math.min(Math.max(next, 0), questions.length - 1));
  };

  const choose = (item: Question, optionId: string) => {
    const draft = draftOf(item);
    if (item.allowMultiple) {
      update(item, {
        selected: draft.selected.includes(optionId)
          ? draft.selected.filter((id) => id !== optionId)
          : [...draft.selected, optionId],
      });
      return;
    }
    update(item, { selected: [optionId], other: "", otherActive: false });
    if (index < questions.length - 1) goTo(index + 1);
  };

  const activateOther = (item: Question) => {
    update(item, item.allowMultiple ? { otherActive: true } : { selected: [], otherActive: true });
  };

  const submit = () => {
    if (!complete || disabled) return;
    onSubmit({
      status: "answered",
      answers: questions.map((item) => {
        const draft = draftOf(item);
        const other = draft.other.trim();
        return { questionId: item.id, selected: draft.selected, ...(other && { other }) };
      }),
    });
  };

  const skip = () => {
    if (!disabled) onSkip();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.nativeEvent.isComposing) return;
    const typing = event.target instanceof HTMLInputElement;
    if (event.key === "Escape") {
      event.preventDefault();
      if (typing) {
        update(current, { otherActive: Boolean(draftOf(current).other.trim()) });
        panelRef.current?.focus();
      } else skip();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (complete) submit();
      else if (isAnswered(draftOf(current))) goTo(index + 1);
      return;
    }
    if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    } else if (/^[a-z]$/i.test(event.key)) {
      const position = event.key.toLowerCase().charCodeAt(0) - 97;
      const option = current.options[position];
      if (option) {
        event.preventDefault();
        choose(current, option.id);
      } else if (position === current.options.length) {
        event.preventDefault();
        activateOther(current);
      }
    }
  };

  const draft = draftOf(current);

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      role="group"
      aria-label={title ?? t("title")}
      onKeyDown={handleKeyDown}
      className="rounded-lg border border-input bg-muted/30 outline-none focus-visible:border-ring"
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-muted-foreground">
        <div className="flex min-w-0 items-center gap-1.5">
          <MessageCircleQuestionMarkIcon className="size-3.5 shrink-0" />
          <span className="truncate">{title ?? t("title")}</span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={t("previous")}
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
          >
            <ChevronUpIcon />
          </Button>
          <span className="tabular-nums">
            {t("progress", { current: index + 1, total: questions.length })}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={t("next")}
            disabled={index === questions.length - 1}
            onClick={() => goTo(index + 1)}
          >
            <ChevronDownIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={collapsed ? t("expand") : t("collapse")}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </Button>
        </div>
      </div>

      {collapsed ? null : (
        <>
          <div className="px-3 pb-2">
            <p className="mb-2 text-sm font-medium">
              {index + 1}. {current.prompt}
            </p>
            <div
              role={current.allowMultiple ? "group" : "radiogroup"}
              aria-label={current.prompt}
              className="flex flex-col gap-0.5"
            >
              {current.options.map((option, position) => {
                const checked = draft.selected.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    role={current.allowMultiple ? "checkbox" : "radio"}
                    aria-checked={checked}
                    data-checked={checked || undefined}
                    disabled={disabled}
                    onClick={() => choose(current, option.id)}
                    className="group/option flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-start text-sm transition-colors outline-none hover:bg-muted focus-visible:bg-muted disabled:opacity-50 data-checked:bg-muted"
                  >
                    <OptionBadge>{letter(position)}</OptionBadge>
                    <span className="min-w-0 flex-1">{option.label}</span>
                  </button>
                );
              })}
              {draft.otherActive ? (
                <div
                  data-checked={draft.other.trim() ? true : undefined}
                  className="group/option flex items-center gap-2.5 rounded-md bg-muted px-2 py-1.5 text-sm"
                >
                  <OptionBadge>{letter(current.options.length)}</OptionBadge>
                  <input
                    autoFocus
                    value={draft.other}
                    disabled={disabled}
                    placeholder={t("otherPlaceholder")}
                    aria-label={t("other")}
                    onChange={(event) => update(current, { other: event.target.value })}
                    className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => activateOther(current)}
                  className="group/option flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-start text-sm text-muted-foreground transition-colors outline-none hover:bg-muted focus-visible:bg-muted disabled:opacity-50"
                >
                  <OptionBadge>{letter(current.options.length)}</OptionBadge>
                  <span>{t("other")}</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-1 px-3 pb-3">
            <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={skip}>
              {t("skip")}
              <span className="text-xs text-muted-foreground">Esc</span>
            </Button>
            <Button type="button" size="sm" disabled={!complete || disabled} onClick={submit}>
              {t("continue")}
              <CornerDownLeftIcon className="opacity-70" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function OptionBadge({ children }: { children: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded border border-input text-xs font-medium text-muted-foreground",
        "group-data-checked/option:border-primary group-data-checked/option:bg-primary group-data-checked/option:text-primary-foreground",
      )}
    >
      {children}
    </span>
  );
}
