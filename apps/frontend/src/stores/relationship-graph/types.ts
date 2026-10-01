import type { StateCreator } from "zustand";

import type { SelectionSlice } from "./slices/selection.slice";

/**
 * relationship-graph store 的完整状态：按 slice 交叉组合。
 * 新增功能 slice 时在此登记（如 SelectionSlice & ViewSlice）。
 */
export type RelationshipGraphStore = SelectionSlice;

/** 与 index.ts 的 middleware 组合保持一致（仅 immer，无持久化）。 */
type RelationshipGraphMutators = [["zustand/immer", never]];

/** slice 创建器：面向完整 RelationshipGraphStore（可跨 slice 读取），产出 S 类型的 slice。 */
export type RelationshipGraphSliceCreator<S> = StateCreator<
  RelationshipGraphStore,
  RelationshipGraphMutators,
  [],
  S
>;
