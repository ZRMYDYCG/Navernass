import type { AppStore } from "./store.types"

// 组件只订阅需要的字段，避免无关状态变化触发渲染
export const selectCount = (state: AppStore) => state.count
export const selectCounterActions = (state: AppStore) => ({
  increment: state.increment,
  decrement: state.decrement,
  reset: state.reset,
})
export const selectDensity = (state: AppStore) => state.density
export const selectSetDensity = (state: AppStore) => state.setDensity
