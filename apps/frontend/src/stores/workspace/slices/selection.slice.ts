import { createSelectionActions } from "./selection.actions";
import type { WorkspaceSliceCreator } from "../types";

/** 持久化的选择状态：当前小说、章节与每部小说最近使用的会话。 */
export interface SelectionState {
  novelId?: string;
  chapterId?: string;
  /** 每部小说最近使用的会话，按 novelId 索引。 */
  sessionIds: Record<string, string>;
}

/** 选择的操作集合。 */
export interface SelectionActions {
  selectNovel: (id?: string) => void;
  selectChapter: (id: string) => void;
  selectSession: (novelId: string, sessionId?: string) => void;
}

export type SelectionSlice = SelectionState & SelectionActions;

const initialSelectionState: SelectionState = {
  novelId: undefined,
  chapterId: undefined,
  sessionIds: {},
};

/** 工作区的"选择"slice：初始状态 + 组装操作。 */
export const createSelectionSlice: WorkspaceSliceCreator<SelectionSlice> = (set, get, api) => ({
  ...initialSelectionState,
  ...createSelectionActions(set, get, api),
});
