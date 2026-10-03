import type { WorkspaceSliceCreator } from "../types";

export interface ComposerCharactersState {
  /** 输入框常用角色，按小说隔离并持久化。 */
  composerCharacterIds: Record<string, string[]>;
}

export interface ComposerCharactersActions {
  setComposerCharacterIds: (novelId: string, characterIds: string[]) => void;
}

export type ComposerCharactersSlice = ComposerCharactersState & ComposerCharactersActions;

export const createComposerCharactersSlice: WorkspaceSliceCreator<ComposerCharactersSlice> = (
  set,
) => ({
  composerCharacterIds: {},

  setComposerCharacterIds: (novelId, characterIds) =>
    set((state) => {
      state.composerCharacterIds[novelId] = [...new Set(characterIds)];
    }),
});
