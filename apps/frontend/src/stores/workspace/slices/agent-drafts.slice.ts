import type { WorkspaceSliceCreator } from "../types";

export interface AgentDraftActivation {
  kind: "skill" | "novel" | "chapter" | "character";
  id: string;
  label: string;
  avatar?: string;
}

export interface AgentDraft {
  id: string;
  novelId: string;
  text: string;
  activationBlocks?: AgentDraftActivation[];
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
}

export interface AgentDraftState {
  agentDrafts: Record<string, AgentDraft>;
}

export interface AgentDraftActions {
  upsertAgentDraft: (draft: AgentDraft) => void;
  updateAgentDraftContent: (id: string, text: string, blocks: AgentDraftActivation[]) => void;
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

  updateAgentDraftContent: (id, text, blocks) =>
    set((state) => {
      const draft = state.agentDrafts[id];
      if (!draft) return;
      draft.text = text;
      draft.activationBlocks = blocks;
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
    }),
});
