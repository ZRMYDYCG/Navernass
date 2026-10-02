import type { LayoutActions } from "./layout.slice";
import type { WorkspaceSliceCreator } from "../types";

/** 布局的全部操作，通过 immer 直接可变更新状态。 */
export const createLayoutActions: WorkspaceSliceCreator<LayoutActions> = (set) => ({
  savePanelLayout: (layout) =>
    set((state) => {
      state.panelLayout = { ...layout };
    }),

  setSidebarCollapsed: (collapsed) =>
    set((state) => {
      state.sidebarCollapsed = collapsed;
    }),

  setChatPanelCollapsed: (collapsed) =>
    set((state) => {
      state.chatPanelCollapsed = collapsed;
    }),
});
