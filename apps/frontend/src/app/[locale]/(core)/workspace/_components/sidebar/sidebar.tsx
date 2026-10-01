"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { NovelView } from "./views/novel-view";
import { CharactersView } from "./views/characters-view";
import { SearchView } from "./views/search-view";
import { SidebarPlaceholderView } from "./views/placeholder-view";
import { SidebarNav } from "./sidebar-nav";
import type { SidebarView } from "./types";

interface SidebarProps {
  novelId: string;
  activeChapterId?: string;
  initialView?: SidebarView;
  onSelectNovel: (novelId: string) => void;
  onSelectChapter: (chapterId: string) => void;
  onSelectView?: (view: SidebarView) => void;
}

export function Sidebar({
  novelId,
  activeChapterId,
  initialView = "novel",
  onSelectNovel,
  onSelectChapter,
  onSelectView,
}: SidebarProps) {
  const t = useTranslations("sidebar");
  const [view, setView] = useState<SidebarView>(initialView);
  const selectView = (nextView: SidebarView) => {
    setView(nextView);
    onSelectView?.(nextView);
  };

  return (
    <aside
      aria-label={t("title")}
      className="flex h-full min-h-0 flex-col bg-muted text-foreground"
    >
      <SidebarNav active={view} onSelect={selectView} />
      {view === "novel" ? (
        <NovelView
          novelId={novelId}
          activeChapterId={activeChapterId}
          onSelectNovel={onSelectNovel}
          onSelectChapter={onSelectChapter}
        />
      ) : view === "search" ? (
        <SearchView
          novelId={novelId}
          activeChapterId={activeChapterId}
          onSelectChapter={onSelectChapter}
        />
      ) : view === "characters" ? (
        <CharactersView novelId={novelId} />
      ) : (
        <SidebarPlaceholderView view={view} />
      )}
    </aside>
  );
}
