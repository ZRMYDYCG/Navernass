"use client";

import { BookIcon, CheckIcon, ChevronDownIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useNovel, useNovels } from "@/lib/query/library.query";
import type { Novel } from "@/schemas/library.schema";

function NovelCover({ novel, size }: { novel: Novel; size: "sm" | "lg" }) {
  const sizeClass = size === "lg" ? "size-16 rounded-lg" : "size-9 rounded-md";

  if (novel.cover) {
    return (
      // oxlint-disable-next-line nextjs/no-img-element -- 封面是用户填写的任意外链，无法预先配置 next/image 的域名白名单。
      <img src={novel.cover} alt="" className={`${sizeClass} shrink-0 object-cover`} />
    );
  }

  return (
    <span
      className={`${sizeClass} flex shrink-0 items-center justify-center bg-muted text-muted-foreground`}
    >
      <BookIcon className={size === "lg" ? "size-6" : "size-4"} />
    </span>
  );
}

interface NovelSelectorProps {
  novelId: string;
  onSelectNovel: (novelId: string) => void;
}

export function NovelSelector({ novelId, onSelectNovel }: NovelSelectorProps) {
  const t = useTranslations("novelSidebar");
  const format = useFormatter();
  const { data: novel } = useNovel(novelId);
  const novels = useNovels();

  if (!novel) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="size-16 shrink-0" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group w-full" aria-label={t("selectNovel")}>
        <span className="flex w-full items-center gap-3 rounded-lg p-2 text-start transition-colors group-hover:bg-sidebar-accent group-focus-visible:ring-2 group-focus-visible:ring-sidebar-ring">
          <NovelCover novel={novel} size="lg" />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate font-serif text-lg font-bold">{novel.title}</span>
            {novel.description ? (
              <span className="truncate text-sm text-muted-foreground">{novel.description}</span>
            ) : null}
            <span className="text-xs text-muted-foreground">
              {t("novelStats", {
                words: format.number(novel.word_count, {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }),
                status: t(`novelStatus.${novel.status}`),
              })}
            </span>
          </span>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("selectNovel")}</DropdownMenuLabel>
        </DropdownMenuGroup>
        {novels.data?.map((item) => (
          <DropdownMenuItem key={item.id} onClick={() => onSelectNovel(item.id)}>
            <NovelCover novel={item} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{item.title}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {t("novelStats", {
                  words: format.number(item.word_count, {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }),
                  status: t(`novelStatus.${item.status}`),
                })}
              </span>
            </span>
            {item.id === novelId ? <CheckIcon /> : null}
          </DropdownMenuItem>
        ))}
        {novels.isLoading ? (
          <DropdownMenuItem disabled>{t("loadingNovels")}</DropdownMenuItem>
        ) : null}
        {novels.isError ? (
          <DropdownMenuItem disabled>{t("loadNovelsError")}</DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
