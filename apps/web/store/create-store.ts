import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { StateCreator } from 'zustand'
import type { StoreMutators } from './store.types'

/** 单个 bounded store 的 StateCreator（devtools + immer） */
export type BoundStoreCreator<TStore> = StateCreator<TStore, StoreMutators, [], TStore>

/**
 * 创建带 devtools + immer 的独立 store。
 * 每个业务域一个 store；只有 store 内部结构复杂时才再拆 slice。
 */
export function createBoundStore<TStore>(
  devtoolsName: string,
  creator: BoundStoreCreator<TStore>,
) {
  return create<TStore>()(
    devtools(
      immer(creator),
      { name: devtoolsName },
    ),
  )
}
