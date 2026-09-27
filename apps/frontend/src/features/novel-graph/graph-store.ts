"use client";

import { create } from "zustand/react";

import type { RelationshipKind } from "./types";

export const relationshipKindLabel: Record<RelationshipKind, string> = {
  ally: "盟友",
  family: "血缘",
  romance: "情感",
  rival: "竞争",
  enemy: "敌对",
  mentor: "师徒",
  secret: "秘密",
  custom: "自定义",
};

interface NovelGraphState {
  selectedCharacterId?: string;
  selectedRelationshipId?: string;
  inspectorOpen: boolean;
  selectCharacter: (id?: string) => void;
  selectRelationship: (id?: string) => void;
  openInspector: () => void;
  closeInspector: () => void;
}

/** 只保存画布的选中态；角色与关系数据由 TanStack Query 从服务端获取。 */
export const useNovelGraphStore = create<NovelGraphState>()((set) => ({
  selectedCharacterId: undefined,
  selectedRelationshipId: undefined,
  inspectorOpen: false,
  selectCharacter: (id) =>
    set((state) => ({
      selectedCharacterId: id,
      selectedRelationshipId: undefined,
      inspectorOpen: id ? state.inspectorOpen : false,
    })),
  selectRelationship: (id) =>
    set((state) => ({
      selectedRelationshipId: id,
      selectedCharacterId: undefined,
      inspectorOpen: id ? state.inspectorOpen : false,
    })),
  openInspector: () => set({ inspectorOpen: true }),
  closeInspector: () => set({ inspectorOpen: false }),
}));
