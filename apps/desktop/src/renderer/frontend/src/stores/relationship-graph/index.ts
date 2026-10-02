import { create } from "zustand/react";
import { immer } from "zustand/middleware/immer";

import { createSelectionSlice } from "./slices/selection.slice";
import type { RelationshipGraphStore } from "./types";

/**
 * relationship-graph（人物关系图）的独立 store：画布选中与检查器状态，仅会话内有效，不持久化。
 * - middleware（immer）在组合处使用，slice 保持纯状态 + 操作；
 * - 新增功能 slice：./types.ts 交叉类型 → 此处展开 createXxxSlice。
 */
export const useRelationshipGraphStore = create<RelationshipGraphStore>()(
  immer((...a) => ({
    ...createSelectionSlice(...a),
  })),
);
