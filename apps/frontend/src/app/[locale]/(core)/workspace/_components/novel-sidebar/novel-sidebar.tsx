"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CharacterLibrary } from "@/features/novel-graph/panels/character-library";

import { ActivityBar, type SidebarView } from "./activity-bar";
import { ChapterOutline } from "./chapter-outline";
import { ChapterSearch } from "./chapter-search";
import { NovelSelector } from "./novel-selector";

interface NovelSidebarProps {
  novelId: string;
  activeChapterId?: string;
  initialView?: SidebarView;
  onSelectNovel: (novelId: string) => void;
  onSelectChapter: (chapterId: string) => void;
  onSelectView?: (view: SidebarView) => void;
}

function PlaceholderView({ view }: { view: Exclude<SidebarView, "novel"> }) {
  const t = useTranslations("novelSidebar.views");

  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{t(view)}</EmptyTitle>
        <EmptyDescription>{t("comingSoon")}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function NovelSidebar({
  novelId,
  activeChapterId,
  initialView = "novel",
  onSelectNovel,
  onSelectChapter,
  onSelectView,
}: NovelSidebarProps) {
  const t = useTranslations("novelSidebar");
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
      <ActivityBar active={view} onSelect={selectView} />
      {view === "novel" ? (
        <>
          <div className="flex flex-col gap-4 border-b border-border p-4">
            <NovelSelector novelId={novelId} onSelectNovel={onSelectNovel} />
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <ChapterOutline
              novelId={novelId}
              activeChapterId={activeChapterId}
              onSelectChapter={onSelectChapter}
            />
          </ScrollArea>
        </>
      ) : view === "search" ? (
        <ChapterSearch
          novelId={novelId}
          activeChapterId={activeChapterId}
          onSelectChapter={onSelectChapter}
        />
      ) : view === "characters" ? (
        <CharacterLibrary novelId={novelId} />
      ) : (
        <PlaceholderView view={view} />
      )}
    </aside>
  );
}
