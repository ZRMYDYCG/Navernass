import { useCallback, useEffect, useRef, useState } from "react";

import { useUpdateChapterContent } from "@/lib/query/library.query";

const autosaveDelay = 1000;

export type SaveStatus = "saved" | "saving" | "error";

/** 停止输入后防抖保存；卸载（切换章节）时立即提交尚未保存的正文。 */
export function useChapterAutosave(chapterId: string) {
  const { mutate, isPending, isError } = useUpdateChapterContent(chapterId);
  const pendingTextRef = useRef<string | null>(null);
  const timerRef = useRef<number>(undefined);
  const [dirty, setDirty] = useState(false);

  const flush = useCallback(() => {
    window.clearTimeout(timerRef.current);
    const text = pendingTextRef.current;
    if (text === null) return;
    pendingTextRef.current = null;
    setDirty(false);
    mutate(text);
  }, [mutate]);

  const schedule = useCallback(
    (text: string) => {
      pendingTextRef.current = text;
      setDirty(true);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(flush, autosaveDelay);
    },
    [flush],
  );

  useEffect(() => flush, [flush]);

  const status: SaveStatus = dirty || isPending ? "saving" : isError ? "error" : "saved";
  return { schedule, status };
}
