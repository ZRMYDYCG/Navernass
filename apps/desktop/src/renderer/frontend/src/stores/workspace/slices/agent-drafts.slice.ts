import type { WorkspaceSliceCreator } from "../types";

export interface AgentDraft {
  id: string;
  novelId: string;
  text: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
}

export interface AgentDraftState {
  agentDrafts: Record<string, AgentDraft>;
}

export interface AgentDraftActions {
  upsertAgentDraft: (draft: AgentDraft) => void;
  updateAgentDraftText: (id: string, text: string) => void;
  removeAgentDraft: (id: string) => void;
  setAgentDraftPinned: (id: string, pinned: boolean) => void;
}

export type AgentDraftSlice = AgentDraftState & AgentDraftActions;

export const createAgentDraftSlice: WorkspaceSliceCreator<AgentDraftSlice> = (set) => ({
  agentDrafts: {},

  upsertAgentDraft: (draft) =>
    set((state) => {
      state.agentDrafts[draft.id] = draft;
    }),

  updateAgentDraftText: (id, text) =>
    set((state) => {
      const draft = state.agentDrafts[id];
      if (!draft) return;
      draft.text = text;
      draft.updatedAt = Date.now();
    }),

  removeAgentDraft: (id) =>
    set((state) => {
      delete state.agentDrafts[id];
    }),

  setAgentDraftPinned: (id, pinned) =>
    set((state) => {
      const draft = state.agentDrafts[id];
      if (!draft) return;
      draft.pinned = pinned;
      draft.updatedAt = Date.now();
    }),
});
