"use client";

interface ChapterEditorProps {
  novelId: string;
  chapterId: string;
}

/** 编辑器占位：编辑器待重写，先用粉色色块占住中间编辑区。 */
export function EmptyChapterEditor() {
  return <div className="h-full bg-editor-placeholder" />;
}

export function ChapterEditor(_props: ChapterEditorProps) {
  return <div className="h-full bg-editor-placeholder" />;
}
