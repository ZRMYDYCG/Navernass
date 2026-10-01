"use client";

import { BookPlusIcon, ContactRoundIcon, FileTextIcon, LibraryBigIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { z } from "zod";

import {
  chapterOutputSchema,
  characterOutputSchema,
  novelSnapshotOutputSchema,
  volumeOutputSchema,
} from "@/lib/http/modules/agent-tool.schema";

import { defineMaterial, ToolExcerpt, ToolMeta, type MaterialContext } from "../protocol";

type SnapshotProps = MaterialContext<unknown, z.infer<typeof novelSnapshotOutputSchema>>;

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

type ChapterProps = MaterialContext<unknown, z.infer<typeof chapterOutputSchema>>;

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

const getNovelSnapshot = defineMaterial({
  tool: "getNovelSnapshot",
  icon: LibraryBigIcon,
  output: novelSnapshotOutputSchema,
  summary: (t, { output }) =>
    output
      ? `${output.title} · ${t("detail.chapterCount", { count: output.chapters.length })}`
      : undefined,
  detail: SnapshotDetail,
});

const getChapter = defineMaterial({
  tool: "getChapter",
  icon: FileTextIcon,
  output: chapterOutputSchema,
  summary: (_, { output }) => output?.title,
  detail: ChapterDetail,
});

const createChapter = defineMaterial({
  tool: "createChapter",
  icon: BookPlusIcon,
  output: chapterOutputSchema,
  summary: (t, { output }) =>
    output ? `${output.title} · ${t("detail.createdChapter")}` : undefined,
  detail: ChapterDetail,
});

const createVolume = defineMaterial({
  tool: "createVolume",
  icon: BookPlusIcon,
  output: volumeOutputSchema,
  summary: (t, { output }) =>
    output ? `${output.title} · ${t("detail.createdVolume")}` : undefined,
});

const createCharacter = defineMaterial({
  tool: "createCharacter",
  icon: ContactRoundIcon,
  output: characterOutputSchema,
  summary: (t, { output }) =>
    output ? `${output.name} · ${t("detail.createdCharacter")}` : undefined,
});

const updateCharacter = defineMaterial({
  tool: "updateCharacter",
  icon: ContactRoundIcon,
  output: characterOutputSchema,
  summary: (t, { output }) =>
    output ? `${output.name} · ${t("detail.updatedCharacter")}` : undefined,
});

export default [
  getNovelSnapshot,
  getChapter,
  createChapter,
  createVolume,
  createCharacter,
  updateCharacter,
];
