import type { Draft } from "immer"

import type {
  InterfaceDensity,
  PreferenceSlice,
} from "./preference.types"

export function updateDensity(
  state: Draft<PreferenceSlice>,
  density: InterfaceDensity
) {
  state.density = density
}
