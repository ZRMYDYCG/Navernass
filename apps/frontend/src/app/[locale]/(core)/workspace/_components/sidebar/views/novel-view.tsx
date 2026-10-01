"use client";

import { ScrollArea } from "@/components/ui/scroll-area";

import { ChapterOutline } from "./chapter-outline";
import { NovelSelector } from "./novel-selector";

interface NovelViewProps {
  novelId: string;
  activeChapterId?: string;
  onSelectNovel: (novelId: string) => void;
  onSelectChapter: (chapterId: string) => void;
}

export function NovelView({
  novelId,
  activeChapterId,
  onSelectNovel,
  onSelectChapter,
}: NovelViewProps) {
  return (
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
  );
}
