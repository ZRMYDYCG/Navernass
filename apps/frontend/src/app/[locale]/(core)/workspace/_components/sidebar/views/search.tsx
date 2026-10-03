"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  CaseSensitiveIcon,
  ChevronRightIcon,
  FileTextIcon,
  RegexIcon,
  ReplaceAllIcon,
  WholeWordIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { updateChapterContent as updateChapterContentApi } from "@/lib/http/modules/library.api";
import type { Chapter } from "@/lib/http/modules/library.schema";
import { libraryKeys, syncChapterCache, useChapterSearch } from "@/servers/library.server";

interface SearchOptions {
  matchCase: boolean;
  wholeWord: boolean;
  regex: boolean;
}

interface TextMatch {
  /** 正文按换行拆分后的行号，与编辑器的段落一一对应。 */
  line: number;
  before: string;
  match: string;
  after: string;
}

const contextBefore = 16;
const contextAfter = 60;

function buildSearchPattern(
  keyword: string,
  { matchCase, wholeWord, regex }: SearchOptions,
): RegExp | null {
  const source = regex ? keyword : keyword.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  // `\b` 只认 ASCII，这里用 Unicode 字母数字判断词边界。
  const anchored = wholeWord ? `(?<![\\p{L}\\p{N}_])${source}(?![\\p{L}\\p{N}_])` : source;
  try {
    return new RegExp(anchored, matchCase ? "gu" : "giu");
  } catch {
    return null;
  }
}

/** 逗号分隔的章节标题过滤表达式，`*` 匹配任意字符，大小写不敏感。 */
function buildTitleTerms(value: string): RegExp[] {
  return value
    .split(/[,，]/u)
    .map((term) => term.trim())
    .filter(Boolean)
    .map(
      (term) =>
        new RegExp(term.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&").replace(/\\\*/gu, ".*"), "iu"),
    );
}

function matchesTitle(title: string, terms: RegExp[]) {
  return terms.some((term) => term.test(title));
}

function findMatches(text: string, pattern: RegExp): TextMatch[] {
  const matches: TextMatch[] = [];
  text.split(/\r?\n/u).forEach((line, index) => {
    for (const found of line.matchAll(pattern)) {
      const start = found.index;
      const end = start + found[0].length;
      const clipped = start > contextBefore;
      matches.push({
        line: index,
        before: `${clipped ? "…" : ""}${line.slice(clipped ? start - contextBefore : 0, start).trimStart()}`,
        match: found[0],
        after: line.slice(end, end + contextAfter),
      });
    }
  });
  return matches;
}

/** 后端单次最多返回的章节数。 */
const chapterLimit = 100;
/** 单章展示的匹配上限，避免高频词撑爆列表。 */
const matchesPerChapter = 50;
const debounceMs = 250;

interface ChapterResult {
  chapter: Chapter;
  matches: TextMatch[];
}

interface SearchProps {
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
  const t = useTranslations("sidebar.search");
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

interface ReplaceSummary {
  matches: number;
  chapters: number;
}

export function Search({ novelId, activeChapterId, onSelectChapter }: SearchProps) {
  const t = useTranslations("sidebar.search");
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [replacement, setReplacement] = useState("");
  const [include, setInclude] = useState("");
  const [exclude, setExclude] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [regex, setRegex] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [replaceSummary, setReplaceSummary] = useState<
    ReplaceSummary | { error: true } | undefined
  >(undefined);

  useEffect(() => {
    const timer = window.setTimeout(() => setKeyword(input.trim()), debounceMs);
    return () => window.clearTimeout(timer);
  }, [input]);

  const search = useChapterSearch(novelId, keyword);
  const pattern = useMemo(
    () => buildSearchPattern(keyword, { matchCase, wholeWord, regex }),
    [keyword, matchCase, wholeWord, regex],
  );

  const results = useMemo<ChapterResult[]>(() => {
    if (!keyword || !search.data || !pattern) return [];
    const includeTerms = buildTitleTerms(include);
    const excludeTerms = buildTitleTerms(exclude);
    return search.data
      .filter(
        (chapter) =>
          (includeTerms.length === 0 || matchesTitle(chapter.title, includeTerms)) &&
          !matchesTitle(chapter.title, excludeTerms),
      )
      .flatMap((chapter) => {
        const matches = findMatches(chapter.content, pattern);
        return matches.length > 0 || chapter.title.search(pattern) >= 0
          ? [{ chapter, matches }]
          : [];
      });
  }, [keyword, search.data, pattern, include, exclude]);

  const matchCount = results.reduce((sum, result) => sum + result.matches.length, 0);
  const canReplace = Boolean(pattern) && !replacing && !search.isPending && results.length > 0;

  async function replaceAll() {
    if (!pattern || !search.data) return;
    // 正则模式原样交给 replace（支持 $1 捕获组）；字面模式把 $ 当普通字符。
    const to = regex ? replacement : replacement.replace(/\$/gu, "$$$$");
    let matches = 0;
    let chapters = 0;
    setReplacing(true);
    setReplaceSummary(undefined);
    try {
      for (const { chapter, matches: found } of results) {
        if (found.length === 0) continue;
        const next = chapter.content.replace(pattern, to);
        if (next === chapter.content) continue;
        const updated = await updateChapterContentApi(chapter.id, next);
        syncChapterCache(queryClient, updated);
        matches += found.length;
        chapters += 1;
      }
      await queryClient.invalidateQueries({
        queryKey: libraryKeys.chapterSearch(novelId, keyword),
      });
      setReplaceSummary({ matches, chapters });
    } catch {
      setReplaceSummary({ error: true });
    } finally {
      setReplacing(false);
    }
  }

  let status: string | undefined;
  if (replacing) {
    status = t("replacing");
  } else if (replaceSummary) {
    status =
      "error" in replaceSummary
        ? t("replaceError")
        : t("replaceDone", { matches: replaceSummary.matches, chapters: replaceSummary.chapters });
  } else if (keyword) {
    if (!pattern) status = t("invalidRegex");
    else if (search.isError) status = t("error");
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
            onChange={(event) => {
              setInput(event.target.value);
              setReplaceSummary(undefined);
            }}
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
            <InputGroupButton
              size="icon-xs"
              variant={regex ? "secondary" : "ghost"}
              aria-label={t("regex")}
              aria-pressed={regex}
              onClick={() => setRegex((value) => !value)}
            >
              <RegexIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput
            value={replacement}
            maxLength={100}
            placeholder={t("replacePlaceholder")}
            aria-label={t("replacePlaceholder")}
            onChange={(event) => {
              setReplacement(event.target.value);
              setReplaceSummary(undefined);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && canReplace) replaceAll();
            }}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              variant="ghost"
              aria-label={t("replaceAll")}
              disabled={!canReplace}
              onClick={replaceAll}
            >
              <ReplaceAllIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <div className="flex flex-col gap-1">
          <label htmlFor="search-include" className="px-1 text-xs text-muted-foreground">
            {t("include")}
          </label>
          <Input
            id="search-include"
            value={include}
            maxLength={200}
            placeholder={t("titleFilter")}
            onChange={(event) => setInclude(event.target.value)}
          />
          <label htmlFor="search-exclude" className="px-1 text-xs text-muted-foreground">
            {t("exclude")}
          </label>
          <Input
            id="search-exclude"
            value={exclude}
            maxLength={200}
            placeholder={t("titleFilter")}
            onChange={(event) => setExclude(event.target.value)}
          />
        </div>
        {status ? (
          <p role="status" className="px-1 text-xs text-muted-foreground">
            {status}
            {search.data?.length === chapterLimit && !replaceSummary && !replacing
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
