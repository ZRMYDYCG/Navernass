import type { StateCreator } from "zustand";

import type { LayoutSlice } from "./slices/layout.slice";
import type { SelectionSlice } from "./slices/selection.slice";
import type { AgentDraftSlice } from "./slices/agent-drafts.slice";
import type { ComposerCharactersSlice } from "./slices/composer-characters.slice";

/**
 * workspace store 的完整状态：按 slice 交叉组合。
 * 新增功能 slice 时在此登记。
 */
export type WorkspaceStore = SelectionSlice &
  LayoutSlice &
  AgentDraftSlice &
  ComposerCharactersSlice;

/**
 * 与 index.ts 的 middleware 组合保持一致：
 * immer 提供可变更新，persist 的 persisted 类型按官方建议放宽为 unknown。
 */
type WorkspaceMutators = [["zustand/immer", never], ["zustand/persist", unknown]];

/** slice 创建器：面向完整 WorkspaceStore（可跨 slice 读取），产出 S 类型的 slice。 */
export type WorkspaceSliceCreator<S> = StateCreator<WorkspaceStore, WorkspaceMutators, [], S>;
