export type InterfaceDensity = "comfortable" | "compact";

export interface PreferenceState {
  density: InterfaceDensity;
}

export interface PreferenceActions {
  setDensity: (density: InterfaceDensity) => void;
}

export type PreferenceSlice = PreferenceState & PreferenceActions;
