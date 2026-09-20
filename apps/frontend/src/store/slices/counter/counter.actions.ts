import type { Draft } from "immer";

import { counterInitialState } from "./counter.state";
import type { CounterSlice } from "./counter.types";

// Action 只负责状态变更，便于复用和单独测试
export function incrementCounter(state: Draft<CounterSlice>) {
  state.count += 1;
}

export function decrementCounter(state: Draft<CounterSlice>) {
  state.count -= 1;
}

export function resetCounter(state: Draft<CounterSlice>) {
  state.count = counterInitialState.count;
}
