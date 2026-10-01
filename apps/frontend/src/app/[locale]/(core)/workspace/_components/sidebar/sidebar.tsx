"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Novel } from "./views/novel";
import { Characters } from "./views/characters";
import { Search } from "./views/search";
import { Placeholder } from "./views/placeholder";
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
        <Novel
          novelId={novelId}
          activeChapterId={activeChapterId}
          onSelectNovel={onSelectNovel}
          onSelectChapter={onSelectChapter}
        />
      ) : view === "search" ? (
        <Search
          novelId={novelId}
          activeChapterId={activeChapterId}
          onSelectChapter={onSelectChapter}
        />
      ) : view === "characters" ? (
        <Characters novelId={novelId} />
      ) : (
        <Placeholder view={view} />
      )}
    </aside>
  );
}
