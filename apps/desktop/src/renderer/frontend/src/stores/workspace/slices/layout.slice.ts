import { createLayoutActions } from "./layout.actions";
import type { WorkspaceSliceCreator } from "../types";

/** 持久化的布局状态：面板组布局与可折叠面板的收起状态。 */
export interface LayoutState {
  /** 面板组布局：panel id → flexGrow，undefined 表示尚无本地缓存。 */
  panelLayout?: Record<string, number>;
  sidebarCollapsed: boolean;
  chatPanelCollapsed: boolean;
}

/** 布局的操作集合。 */
export interface LayoutActions {
  savePanelLayout: (layout: Record<string, number>) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setChatPanelCollapsed: (collapsed: boolean) => void;
}

export type LayoutSlice = LayoutState & LayoutActions;

const initialLayoutState: LayoutState = {
  panelLayout: undefined,
  sidebarCollapsed: false,
  chatPanelCollapsed: false,
};

/** 工作区的"布局"slice：初始状态 + 组装操作。 */
export const createLayoutSlice: WorkspaceSliceCreator<LayoutSlice> = (set, get, api) => ({
  ...initialLayoutState,
  ...createLayoutActions(set, get, api),
});
