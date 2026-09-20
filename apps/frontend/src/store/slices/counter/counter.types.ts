export interface CounterState {
  count: number
}

export interface CounterActions {
  increment: () => void
  decrement: () => void
  reset: () => void
}

export type CounterSlice = CounterState & CounterActions
