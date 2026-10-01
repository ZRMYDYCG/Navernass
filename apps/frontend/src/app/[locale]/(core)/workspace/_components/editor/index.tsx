"use client";

/* oxlint-disable shadcn/no-raw-colors -- 临时占位色块 */

interface ChapterEditorProps {
  novelId: string;
  chapterId: string;
}

export function EmptyChapterEditor() {
  return <div className="h-full bg-pink-300" />;
}

export function ChapterEditor(_props: ChapterEditorProps) {
  return <div className="h-full bg-pink-300" />;
}
