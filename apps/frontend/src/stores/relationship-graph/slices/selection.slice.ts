import { createSelectionActions } from "./selection.actions";
import type { RelationshipGraphSliceCreator } from "../types";

/** 画布的选中与检查器状态；角色与关系数据由 TanStack Query 从服务端获取。 */
export interface SelectionState {
  selectedCharacterId?: string;
  selectedRelationshipId?: string;
  inspectorOpen: boolean;
}

/** 选择的操作集合。 */
export interface SelectionActions {
  selectCharacter: (id?: string) => void;
  selectRelationship: (id?: string) => void;
  openInspector: () => void;
  closeInspector: () => void;
}

export type SelectionSlice = SelectionState & SelectionActions;

const initialSelectionState: SelectionState = {
  selectedCharacterId: undefined,
  selectedRelationshipId: undefined,
  inspectorOpen: false,
};

/** relationship-graph 的"选择"slice：初始状态 + 组装操作。 */
export const createSelectionSlice: RelationshipGraphSliceCreator<SelectionSlice> = (
  set,
  get,
  api,
) => ({
  ...initialSelectionState,
  ...createSelectionActions(set, get, api),
});
