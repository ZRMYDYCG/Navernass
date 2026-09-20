import type { CounterSlice } from "./slices/counter/counter.types";
import type { PreferenceSlice } from "./slices/preference/preference.types";

export type AppStore = CounterSlice & PreferenceSlice;
