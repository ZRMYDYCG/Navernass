"use client";

import {
  CompassIcon,
  PauseIcon,
  PlusCircleIcon,
  PuzzleIcon,
  SendHorizontalIcon,
  SparklesIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

import {
  PromptInput,
  type ActivationBlock,
  type PromptInputHandle,
} from "@/components/buss/prompt-input";
import { InputGroupButton } from "@/components/ui/input-group";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Skill } from "@/lib/http/modules/skill.schema";
import { useNovel, useNovelChapters } from "@/servers/library.server";
import { useSkills } from "@/servers/skill.server";
import { cn } from "cn";

interface ComposerProps {
  busy: boolean;
  pausing: boolean;
  canPause: boolean;
  canSend: boolean;
  novelId?: string;
  onSubmit: (prompt: string, blocks: ActivationBlock[]) => void;
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
  novelId,
}: ComposerProps) {
  const t = useTranslations("chat");
  const [localDraft, setLocalDraft] = useState("");
  const [blocks, setBlocks] = useState<ActivationBlock[]>([]);
  const [skillMenuOpen, setSkillMenuOpen] = useState(false);
  const novel = useNovel(novelId);
  const chapters = useNovelChapters(novelId);
  const skills = useSkills();
  const suggestions = useMemo(
    () => [
      ...(novel.data
        ? [
            {
              kind: "novel" as const,
              id: novel.data.id,
              label: novel.data.title,
              description: novel.data.description ?? undefined,
            },
          ]
        : []),
      ...(chapters.data ?? []).map((chapter) => ({
        kind: "chapter" as const,
        id: chapter.id,
        label: chapter.title,
      })),
      ...(skills.data ?? [])
        .filter((skill) => skill.enabled)
        .map((skill) => ({
          kind: "skill" as const,
          id: skill.id,
          label: skill.slug,
          description: skill.description,
        })),
    ],
    [chapters.data, novel.data, skills.data],
  );
  const inputRef = useRef<PromptInputHandle>(null);
  const draft = value ?? localDraft;
  const canSubmit = draft.trim().length > 0 && canSend;

  const updateDraft = (next: string) => {
    if (value === undefined) setLocalDraft(next);
    onChange?.(next);
  };

  const send = () => {
    if (!canSubmit) return;
    onSubmit(draft, blocks);
    updateDraft("");
    setBlocks([]);
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
        suggestions={suggestions}
        onChange={(text, nextBlocks) => {
          updateDraft(text);
          setBlocks(nextBlocks);
        }}
        onSubmit={send}
        addon={
          <div className="flex w-full items-center justify-between">
            <SkillMenu
              open={skillMenuOpen}
              skills={(skills.data ?? []).filter((skill) => skill.enabled)}
              disabled={busy}
              onOpenChange={setSkillMenuOpen}
              onSelect={(skill) => {
                inputRef.current?.insertActivation({
                  kind: "skill",
                  id: skill.id,
                  label: skill.slug,
                });
                setSkillMenuOpen(false);
              }}
            />
            {busy ? (
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
            )}
          </div>
        }
      />
    </div>
  );
}

function SkillMenu({
  open,
  skills,
  disabled,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  skills: Skill[];
  disabled: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (skill: Skill) => void;
}) {
  const t = useTranslations("chat.composer.skills");
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={<InputGroupButton type="button" size="sm" variant="ghost" disabled={disabled} />}
      >
        <PuzzleIcon />
        {t("button")}
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-96">
        <div className="-m-2.5 overflow-hidden">
          <Command>
            <div className="flex items-center gap-3 border-b border-border px-3 py-2.5">
              <h2 className="shrink-0 text-sm font-semibold">
                {t("enabled", { count: skills.length })}
              </h2>
              <div className="min-w-0 flex-1">
                <CommandInput placeholder={t("search")} />
              </div>
            </div>
            <CommandList className="max-h-73">
              <CommandEmpty>{t("empty")}</CommandEmpty>
              <CommandGroup>
                <div className="flex flex-col gap-1">
                  {skills.map((skill) => (
                    <CommandItem
                      key={skill.id}
                      value={`${skill.slug} ${skill.displayName} ${skill.description}`}
                      onSelect={() => onSelect(skill)}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <SparklesIcon />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{skill.displayName}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {t(skill.isBuiltin ? "builtin" : "custom")}：{skill.description}
                        </span>
                      </span>
                    </CommandItem>
                  ))}
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
          <div className="border-t border-border px-2 py-1.5">
            <button
              type="button"
              disabled
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground opacity-50"
            >
              <PlusCircleIcon className="size-4" />
              {t("add")}
            </button>
            <button
              type="button"
              disabled
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground opacity-50"
            >
              <CompassIcon className="size-4" />
              {t("explore")}
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
