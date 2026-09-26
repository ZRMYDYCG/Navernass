"use client";

import { SendHorizontalIcon, SquareIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { PromptInput } from "@/components/buss/prompt-input";
import type { PromptInputHandle } from "@/components/buss/prompt-input";
import { InputGroupButton } from "@/components/ui/input-group";

interface ComposerProps {
  busy: boolean;
  canSend: boolean;
  onSubmit: (prompt: string) => void;
  onStop: () => void;
}

export function Composer({ busy, canSend, onSubmit, onStop }: ComposerProps) {
  const t = useTranslations("chat");
  const [draft, setDraft] = useState("");
  const inputRef = useRef<PromptInputHandle>(null);

  const send = () => {
    if (!draft.trim() || !canSend) return;
    onSubmit(draft);
    setDraft("");
    inputRef.current?.clear();
  };

  return (
    <div className="px-4 pt-2 pb-6">
      <PromptInput
        ref={inputRef}
        placeholder={t("composer.placeholder")}
        disabled={busy}
        ariaLabel={t("composer.placeholder")}
        onChange={setDraft}
        onSubmit={send}
        addon={
          busy ? (
            <InputGroupButton
              type="button"
              size="icon-sm"
              variant="secondary"
              aria-label={t("composer.stop")}
              onClick={onStop}
            >
              <SquareIcon />
            </InputGroupButton>
          ) : (
            <InputGroupButton
              type="button"
              size="icon-sm"
              variant="default"
              aria-label={t("composer.send")}
              disabled={!draft.trim() || !canSend}
            >
              <SendHorizontalIcon />
            </InputGroupButton>
          )
        }
      />
    </div>
  );
}
