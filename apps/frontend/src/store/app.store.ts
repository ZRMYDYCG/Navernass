import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { create } from "zustand/react";

import { createCounterSlice } from "./slices/counter/counter.slice";
import { createPreferenceSlice } from "./slices/preference/preference.slice";
import type { AppStore } from "./store.types";

export const useAppStore = create<AppStore>()(
  devtools(
    immer((...store) => ({
      ...createCounterSlice(...store),
      ...createPreferenceSlice(...store),
    })),
    { name: "next-start-store" },
  ),
);
