"use client";

import { FileTextIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { usePendingEdit } from "@/lib/query/editor.query";
import { useChapter } from "@/lib/query/library.query";
import { countWords } from "@/lib/word-count";

import { ChapterHeader } from "./chapter-header";
import { $setPlainText, ManuscriptEditor } from "./manuscript-editor";
import { ProposalReview } from "./proposal-review";
import { useChapterAutosave } from "./use-chapter-autosave";

interface ChapterEditorProps {
  novelId: string;
  chapterId: string;
}

export function EmptyChapterEditor() {
  const t = useTranslations("chapterEditor.empty");

  return (
    <div className="flex h-full bg-paper">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileTextIcon />
          </EmptyMedia>
          <EmptyTitle>{t("title")}</EmptyTitle>
          <EmptyDescription>{t("description")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}

/** 按章节挂载：切换章节时由父组件更换 `key`，自动保存与编辑器状态随之重置。 */
export function ChapterEditor({ novelId, chapterId }: ChapterEditorProps) {
  const t = useTranslations("chapterEditor");
  const { data: chapter, isError } = useChapter(chapterId);
  const { data: pendingEdit } = usePendingEdit(chapterId);
  const autosave = useChapterAutosave(chapterId);
  // 记录输入时所在的版本：保存或应用提案后版本前进，字数改以服务端为准。
  const [liveWordCount, setLiveWordCount] = useState<{ revision: number; count: number }>();

  // 本地还有未落库的输入时，提案的原文已与编辑器不一致，交给对话面板里的卡片处理。
  const reviewEdit =
    chapter && pendingEdit?.base_revision === chapter.revision && autosave.status === "saved"
      ? pendingEdit
      : undefined;

  const handleTextChange = (text: string) => {
    if (chapter) setLiveWordCount({ revision: chapter.revision, count: countWords(text) });
    autosave.schedule(text);
  };

  const wordCount =
    chapter && liveWordCount?.revision === chapter.revision
      ? liveWordCount.count
      : (chapter?.word_count ?? 0);

  return (
    <section aria-label={t("title")} className="flex h-full min-h-0 flex-col bg-paper">
      <ChapterHeader
        novelId={novelId}
        chapter={chapter}
        wordCount={wordCount}
        saveStatus={autosave.status}
      />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <article className="mx-auto w-full max-w-3xl px-12 pt-12 pb-32">
          {chapter ? (
            <>
              <h1 className="mb-8 font-serif text-3xl font-bold tracking-wide text-balance">
                {chapter.title}
              </h1>
              {reviewEdit ? (
                <ProposalReview key={reviewEdit.id} edit={reviewEdit} text={chapter.content} />
              ) : (
                <ManuscriptEditor
                  placeholder={t("placeholder")}
                  $initialContent={() => $setPlainText(chapter.content)}
                  onTextChange={handleTextChange}
                />
              )}
            </>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertTitle>{t("loadError")}</AlertTitle>
            </Alert>
          ) : (
            <div className="flex flex-col gap-4">
              <Skeleton className="mb-4 h-9 w-1/2" />
              <Skeleton className="h-5" />
              <Skeleton className="h-5 w-11/12" />
              <Skeleton className="h-5 w-4/5" />
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
