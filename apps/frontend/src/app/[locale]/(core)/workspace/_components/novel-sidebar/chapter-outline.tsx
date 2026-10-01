"use client";

import { ChevronRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { useNovelChapters, useNovelVolumes } from "@/servers/library.server";
import type { ChapterSummary, Volume } from "@/lib/http/modules/library.schema";

interface ChapterGroup {
  /** 缺省表示未分卷的章节。 */
  volume?: Volume;
  chapters: ChapterSummary[];
}

function groupChaptersByVolume(volumes: Volume[], chapters: ChapterSummary[]): ChapterGroup[] {
  const groups = volumes.map((volume): ChapterGroup => ({ volume, chapters: [] }));
  const groupByVolumeId = new Map(groups.map((group) => [group.volume?.id, group]));
  const ungrouped: ChapterSummary[] = [];
  for (const chapter of chapters) {
    const group = chapter.volume_id ? groupByVolumeId.get(chapter.volume_id) : undefined;
    (group?.chapters ?? ungrouped).push(chapter);
  }
  return ungrouped.length ? [...groups, { chapters: ungrouped }] : groups;
}

interface VolumeGroupProps {
  title: string;
  chapterCount: number;
  defaultExpanded: boolean;
  children: ReactNode;
}

function VolumeGroup({ title, chapterCount, defaultExpanded, children }: VolumeGroupProps) {
  const t = useTranslations("novelSidebar");
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <CollapsibleTrigger className="group/trigger flex w-full min-w-0">
        <span className="flex w-full min-w-0 items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold transition-colors hover:bg-accent">
          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-panel-open/trigger:rotate-90" />
          <span className="min-w-0 flex-1 truncate text-start">{title}</span>
          <span className="shrink-0 text-xs font-normal text-muted-foreground">
            {t("chapterCount", { count: chapterCount })}
          </span>
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="my-1 ml-6 flex flex-col gap-0.5">{children}</ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ChapterLink({
  chapter,
  active,
  onSelect,
}: {
  chapter: ChapterSummary;
  active: boolean;
  onSelect: () => void;
}) {
  const t = useTranslations("novelSidebar");

  return (
    <li>
      <button
        type="button"
        aria-current={active ? "page" : undefined}
        data-active={active || undefined}
        onClick={onSelect}
        className="group/chapter flex w-full items-center gap-2 rounded-md px-3 py-2 text-start transition-colors outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring data-active:bg-accent data-active:text-accent-foreground"
      >
        <span className="min-w-0 flex-1 truncate text-sm group-data-active/chapter:font-medium">
          {chapter.title}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {t("chapterMeta", {
            status: t(`chapterStatus.${chapter.status}`),
            count: chapter.word_count,
          })}
        </span>
      </button>
    </li>
  );
}

interface ChapterOutlineProps {
  novelId: string;
  activeChapterId?: string;
  onSelectChapter: (chapterId: string) => void;
}

export function ChapterOutline({ novelId, activeChapterId, onSelectChapter }: ChapterOutlineProps) {
  const t = useTranslations("novelSidebar");
  const volumes = useNovelVolumes(novelId);
  const chapters = useNovelChapters(novelId);

  if (volumes.isError || chapters.isError) {
    return <p className="p-4 text-sm text-destructive">{t("loadError")}</p>;
  }

  if (!volumes.data || !chapters.data) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-5 w-2/3" />
      </div>
    );
  }

  const groups = groupChaptersByVolume(volumes.data, chapters.data);

  if (!groups.length) {
    return <p className="p-4 text-center text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      {groups.map((group, index) => {
        const containsActive = group.chapters.some((chapter) => chapter.id === activeChapterId);
        return (
          <VolumeGroup
            key={group.volume?.id ?? "ungrouped"}
            title={group.volume?.title ?? t("ungrouped")}
            chapterCount={group.chapters.length}
            defaultExpanded={containsActive || (!activeChapterId && index === 0)}
          >
            {group.chapters.map((chapter) => (
              <ChapterLink
                key={chapter.id}
                chapter={chapter}
                active={chapter.id === activeChapterId}
                onSelect={() => onSelectChapter(chapter.id)}
              />
            ))}
          </VolumeGroup>
        );
      })}
    </div>
  );
}
