"use client";

import type { ChapterEditorProps } from "./types";
import { ConnectedChapterEditor } from "./chapter";

export function EmptyChapterEditor() {
  return (
    <div className="flex h-full items-center justify-center bg-background text-sm text-muted-foreground">
      选择一个章节开始写作
    </div>
  );
}

export function ChapterEditor({ ref, ...props }: ChapterEditorProps) {
  return <ConnectedChapterEditor {...props} handleRef={ref} />;
}

export type { ChapterEditorHandle, EditorDiffProposal, SerializedChapter } from "./types";
