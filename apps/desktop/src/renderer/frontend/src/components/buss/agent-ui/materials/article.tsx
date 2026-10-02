"use client";

import { BookOpenTextIcon, FilePenLineIcon, FilesIcon, TextSearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { z } from "zod";

import {
  articleWriteOutputSchema,
  listArticleFilesOutputSchema,
  readArticleOutputSchema,
  searchArticleInputSchema,
  searchArticleOutputSchema,
} from "@/lib/http/modules/agent-tool.schema";

import {
  defineMaterial,
  quote,
  ToolExcerpt,
  ToolMeta,
  type MaterialContext,
  type MaterialEntry,
} from "../protocol";

const contextLength = 60;

type ArticleFilesProps = MaterialContext<unknown, z.infer<typeof listArticleFilesOutputSchema>>;

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

const listArticleFiles = defineMaterial({
  tool: "listArticleFiles",
  icon: FilesIcon,
  output: listArticleFilesOutputSchema,
  summary: (t, { output }) =>
    output ? t("detail.fileCount", { count: output.files.length }) : undefined,
  detail: ArticleFilesDetail,
});

type ReadArticleProps = MaterialContext<unknown, z.infer<typeof readArticleOutputSchema>>;

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

const readArticle = defineMaterial({
  tool: "readArticle",
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
  detail: ReadArticleDetail,
});

type SearchArticleProps = MaterialContext<
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

const searchArticle = defineMaterial({
  tool: "searchArticle",
  icon: TextSearchIcon,
  input: searchArticleInputSchema,
  output: searchArticleOutputSchema,
  summary: (t, { input, output }) => {
    if (!input) return undefined;
    if (!output) return quote(input.query);
    return `${quote(input.query)} · ${t("detail.matchCount", { count: output.matches.length })}`;
  },
  detail: SearchArticleDetail,
});

/** 同协议换匹配键即得别名物料。 */
const grepArticle: MaterialEntry = { ...searchArticle, tool: "grepArticle" };

type ArticleWriteProps = MaterialContext<unknown, z.infer<typeof articleWriteOutputSchema>>;

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

const editArticle = defineMaterial({
  tool: "editArticle",
  icon: FilePenLineIcon,
  output: articleWriteOutputSchema,
  summary: (t, { output }) =>
    output ? `${output.chapterTitle} · ${t("detail.written")}` : undefined,
  detail: ArticleWriteDetail,
});

const writeArticle = defineMaterial({
  tool: "writeArticle",
  icon: FilePenLineIcon,
  output: articleWriteOutputSchema,
  summary: (t, { output }) =>
    output ? `${output.chapterTitle} · ${t("detail.written")}` : undefined,
  detail: ArticleWriteDetail,
});

const patchArticle = defineMaterial({
  tool: "patchArticle",
  icon: FilePenLineIcon,
  output: articleWriteOutputSchema,
  summary: (t, { output }) =>
    output ? `${output.chapterTitle} · ${t("detail.written")}` : undefined,
  detail: ArticleWriteDetail,
});

export default [
  listArticleFiles,
  readArticle,
  searchArticle,
  grepArticle,
  editArticle,
  writeArticle,
  patchArticle,
];
