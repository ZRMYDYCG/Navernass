import type { SelectionActions } from "./selection.slice";
import type { WorkspaceSliceCreator } from "../types";

/** 选择的全部操作，通过 immer 直接可变更新状态。 */
export const createSelectionActions: WorkspaceSliceCreator<SelectionActions> = (set) => ({
  selectNovel: (id) =>
    set((state) => {
      state.novelId = id;
      state.chapterId = undefined;
    }),

  selectChapter: (id) =>
    set((state) => {
      state.chapterId = id;
    }),

  selectSession: (novelId, sessionId) =>
    set((state) => {
      if (state.sessionIds[novelId] === sessionId) return;
      if (sessionId) {
        state.sessionIds[novelId] = sessionId;
      } else {
        delete state.sessionIds[novelId];
      }
    }),
});
