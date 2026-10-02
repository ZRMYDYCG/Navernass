import type { SelectionActions } from "./selection.slice";
import type { RelationshipGraphSliceCreator } from "../types";

/** 画布选择的全部操作，通过 immer 直接可变更新状态。 */
export const createSelectionActions: RelationshipGraphSliceCreator<SelectionActions> = (set) => ({
  selectCharacter: (id) =>
    set((state) => {
      state.selectedCharacterId = id;
      state.selectedRelationshipId = undefined;
      if (!id) state.inspectorOpen = false;
    }),

  selectRelationship: (id) =>
    set((state) => {
      state.selectedRelationshipId = id;
      state.selectedCharacterId = undefined;
      if (!id) state.inspectorOpen = false;
    }),

  openInspector: () =>
    set((state) => {
      state.inspectorOpen = true;
    }),

  closeInspector: () =>
    set((state) => {
      state.inspectorOpen = false;
    }),
});
