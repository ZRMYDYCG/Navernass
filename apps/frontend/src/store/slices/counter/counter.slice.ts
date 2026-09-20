import type { StateCreator } from "zustand"

import type { AppStore } from "@/store/store.types"

import {
  decrementCounter,
  incrementCounter,
  resetCounter,
} from "./counter.actions"
import { counterInitialState } from "./counter.state"
import type { CounterSlice } from "./counter.types"

export const createCounterSlice: StateCreator<
  AppStore,
  [["zustand/immer", never]],
  [],
  CounterSlice
> = (set) => ({
  ...counterInitialState,
  increment: () => set(incrementCounter),
  decrement: () => set(decrementCounter),
  reset: () => set(resetCounter),
})
