import { create } from "zustand/react";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { createSelectionSlice } from "./slices/selection.slice";
import type { WorkspaceStore } from "./types";

/**
 * workspace 的独立 store。
 * - middleware（immer / persist）只在这一处组合，slice 保持纯状态 + 操作；
 * - 新增功能 slice：./types.ts 交叉类型 → 此处展开 createXxxSlice → partialize 登记持久化字段；
 * - persist 用 skipHydration，由 Workspace 挂载后调用 rehydrate()，避免 SSR 水合不一致。
 */
export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    immer((...a) => ({
      ...createSelectionSlice(...a),
    })),
    {
      name: "narraverse:workspace",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        novelId: state.novelId,
        chapterId: state.chapterId,
        sessionIds: state.sessionIds,
      }),
      skipHydration: true,
    },
  ),
);
