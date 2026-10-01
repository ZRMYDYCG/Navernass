"use client";

import { CaseSensitiveIcon, ChevronRightIcon, FileTextIcon, WholeWordIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChapterSearch } from "@/hooks/library/queries";
import type { Chapter } from "@/lib/http/modules/library.schema";

import { buildSearchPattern, findMatches, type TextMatch } from "./text-search";

/** 后端单次最多返回的章节数。 */
const chapterLimit = 100;
/** 单章展示的匹配上限，避免高频词撑爆列表。 */
const matchesPerChapter = 50;
const debounceMs = 250;

interface ChapterResult {
  chapter: Chapter;
  matches: TextMatch[];
}

interface ChapterSearchProps {
  novelId: string;
  activeChapterId?: string;
  onSelectChapter: (chapterId: string) => void;
}

function ResultGroup({
  result: { chapter, matches },
  active,
  onSelect,
}: {
  result: ChapterResult;
  active: boolean;
  onSelect: () => void;
}) {
  const t = useTranslations("novelSidebar.search");
  const [expanded, setExpanded] = useState(true);
  const hidden = matches.length - matchesPerChapter;

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <CollapsibleTrigger className="group/trigger flex w-full min-w-0">
        <span className="flex w-full min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-accent">
          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-panel-open/trigger:rotate-90" />
          <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-start font-medium">{chapter.title}</span>
          {matches.length > 0 ? (
            <span className="shrink-0 rounded-full bg-background px-1.5 text-xs text-muted-foreground tabular-nums">
              {matches.length}
            </span>
          ) : null}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="mb-1 ml-5 flex flex-col">
          {matches.slice(0, matchesPerChapter).map((match, index) => (
            <li key={`${match.line}-${index}`}>
              <button
                type="button"
                aria-current={active ? "true" : undefined}
                className="w-full truncate rounded-md px-2 py-0.5 text-start text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                onClick={onSelect}
              >
                {match.before}
                <mark className="rounded-sm bg-primary/25 text-foreground">{match.match}</mark>
                {match.after}
              </button>
            </li>
          ))}
          {hidden > 0 ? (
            <li className="px-2 py-0.5 text-xs text-muted-foreground">
              {t("moreMatches", { count: hidden })}
            </li>
          ) : null}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ChapterSearch({ novelId, activeChapterId, onSelectChapter }: ChapterSearchProps) {
  const t = useTranslations("novelSidebar.search");
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setKeyword(input.trim()), debounceMs);
    return () => window.clearTimeout(timer);
  }, [input]);

  const search = useChapterSearch(novelId, keyword);

  const results = useMemo<ChapterResult[]>(() => {
    if (!keyword || !search.data) return [];
    const pattern = buildSearchPattern(keyword, { matchCase, wholeWord });
    return search.data.flatMap((chapter) => {
      const matches = findMatches(chapter.content, pattern);
      return matches.length > 0 || chapter.title.search(pattern) >= 0 ? [{ chapter, matches }] : [];
    });
  }, [keyword, search.data, matchCase, wholeWord]);

  const matchCount = results.reduce((sum, result) => sum + result.matches.length, 0);

  let status: string | undefined;
  if (keyword) {
    if (search.isError) status = t("error");
    else if (search.isPending) status = t("searching");
    else if (results.length === 0) status = t("noResults");
    else status = t("summary", { matches: matchCount, chapters: results.length });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-2 border-b border-border p-3">
        <InputGroup>
          <InputGroupInput
            type="search"
            value={input}
            maxLength={100}
            placeholder={t("placeholder")}
            aria-label={t("placeholder")}
            autoFocus
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setInput("");
            }}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              variant={matchCase ? "secondary" : "ghost"}
              aria-label={t("matchCase")}
              aria-pressed={matchCase}
              onClick={() => setMatchCase((value) => !value)}
            >
              <CaseSensitiveIcon />
            </InputGroupButton>
            <InputGroupButton
              size="icon-xs"
              variant={wholeWord ? "secondary" : "ghost"}
              aria-label={t("wholeWord")}
              aria-pressed={wholeWord}
              onClick={() => setWholeWord((value) => !value)}
            >
              <WholeWordIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        {status ? (
          <p role="status" className="px-1 text-xs text-muted-foreground">
            {status}
            {search.data?.length === chapterLimit
              ? ` ${t("truncated", { count: chapterLimit })}`
              : null}
          </p>
        ) : null}
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-0.5 p-2">
          {results.map((result) => (
            <ResultGroup
              key={result.chapter.id}
              result={result}
              active={result.chapter.id === activeChapterId}
              onSelect={() => onSelectChapter(result.chapter.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
