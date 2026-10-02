"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getChangelog } from "@/lib/http/modules/changelog.api";
import type { ChangelogEntry } from "@/lib/http/modules/changelog.schema";

const pageSize = 30;

function CommitItem({ entry }: { entry: ChangelogEntry }) {
  const locale = useLocale();
  const date = new Date(entry.date);

  return (
    <li className="flex flex-col gap-1 px-4 py-3">
      <div className="flex items-baseline justify-between gap-4">
        <span className="min-w-0 truncate text-sm font-medium">{entry.subject}</span>
        <time className="shrink-0 text-xs text-muted-foreground" dateTime={date.toISOString()}>
          {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date)}
        </time>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{entry.author}</span>
        <a
          href={`https://github.com/ZRMYDYCG/Navernass/commit/${entry.sha}`}
          target="_blank"
          rel="noreferrer"
          className="font-mono hover:text-foreground hover:underline"
        >
          {entry.sha.slice(0, 7)}
        </a>
      </div>
    </li>
  );
}

export function Changelog() {
  const t = useTranslations("settings.changelog");
  const { data, isPending, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["changelog"],
      queryFn: ({ pageParam }) => getChangelog(pageParam, pageSize),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === pageSize ? allPages.length + 1 : undefined,
    });
  const entries = data?.pages.flat() ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">{t("title")}</h2>
      {isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-muted-foreground">{t("loadFailed")}</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <>
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
            {entries.map((entry) => (
              <CommitItem key={entry.sha} entry={entry} />
            ))}
          </ul>
          {hasNextPage ? (
            <Button
              variant="outline"
              size="sm"
              disabled={isFetchingNextPage}
              className="self-center"
              onClick={() => fetchNextPage()}
            >
              {t("loadMore")}
            </Button>
          ) : (
            <p className="text-center text-xs text-muted-foreground">{t("allLoaded")}</p>
          )}
        </>
      )}
    </div>
  );
}
