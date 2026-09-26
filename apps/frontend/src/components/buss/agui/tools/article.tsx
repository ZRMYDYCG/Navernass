"use client";

import { BookOpenTextIcon, FileTextIcon, LibraryBigIcon, TextSearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { z } from "zod";

import {
  chapterOutputSchema,
  novelSnapshotOutputSchema,
  readArticleOutputSchema,
  searchArticleInputSchema,
  searchArticleOutputSchema,
} from "@/schemas/agent-tool.schema";

import { ToolExcerpt, ToolMeta } from "../activity/tool-detail";
import { defineTool, quote, type ToolProps } from "./define";

const contextLength = 60;

type SnapshotProps = ToolProps<unknown, z.infer<typeof novelSnapshotOutputSchema>>;

function SnapshotDetail({ output }: SnapshotProps) {
  const t = useTranslations("agui.detail");
  if (!output) return null;
  const stats = [
    ["chapters", output.chapters.length],
    ["volumes", output.volumes.length],
    ["worldbook", output.worldbook.length],
    ["outlines", output.outlines.length],
    ["timeline", output.timeline_events.length],
  ] as const;
  return (
    <dl className="grid grid-cols-3 gap-1 text-center">
      {stats.map(([key, count]) => (
        <div key={key} className="flex flex-col-reverse py-0.5">
          <dt className="text-xs text-muted-foreground">{t(key)}</dt>
          <dd className="text-sm font-medium text-foreground tabular-nums">{count}</dd>
        </div>
      ))}
    </dl>
  );
}

export const getNovelSnapshot = defineTool({
  icon: LibraryBigIcon,
  output: novelSnapshotOutputSchema,
  summary: (t, { output }) =>
    output
      ? `${output.title} · ${t("detail.chapterCount", { count: output.chapters.length })}`
      : undefined,
  Detail: SnapshotDetail,
});

type ChapterProps = ToolProps<unknown, z.infer<typeof chapterOutputSchema>>;

function ChapterDetail({ output }: ChapterProps) {
  const t = useTranslations("agui.detail");
  if (!output) return null;
  return (
    <>
      <ToolMeta
        items={[
          t("revision", { revision: output.revision }),
          t("wordCount", { count: output.word_count }),
        ]}
      />
      <ToolExcerpt>{output.content}</ToolExcerpt>
    </>
  );
}

export const getChapter = defineTool({
  icon: FileTextIcon,
  output: chapterOutputSchema,
  summary: (_, { output }) => output?.title,
  Detail: ChapterDetail,
});

type ReadArticleProps = ToolProps<unknown, z.infer<typeof readArticleOutputSchema>>;

function ReadArticleDetail({ output }: ReadArticleProps) {
  const t = useTranslations("agui.detail");
  if (!output) return null;
  return (
    <>
      <ToolMeta
        items={[
          t("revision", { revision: output.revision }),
          t("wordCount", { count: output.wordCount }),
          output.hasMore && t("hasMore"),
        ]}
      />
      <ToolExcerpt>{output.content}</ToolExcerpt>
    </>
  );
}

export const readArticle = defineTool({
  icon: BookOpenTextIcon,
  output: readArticleOutputSchema,
  summary: (t, { output }) =>
    output
      ? `${output.title} · ${t("detail.readRange", {
          start: output.startOffset,
          end: output.endOffset,
          total: output.totalLength,
        })}`
      : undefined,
  Detail: ReadArticleDetail,
});

type SearchArticleProps = ToolProps<
  z.infer<typeof searchArticleInputSchema>,
  z.infer<typeof searchArticleOutputSchema>
>;

function SearchArticleDetail({ output }: SearchArticleProps) {
  const t = useTranslations("agui.detail");
  if (!output) return null;
  if (!output.matches.length) return <ToolMeta items={[t("noMatch")]} />;
  return (
    <>
      <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
        {output.matches.map((match) => (
          <li key={match.start} className="text-sm leading-relaxed text-muted-foreground">
            {match.before.length > contextLength ? "…" : null}
            {match.before.slice(-contextLength)}
            <mark className="bg-transparent font-medium text-foreground">{match.match}</mark>
            {match.after.slice(0, contextLength)}
            {match.after.length > contextLength ? "…" : null}
          </li>
        ))}
      </ul>
      {output.truncated ? (
        <ToolMeta items={[t("truncated", { count: output.matches.length })]} />
      ) : null}
    </>
  );
}

export const searchArticle = defineTool({
  icon: TextSearchIcon,
  input: searchArticleInputSchema,
  output: searchArticleOutputSchema,
  summary: (t, { input, output }) => {
    if (!input) return undefined;
    if (!output) return quote(input.query);
    return `${quote(input.query)} · ${t("detail.matchCount", { count: output.matches.length })}`;
  },
  Detail: SearchArticleDetail,
});
