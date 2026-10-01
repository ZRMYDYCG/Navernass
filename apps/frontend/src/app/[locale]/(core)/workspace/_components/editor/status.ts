import { useSyncExternalStore } from "react";

import type { WordCount } from "./types";

export type SaveState = "saved" | "saving" | "pending";

interface EditorStatusSnapshot {
  count: WordCount;
  saveState: SaveState;
}

type Listener = () => void;

export class EditorStatusStore {
  private snapshot: EditorStatusSnapshot = {
    count: { characters: 0, words: 0 },
    saveState: "saved",
  };

  private listeners = new Set<Listener>();

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.snapshot;

  setCount(count: WordCount) {
    if (
      this.snapshot.count.characters === count.characters &&
      this.snapshot.count.words === count.words
    ) {
      return;
    }

    this.snapshot = { ...this.snapshot, count };
    this.emit();
  }

  setSaveState(saveState: SaveState) {
    if (this.snapshot.saveState === saveState) return;

    this.snapshot = { ...this.snapshot, saveState };
    this.emit();
  }

  private emit() {
    for (const listener of this.listeners) listener();
  }
}

export function useEditorStatus(store: EditorStatusStore) {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
