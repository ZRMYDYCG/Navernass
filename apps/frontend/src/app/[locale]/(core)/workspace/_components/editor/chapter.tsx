"use client";

import { useChapter, useUpdateChapterContent } from "@/servers/library.server";

import { EditorComposer } from "./composer";
import type { ChapterEditorHandle, ChapterEditorProps, SerializedChapter } from "./types";

interface ConnectedChapterEditorProps extends Omit<
  ChapterEditorProps,
  "initialContent" | "onSave"
> {
  handleRef?: React.Ref<ChapterEditorHandle>;
}

export function ConnectedChapterEditor({
  chapterId,
  handleRef,
  ...props
}: ConnectedChapterEditorProps) {
  const chapter = useChapter(chapterId);
  const updateContent = useUpdateChapterContent(chapterId);

  if (chapter.isLoading) {
    return <EditorStateMessage text="正在加载章节..." />;
  }

  if (chapter.isError || !chapter.data) {
    return <EditorStateMessage text="章节加载失败" />;
  }

  async function save(content: SerializedChapter) {
    await updateContent.mutateAsync(content.text);
  }

  return (
    <EditorComposer
      {...props}
      chapterId={chapterId}
      initialContent={chapter.data.content}
      onSave={save}
      handleRef={handleRef}
    />
  );
}

function EditorStateMessage({ text }: { text: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-background text-sm text-muted-foreground">
      {text}
    </div>
  );
}
