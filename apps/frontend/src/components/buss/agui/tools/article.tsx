"use client";

import {
  BookOpenTextIcon,
  BookPlusIcon,
  ContactRoundIcon,
  FilePenLineIcon,
  FileTextIcon,
  FilesIcon,
  LibraryBigIcon,
  TextSearchIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { z } from "zod";

import {
  chapterOutputSchema,
  articleWriteOutputSchema,
  listArticleFilesOutputSchema,
  novelSnapshotOutputSchema,
  readArticleOutputSchema,
  searchArticleInputSchema,
  searchArticleOutputSchema,
  volumeOutputSchema,
  characterOutputSchema,
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

export const createChapter = defineTool({
  icon: BookPlusIcon,
  output: chapterOutputSchema,
  summary: (t, { output }) =>
    output ? `${output.title} · ${t("detail.createdChapter")}` : undefined,
  Detail: ChapterDetail,
});

export const createVolume = defineTool({
  icon: BookPlusIcon,
  output: volumeOutputSchema,
  summary: (t, { output }) =>
    output ? `${output.title} · ${t("detail.createdVolume")}` : undefined,
});

export const createCharacter = defineTool({
  icon: ContactRoundIcon,
  output: characterOutputSchema,
  summary: (t, { output }) =>
    output ? `${output.name} · ${t("detail.createdCharacter")}` : undefined,
});

export const updateCharacter = defineTool({
  icon: ContactRoundIcon,
  output: characterOutputSchema,
  summary: (t, { output }) =>
    output ? `${output.name} · ${t("detail.updatedCharacter")}` : undefined,
});

type ArticleFilesProps = ToolProps<unknown, z.infer<typeof listArticleFilesOutputSchema>>;

function ArticleFilesDetail({ output }: ArticleFilesProps) {
  const t = useTranslations("agui.detail");
  if (!output) return null;
  if (!output.files.length) return <ToolMeta items={[t("noFiles")]} />;
  return (
    <>
      <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
        {output.files.map((file) => (
          <li key={file.chapterId} className="flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-foreground">{file.path}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {t("revision", { revision: file.revision })}
            </span>
          </li>
        ))}
      </ul>
      {output.truncated ? (
        <ToolMeta items={[t("truncated", { count: output.files.length })]} />
      ) : null}
    </>
  );
}

export const listArticleFiles = defineTool({
  icon: FilesIcon,
  output: listArticleFilesOutputSchema,
  summary: (t, { output }) =>
    output ? t("detail.fileCount", { count: output.files.length }) : undefined,
  Detail: ArticleFilesDetail,
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

type ArticleWriteProps = ToolProps<unknown, z.infer<typeof articleWriteOutputSchema>>;

function ArticleWriteDetail({ output }: ArticleWriteProps) {
  const t = useTranslations("agui.detail");
  if (!output) return null;
  return (
    <ToolMeta
      items={[
        output.chapterTitle,
        t("revisionChange", { from: output.baseRevision, to: output.revision }),
        t("wordDelta", { count: output.wordDelta }),
      ]}
    />
  );
}

export const editArticle = defineTool({
  icon: FilePenLineIcon,
  output: articleWriteOutputSchema,
  summary: (t, { output }) =>
    output ? `${output.chapterTitle} · ${t("detail.written")}` : undefined,
  Detail: ArticleWriteDetail,
});

export const writeArticle = defineTool({
  icon: FilePenLineIcon,
  output: articleWriteOutputSchema,
  summary: (t, { output }) =>
    output ? `${output.chapterTitle} · ${t("detail.written")}` : undefined,
  Detail: ArticleWriteDetail,
});

export const patchArticle = defineTool({
  icon: FilePenLineIcon,
  output: articleWriteOutputSchema,
  summary: (t, { output }) =>
    output ? `${output.chapterTitle} · ${t("detail.written")}` : undefined,
  Detail: ArticleWriteDetail,
});

export const grepArticle = searchArticle;
