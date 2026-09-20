import type { StateCreator } from "zustand";

import type { AppStore } from "@/store/store.types";

import { updateDensity } from "./preference.actions";
import { preferenceInitialState } from "./preference.state";
import type { PreferenceSlice } from "./preference.types";

export const createPreferenceSlice: StateCreator<
  AppStore,
  [["zustand/immer", never]],
  [],
  PreferenceSlice
> = (set) => ({
  ...preferenceInitialState,
  setDensity: (density) => set((state) => updateDensity(state, density)),
});
