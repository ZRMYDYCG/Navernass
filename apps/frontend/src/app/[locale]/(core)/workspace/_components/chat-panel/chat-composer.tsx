"use client";

import { PauseIcon, SendHorizontalIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

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

/** streaming 状态下加速旋转与呼吸。 */
const fastGlow: CSSProperties & Record<"--send-glow-spin" | "--send-glow-breathe", string> = {
  "--send-glow-breathe": "1.2s",
  "--send-glow-spin": "1.6s",
};

/** 操作按钮外围的状态炫光：点亮时旋转呼吸，悬停增强，streaming 时加速。 */
function GlowButton({
  glow,
  fast = false,
  children,
}: {
  glow: boolean;
  fast?: boolean;
  children: ReactNode;
}) {
  return (
    <span className="group/send relative inline-flex">
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 transition-all duration-500",
          glow ? "opacity-100 group-hover/send:scale-125" : "opacity-0",
        )}
      >
        <span className="send-glow" style={fast ? fastGlow : undefined} />
      </span>
      {children}
    </span>
  );
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
  const canSubmit = draft.trim().length > 0 && canSend;

  const updateDraft = (next: string) => {
    if (value === undefined) setLocalDraft(next);
    onChange?.(next);
  };

  const send = () => {
    if (!canSubmit) return;
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
            <GlowButton glow={canPause && !pausing} fast>
              <InputGroupButton
                type="button"
                size="icon-sm"
                variant="secondary"
                aria-label={t(pausing ? "composer.pausing" : "composer.pause")}
                disabled={pausing || !canPause}
                onClick={onPause}
                className="relative"
              >
                <PauseIcon />
              </InputGroupButton>
            </GlowButton>
          ) : (
            <GlowButton glow={canSubmit}>
              <InputGroupButton
                type="button"
                size="icon-sm"
                variant={canSubmit ? "default" : "secondary"}
                aria-label={t("composer.send")}
                disabled={!canSubmit}
                onClick={send}
                className="relative not-disabled:hover:scale-105 not-disabled:active:scale-95"
              >
                <SendHorizontalIcon />
              </InputGroupButton>
            </GlowButton>
          )
        }
      />
    </div>
  );
}
