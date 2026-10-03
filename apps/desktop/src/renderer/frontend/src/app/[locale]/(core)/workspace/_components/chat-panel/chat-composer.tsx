"use client";

import { PauseIcon, SendHorizontalIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { PromptInput } from "@/app/[locale]/(core)/workspace/_components/chat-panel/prompt-input";
import type { PromptInputHandle } from "@/app/[locale]/(core)/workspace/_components/chat-panel/prompt-input";
import { InputGroupButton } from "@/components/ui/input-group";
import { cn } from "cn";

interface ComposerProps {
  busy: boolean;
  pausing: boolean;
  canPause: boolean;
  canSend: boolean;
  onSubmit: (prompt: string) => void;
  onPause: () => void;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSent?: () => void;
}

export function Composer({
  busy,
  pausing,
  canPause,
  canSend,
  onSubmit,
  onPause,
  className,
  value,
  onChange,
  onSent,
}: ComposerProps) {
  const t = useTranslations("chat");
  const [localDraft, setLocalDraft] = useState("");
  const inputRef = useRef<PromptInputHandle>(null);
  const draft = value ?? localDraft;

  const updateDraft = (next: string) => {
    if (value === undefined) setLocalDraft(next);
    onChange?.(next);
  };

  const send = () => {
    if (!draft.trim() || !canSend) return;
    onSubmit(draft);
    updateDraft("");
    inputRef.current?.clear();
    onSent?.();
  };

  return (
    <div className={cn("px-4 pt-2 pb-6", className)}>
      <PromptInput
        ref={inputRef}
        placeholder={t("composer.placeholder")}
        disabled={busy}
        ariaLabel={t("composer.placeholder")}
        initialValue={draft}
        onChange={updateDraft}
        onSubmit={send}
        addon={
          busy ? (
            <InputGroupButton
              type="button"
              size="icon-sm"
              variant="secondary"
              aria-label={t(pausing ? "composer.pausing" : "composer.pause")}
              disabled={pausing || !canPause}
              onClick={onPause}
            >
              <PauseIcon />
            </InputGroupButton>
          ) : (
            <InputGroupButton
              type="button"
              size="icon-sm"
              variant="default"
              aria-label={t("composer.send")}
              disabled={!draft.trim() || !canSend}
              onClick={send}
            >
              <SendHorizontalIcon />
            </InputGroupButton>
          )
        }
      />
    </div>
  );
}
