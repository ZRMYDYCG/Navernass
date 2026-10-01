import { useCallback, useEffect, useRef } from "react";

import { useUpdateChapterContent } from "@/servers/library.server";

import type { EditorStatusStore } from "./editor-status-store";

const autosaveDelay = 1000;

/** 停止输入后防抖保存；卸载（切换章节）时立即提交尚未保存的正文。 */
export function useManuscriptAutosave(chapterId: string, editorStatus: EditorStatusStore) {
  const { mutate } = useUpdateChapterContent(chapterId);
  const pendingTextRef = useRef<string | null>(null);
  const timerRef = useRef<number>(undefined);

  const flush = useCallback(() => {
    window.clearTimeout(timerRef.current);
    const text = pendingTextRef.current;
    if (text === null) return;
    pendingTextRef.current = null;
    mutate(text, {
      onSuccess: (chapter) => {
        editorStatus.update({ saveStatus: "saved", savedAt: chapter.updated_at });
      },
      onError: () => editorStatus.update({ saveStatus: "error" }),
    });
  }, [editorStatus, mutate]);

  const schedule = useCallback(
    (text: string) => {
      pendingTextRef.current = text;
      editorStatus.update({ saveStatus: "saving" });
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(flush, autosaveDelay);
    },
    [editorStatus, flush],
  );

  useEffect(() => flush, [flush]);

  return schedule;
}
