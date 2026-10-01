import type { z } from "zod";

import type {
  characterFieldSchema,
  relationshipKindSchema,
  CharacterProfile,
  CharacterRelationship,
} from "@/lib/http/modules/library.schema";

export type RelationshipKind = z.infer<typeof relationshipKindSchema>;

export type CharacterCustomField = z.infer<typeof characterFieldSchema>;

export type CharacterFieldType = CharacterCustomField["type"];

export interface GraphPosition {
  x: number;
  y: number;
}

/** 画布上的角色视图模型。 */
export interface Character {
  id: string;
  name: string;
  summary: string;
  customFields: CharacterCustomField[];
  position: GraphPosition;
}

/** 画布上的关系视图模型。 */
export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  kind: RelationshipKind;
  label: string;
  strength: number;
  isSecret: boolean;
  description: string;
}

/** 图状态：画布与检查器共享的唯一数据源。 */
export interface GraphState {
  characters: Character[];
  relationships: Relationship[];
}

export type GraphEvent =
  | { type: "CHARACTERS_SYNCED"; profiles: CharacterProfile[] }
  | { type: "RELATIONSHIPS_SYNCED"; relationships: CharacterRelationship[] };

export const initialGraphState: GraphState = {
  characters: [],
  relationships: [],
};

const defaultPosition: GraphPosition = { x: 160, y: 160 };

/** 服务端 DTO → 画布视图模型；映射结果会同步进 React Flow 内部状态，必须保持引用稳定。 */
function toCharacter(profile: CharacterProfile): Character {
  return {
    id: profile.id,
    name: profile.name,
    summary: profile.description,
    customFields: profile.custom_fields,
    position:
      profile.overview_x != null && profile.overview_y != null
        ? { x: profile.overview_x, y: profile.overview_y }
        : { ...defaultPosition },
  };
}

function toRelationship(relationship: CharacterRelationship): Relationship {
  return {
    id: relationship.id,
    sourceId: relationship.sourceId,
    targetId: relationship.targetId,
    kind: relationship.kind,
    label: relationship.sourceToTargetLabel,
    strength: relationship.strength,
    isSecret: relationship.isSecret,
    description: relationship.note,
  };
}

/** 图状态机：服务端数据同步是唯一的状态入口，组件只读状态、不自行映射 DTO。 */
export function graphReducer(state: GraphState, event: GraphEvent): GraphState {
  switch (event.type) {
    case "CHARACTERS_SYNCED":
      return { ...state, characters: event.profiles.map(toCharacter) };
    case "RELATIONSHIPS_SYNCED":
      return { ...state, relationships: event.relationships.map(toRelationship) };
  }
}
