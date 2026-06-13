/**
 * 各独立 store 共用的 middleware mutator 与 set/get 类型 helper。
 *
 * slice pattern 仅用于「单个 store 内部」的子域拆分；
 * 不同业务域应使用各自的 createBoundStore，而不是合并进一个 AppStore。
 */
export type StoreMutators = [
  ['zustand/devtools', never],
  ['zustand/immer', never],
]

export type StoreSet<TStore> = (
  partial:
    | TStore
    | Partial<TStore>
    | ((state: TStore) => void | TStore | Partial<TStore>),
  replace?: false,
  actionName?: string,
) => void

export type StoreGet<TStore> = () => TStore
