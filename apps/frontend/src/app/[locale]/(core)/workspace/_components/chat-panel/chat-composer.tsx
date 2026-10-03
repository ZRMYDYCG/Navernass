"use client";

import {
  ChevronDownIcon,
  ChevronUpIcon,
  CompassIcon,
  PauseIcon,
  PlusCircleIcon,
  PuzzleIcon,
  SearchIcon,
  SendHorizontalIcon,
  SparklesIcon,
  Trash2Icon,
  UsersRoundIcon,
  XIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import {
  PromptInput,
  type ActivationBlock,
  type PromptInputHandle,
} from "@/components/buss/prompt-input";
import { CharacterAvatar } from "@/components/buss/prompt-input/activation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CharacterProfile } from "@/lib/http/modules/library.schema";
import type { Skill } from "@/lib/http/modules/skill.schema";
import { useCharacters, useNovel, useNovelChapters } from "@/servers/library.server";
import { useSkills } from "@/servers/skill.server";
import { useWorkspaceStore } from "@/stores/workspace";
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
  activationBlocks?: ActivationBlock[];
  onChange?: (value: string, blocks: ActivationBlock[]) => void;
  onSent?: () => void;
}

function tokenIndex(text: string, token: string) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`(?:^|\\s)${escaped}(?=\\s|$)`).exec(text);
  return match?.index ?? -1;
}

