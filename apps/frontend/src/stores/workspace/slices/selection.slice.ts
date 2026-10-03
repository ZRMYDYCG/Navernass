import { createSelectionActions } from "./selection.actions";
import type { WorkspaceSliceCreator } from "../types";

/** 工作区主内容区当前展示的视图。 */
export type WorkspaceView = "editor" | "graph" | "settings" | "skill";

/** 选择状态：当前小说、章节、每部小说最近使用的会话与主内容区视图。 */
export interface SelectionState {
  novelId?: string;
  chapterId?: string;
  /** 每部小说最近使用的会话，按 novelId 索引。 */
  sessionIds: Record<string, string>;
  activeView: WorkspaceView;
}

/** 选择的操作集合。 */
export interface SelectionActions {
  selectNovel: (id?: string) => void;
  selectChapter: (id?: string) => void;
  selectSession: (novelId: string, sessionId?: string) => void;
  setActiveView: (view: WorkspaceView) => void;
  /** 选中章节并切回编辑器视图；目录、搜索与会话工具的章节跳转共用。 */
  openChapter: (id?: string) => void;
}

export type SelectionSlice = SelectionState & SelectionActions;

const initialSelectionState: SelectionState = {
  novelId: undefined,
  chapterId: undefined,
  sessionIds: {},
  activeView: "editor",
};

/** 工作区的"选择"slice：初始状态 + 组装操作。 */
export const createSelectionSlice: WorkspaceSliceCreator<SelectionSlice> = (set, get, api) => ({
  ...initialSelectionState,
  ...createSelectionActions(set, get, api),
});
