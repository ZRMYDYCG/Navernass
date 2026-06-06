import type { StateCreator } from 'zustand'

import type { AiEditsSlice } from './slices/ai-edits'
import type { ChaptersSlice } from './slices/chapters'
import type { CharacterGraphSlice } from './slices/character-graph'
import type { CharacterMaterialSlice } from './slices/character-material'
import type { NovelChatSlice } from './slices/novel-chat'
import type { PlanSlice } from './slices/plan'
import type { TimelineSlice } from './slices/timeline'
import type { WorldviewSlice } from './slices/worldview'

/**
 * 组合后的主 store 类型。所有 slice 通过交叉类型合并到 AppStore 上。
 *
 * - state 字段使用业务域命名空间，例如 `state.chapters`、`state.characterGraph`
 * - actions 放在独立的命名空间下，例如 `state.chaptersActions`
 */
export type AppStore =
  & ChaptersSlice
  & CharacterGraphSlice
  & CharacterMaterialSlice
  & AiEditsSlice
  & PlanSlice
  & WorldviewSlice
  & TimelineSlice
  & NovelChatSlice

/**
 * 当前实际包裹的 middleware 顺序（外 → 内）：
 *   devtools(immer(...))
 *
 * mutator tuple 必须与包裹顺序一致，外层在前。
 * 必须是非 readonly 的元组类型以匹配 zustand 的约束。
 */
export type AppStoreMutators = [
  ['zustand/devtools', never],
  ['zustand/immer', never],
]

/**
 * 统一的 StateCreator helper，所有 slice 都用这个类型签名。
 * immer 让 set 内可以直接 mutate draft；devtools 提供带 action name 的 set 重载。
 */
export type StoreSlice<TSlice> = StateCreator<
  AppStore,
  AppStoreMutators,
  [],
  TSlice
>

/**
 * 从 StoreSlice 推导出的 set / get 类型，供 actions.ts 使用。
 *
 * StoreSet 支持：
 * 1. 传入 partial 对象做浅更新
 * 2. 传入函数并直接 mutate draft（immer 中间件）
 * 3. 第三参数为 devtools action name，格式 domain/actionName
 *
 * StoreGet 返回整个 AppStore，所以 action 内可以跨 slice 访问。
 */
export type StoreSet = (
  partial:
    | AppStore
    | Partial<AppStore>
    | ((state: AppStore) => void | AppStore | Partial<AppStore>),
  replace?: false,
  actionName?: string,
) => void

export type StoreGet = () => AppStore