/** 操作按钮外围的状态柔光。 */
function GlowButton({ glow, children }: { glow: boolean; children: ReactNode }) {
  return (
    <span className="group/send relative isolate inline-flex">
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 transition-opacity duration-300",
          glow ? "opacity-80 group-hover/send:opacity-100" : "opacity-0",
        )}
      >
        <span className="send-glow" />
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
  activationBlocks,
  onChange,
  onSent,
  novelId,
}: ComposerProps) {
  const t = useTranslations("chat");
  const [localDraft, setLocalDraft] = useState("");
  const [blocks, setBlocks] = useState<ActivationBlock[]>(activationBlocks ?? []);
  const [skillMenuOpen, setSkillMenuOpen] = useState(false);
  const [characterDialogOpen, setCharacterDialogOpen] = useState(false);
  const [draftCharacterIds, setDraftCharacterIds] = useState<string[]>([]);
  const composerCharacterIds = useWorkspaceStore((state) => state.composerCharacterIds);
  const setComposerCharacterIds = useWorkspaceStore((state) => state.setComposerCharacterIds);
  const novel = useNovel(novelId);
  const chapters = useNovelChapters(novelId);
  const characters = useCharacters(novelId);
  const skills = useSkills();
  const selectedCharacterIds = novelId ? (composerCharacterIds[novelId] ?? []) : [];
  const selectedCharacters = selectedCharacterIds
    .map((id) => characters.data.find((character) => character.id === id))
    .filter((character): character is CharacterProfile => Boolean(character));
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
      ...characters.data.map((character) => ({
        kind: "character" as const,
        id: character.id,
        label: character.name,
        avatar: character.avatar,
        description: character.description,
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
    [chapters.data, characters.data, novel.data, skills.data],
  );
  const inputRef = useRef<PromptInputHandle>(null);
  const draft = value ?? localDraft;
  const restoredBlocks = useMemo(
    () =>
      activationBlocks ??
      suggestions
        .map((item) => ({
          item,
          index: tokenIndex(draft, `${item.kind === "skill" ? "/" : "@"}${item.label}`),
        }))
        .filter(({ index }) => index >= 0)
        .sort((a, b) => a.index - b.index)
        .map(({ item }) => item),
    [activationBlocks, draft, suggestions],
  );
  const canSubmit = draft.trim().length > 0 && canSend;

  const updateDraft = (next: string, nextBlocks: ActivationBlock[]) => {
    if (value === undefined) setLocalDraft(next);
    onChange?.(next, nextBlocks);
  };

  const send = () => {
    if (!canSubmit) return;
    onSubmit(draft, blocks);
    updateDraft("", []);
    setBlocks([]);
    inputRef.current?.clear();
    onSent?.();
  };

  const insertCharacter = (character: CharacterProfile) => {
    inputRef.current?.insertActivation({
      kind: "character",
      id: character.id,
      label: character.name,
      avatar: character.avatar,
    });
  };

  const openCharacterDialog = () => {
    setDraftCharacterIds(
      selectedCharacterIds.filter((id) => characters.data.some((character) => character.id === id)),
    );
    setCharacterDialogOpen(true);
  };

  const saveCharacterSelection = () => {
    if (!novelId) return;
    setComposerCharacterIds(
      novelId,
      draftCharacterIds.filter((id) => characters.data.some((character) => character.id === id)),
    );
    setCharacterDialogOpen(false);
  };

  return (
    <div className={cn("px-4 pt-2 pb-6", className)}>
      <PromptInput
        ref={inputRef}
        placeholder={t("composer.placeholder")}
        disabled={busy}
        ariaLabel={t("composer.placeholder")}
        initialValue={draft}
        initialBlocks={restoredBlocks}
        suggestions={suggestions}
        header={
          selectedCharacters.length ? (
            <CharacterBar
              characters={selectedCharacters}
              disabled={busy}
              onInsert={insertCharacter}
              onRemove={(id) => {
                if (!novelId) return;
                setComposerCharacterIds(
                  novelId,
                  selectedCharacterIds.filter((item) => item !== id),
                );
              }}
              onClear={() => {
                if (!novelId) return;
                setComposerCharacterIds(novelId, []);
              }}
            />
          ) : null
        }
        onChange={(text, nextBlocks) => {
          updateDraft(text, nextBlocks);
          setBlocks(nextBlocks);
        }}
        onSubmit={send}
        addon={
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-1">
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
              <InputGroupButton
                type="button"
                size="sm"
                variant="ghost"
                disabled={busy || !novelId}
                onClick={openCharacterDialog}
              >
                <UsersRoundIcon />
                {t("composer.characters.button")}
              </InputGroupButton>
            </div>
            {busy ? (
              <GlowButton glow={canPause && !pausing}>
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
      <CharacterDialog
        open={characterDialogOpen}
        characters={characters.data}
        loading={characters.isLoading}
        selectedIds={draftCharacterIds}
        onOpenChange={setCharacterDialogOpen}
        onToggle={(id) =>
          setDraftCharacterIds((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
          )
        }
        onCancel={() => setCharacterDialogOpen(false)}
        onConfirm={saveCharacterSelection}
      />
    </div>
  );
}

function CharacterBar({
  characters,
  disabled,
  onInsert,
  onRemove,
  onClear,
}: {
  characters: CharacterProfile[];
  disabled: boolean;
  onInsert: (character: CharacterProfile) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const t = useTranslations("chat.composer.characters");
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="px-2.5 pt-2">
      <div className={cn("flex items-center justify-between gap-2", !collapsed && "mb-1.5")}>
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <UsersRoundIcon className="size-3.5" />
          {t("selected", { count: characters.length })}
        </span>
        <span className="flex items-center gap-1">
          <Button type="button" size="xs" variant="ghost" disabled={disabled} onClick={onClear}>
            <Trash2Icon />
            {t("clear")}
          </Button>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            aria-pressed={!collapsed}
            onClick={() => setCollapsed((current) => !current)}
          >
            {collapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
            {t(collapsed ? "expand" : "collapse")}
          </Button>
        </span>
      </div>
      {!collapsed ? (
        <div className="flex flex-wrap gap-1.5">
          {characters.map((character) => (
            <div
              key={character.id}
              className="group/character flex h-6 items-center rounded-md border bg-background"
            >
              <button
                type="button"
                disabled={disabled}
                className="flex h-full items-center gap-1.5 px-2 text-xs outline-none disabled:opacity-50"
                aria-label={t("insert", { name: character.name })}
                onClick={() => onInsert(character)}
              >
                <CharacterAvatar
                  avatar={character.avatar}
                  label={character.name}
                  className="size-4"
                />
                {character.name}
              </button>
              <button
                type="button"
                disabled={disabled}
                className="mr-1 flex size-5 items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground disabled:opacity-50"
                aria-label={t("remove", { name: character.name })}
                onClick={() => onRemove(character.id)}
              >
                <XIcon className="size-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CharacterDialog({
  open,
  characters,
  loading,
  selectedIds,
  onOpenChange,
  onToggle,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  characters: CharacterProfile[];
  loading: boolean;
  selectedIds: string[];
  onOpenChange: (open: boolean) => void;
  onToggle: (id: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const t = useTranslations("chat.composer.characters");
  const [keyword, setKeyword] = useState("");
  const normalizedKeyword = keyword.trim().toLocaleLowerCase();
  const visibleCharacters = normalizedKeyword
    ? characters.filter(
        (character) =>
          character.name.toLocaleLowerCase().includes(normalizedKeyword) ||
          character.description.toLocaleLowerCase().includes(normalizedKeyword),
      )
    : characters;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setKeyword("");
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-9/10 sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={t("search")}
          />
        </InputGroup>
        <ScrollArea className="h-120">
          {visibleCharacters.length ? (
            <div className="grid grid-cols-1 gap-2 pr-3 md:grid-cols-2 xl:grid-cols-3">
              {visibleCharacters.map((character) => {
                const checked = selectedIds.includes(character.id);
                const checkboxId = `character-picker-${character.id}`;
                return (
                  <label
                    key={character.id}
                    htmlFor={checkboxId}
                    data-selected={checked || undefined}
                    className="group flex min-h-32 cursor-pointer flex-col rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50 data-selected:border-ring data-selected:bg-muted/60"
                  >
                    <span className="flex items-start gap-3">
                      <Avatar size="lg">
                        {character.avatar ? (
                          <AvatarImage src={character.avatar} alt={character.name} />
                        ) : null}
                        <AvatarFallback>{character.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{character.name}</span>
                        <span className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {character.description || t("noDescription")}
                        </span>
                      </span>
                      <Checkbox
                        id={checkboxId}
                        checked={checked}
                        onCheckedChange={() => onToggle(character.id)}
                      />
                    </span>
                    {character.custom_fields.length ? (
                      <span className="mt-auto pt-3 text-xs text-muted-foreground">
                        {t("fields", { count: character.custom_fields.length })}
                      </span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              {loading ? t("loading") : t(normalizedKeyword ? "noMatch" : "empty")}
            </div>
          )}
        </ScrollArea>
        <DialogFooter>
          <span className="mr-auto self-center text-sm text-muted-foreground">
            {t("selected", { count: selectedIds.length })}
          </span>
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button type="button" onClick={onConfirm}>
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
