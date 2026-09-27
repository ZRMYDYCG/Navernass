"use client";

import { FileTextIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, useCallback, useState, type ReactNode } from "react";

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
import type { Chapter } from "@/schemas/library.schema";
import type { ChapterEdit } from "@/schemas/editor.schema";

import { createEditorStatusStore, type EditorStatusStore } from "./editor-status-store";
import { EditorHeader } from "./editor-header";
import { ManuscriptEditor } from "./manuscript-editor/manuscript-editor";
import { $setPlainText } from "./manuscript-editor/plain-text";
import { ProposalReview } from "./proposal-review/proposal-review";
import { useManuscriptAutosave } from "./use-manuscript-autosave";

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

interface EditableManuscriptProps {
  chapterId: string;
  initialContent: string;
  placeholder: string;
  editorStatus: EditorStatusStore;
}

/** 保存状态变化可以重渲染此控制层，但 memo 会隔离下方的 Lexical 编辑器。 */
const EditableManuscript = memo(
  function EditableManuscript({
    chapterId,
    initialContent,
    placeholder,
    editorStatus,
  }: EditableManuscriptProps) {
    const scheduleAutosave = useManuscriptAutosave(chapterId, editorStatus);
    const [initializeEditor] = useState(() => () => $setPlainText(initialContent));
    const handleTextChange = useCallback(
      (text: string) => {
        editorStatus.update({ wordCount: countWords(text), saveStatus: "saving" });
        scheduleAutosave(text);
      },
      [editorStatus, scheduleAutosave],
    );

    return (
      <ManuscriptEditor
        placeholder={placeholder}
        $initialContent={initializeEditor}
        onTextChange={handleTextChange}
      />
    );
  },
  (previous, next) =>
    previous.chapterId === next.chapterId &&
    previous.placeholder === next.placeholder &&
    previous.editorStatus === next.editorStatus,
);

function EditorLayout({
  novelId,
  chapter,
  editorStatus,
  children,
}: {
  novelId: string;
  chapter?: Chapter;
  editorStatus?: EditorStatusStore;
  children: ReactNode;
}) {
  const t = useTranslations("chapterEditor");
  return (
    <section aria-label={t("title")} className="flex h-full min-h-0 flex-col bg-paper">
      <EditorHeader novelId={novelId} chapter={chapter} editorStatus={editorStatus} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <article className="mx-auto w-full max-w-3xl px-12 pt-12 pb-32">{children}</article>
      </div>
    </section>
  );
}

function LoadedChapterEditor({
  novelId,
  chapter,
  pendingEdit,
}: {
  novelId: string;
  chapter: Chapter;
  pendingEdit?: ChapterEdit;
}) {
  const t = useTranslations("chapterEditor");
  const [editorStatus] = useState(() =>
    createEditorStatusStore({
      wordCount: chapter.word_count,
      savedAt: chapter.updated_at,
    }),
  );

  // 本地还有未落库的输入时，提案的原文已与编辑器不一致，交给对话面板里的卡片处理。
  const reviewEdit =
    pendingEdit?.base_revision === chapter.revision &&
    editorStatus.getSnapshot().saveStatus === "saved"
      ? pendingEdit
      : undefined;

  return (
    <EditorLayout novelId={novelId} chapter={chapter} editorStatus={editorStatus}>
      <h1 className="mb-8 font-serif text-3xl font-bold tracking-wide text-balance">
        {chapter.title}
      </h1>
      {reviewEdit ? (
        <ProposalReview key={reviewEdit.id} edit={reviewEdit} text={chapter.content} />
      ) : (
        <EditableManuscript
          chapterId={chapter.id}
          initialContent={chapter.content}
          placeholder={t("placeholder")}
          editorStatus={editorStatus}
        />
      )}
    </EditorLayout>
  );
}

/** 按章节挂载：切换章节时由父组件更换 `key`，自动保存与编辑器状态随之重置。 */
export function ChapterEditor({ novelId, chapterId }: ChapterEditorProps) {
  const t = useTranslations("chapterEditor");
  const { data: chapter, isError } = useChapter(chapterId);
  const { data: pendingEdit } = usePendingEdit(chapterId);

  if (chapter) {
    return <LoadedChapterEditor novelId={novelId} chapter={chapter} pendingEdit={pendingEdit} />;
  }

  return (
    <EditorLayout novelId={novelId}>
      {isError ? (
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
    </EditorLayout>
  );
}
