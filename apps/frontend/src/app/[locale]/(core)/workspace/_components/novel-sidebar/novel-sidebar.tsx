"use client";

import { SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";

import { ChapterOutline } from "./chapter-outline";
import { NovelSelector } from "./novel-selector";

interface NovelSidebarProps {
  novelId: string;
  activeChapterId?: string;
  onSelectNovel: (novelId: string) => void;
  onSelectChapter: (chapterId: string) => void;
}

function ChapterSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const t = useTranslations("novelSidebar");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focusOnShortcut = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", focusOnShortcut);
    return () => window.removeEventListener("keydown", focusOnShortcut);
  }, []);

  return (
    <InputGroup>
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        ref={inputRef}
        type="search"
        value={value}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchPlaceholder")}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") onChange("");
        }}
      />
      <InputGroupAddon align="inline-end">
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </InputGroupAddon>
    </InputGroup>
  );
}

export function NovelSidebar({
  novelId,
  activeChapterId,
  onSelectNovel,
  onSelectChapter,
}: NovelSidebarProps) {
  const t = useTranslations("novelSidebar");
  const [keyword, setKeyword] = useState("");

  return (
    <aside
      aria-label={t("title")}
      className="flex h-full min-h-0 flex-col bg-muted text-foreground"
    >
      <div className="flex flex-col gap-4 border-b border-border p-4">
        <NovelSelector novelId={novelId} onSelectNovel={onSelectNovel} />
        <ChapterSearch value={keyword} onChange={setKeyword} />
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <ChapterOutline
          novelId={novelId}
          keyword={keyword}
          activeChapterId={activeChapterId}
          onSelectChapter={onSelectChapter}
        />
      </ScrollArea>
    </aside>
  );
}
