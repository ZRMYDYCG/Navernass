export type SaveStatus = "saved" | "saving" | "error";

export interface EditorStatusSnapshot {
  wordCount: number;
  saveStatus: SaveStatus;
  savedAt: Date;
}

export type SaveStatusSnapshot = Pick<EditorStatusSnapshot, "saveStatus" | "savedAt">;

/**
 * 高频编辑状态独立于 React 组件树。正文输入只通知订阅状态栏的叶子组件，
 * 不会让 ChapterEditor 或 Lexical 编辑器重新渲染。
 */
export function createEditorStatusStore(
  initial: Pick<EditorStatusSnapshot, "wordCount" | "savedAt">,
) {
  let snapshot: EditorStatusSnapshot = { ...initial, saveStatus: "saved" };
  let saveStatusSnapshot: SaveStatusSnapshot = {
    saveStatus: snapshot.saveStatus,
    savedAt: snapshot.savedAt,
  };
  const listeners = new Set<() => void>();

  const update = (next: Partial<EditorStatusSnapshot>) => {
    const candidate = { ...snapshot, ...next };
    const wordCountChanged = candidate.wordCount !== snapshot.wordCount;
    const saveStatusChanged =
      candidate.saveStatus !== snapshot.saveStatus ||
      candidate.savedAt.getTime() !== snapshot.savedAt.getTime();
    if (!wordCountChanged && !saveStatusChanged) return;
    snapshot = candidate;
    if (saveStatusChanged) {
      saveStatusSnapshot = {
        saveStatus: candidate.saveStatus,
        savedAt: candidate.savedAt,
      };
    }
    for (const listener of listeners) listener();
  };

  return {
    getSnapshot: () => snapshot,
    getSaveStatusSnapshot: () => saveStatusSnapshot,
    getWordCountSnapshot: () => snapshot.wordCount,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    update,
  };
}

export type EditorStatusStore = ReturnType<typeof createEditorStatusStore>;
