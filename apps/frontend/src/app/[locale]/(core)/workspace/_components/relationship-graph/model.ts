import type { z } from "zod";

import type {
  characterFieldSchema,
  relationshipKindSchema,
  CharacterProfile,
  CharacterRelationship,
  CreateCharacterPayload,
  CreateRelationshipPayload,
  UpdateCharacterPayload,
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

/** 画布上的角色关系视图模型。 */
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

const defaultPosition: GraphPosition = { x: 160, y: 160 };

/** 服务端 DTO → 画布视图模型；映射结果会被同步进 React Flow 内部状态，必须保持引用稳定。 */
export function toCharacter(profile: CharacterProfile): Character {
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

export function toRelationship(relationship: CharacterRelationship): Relationship {
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

/** 视图模型部分更新 → 更新接口载荷。 */
export function characterPatchToPayload(
  patch: Partial<Omit<Character, "id">>,
): UpdateCharacterPayload {
  const payload: UpdateCharacterPayload = {};
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.summary !== undefined) payload.description = patch.summary;
  if (patch.customFields !== undefined) payload.custom_fields = patch.customFields;
  if (patch.position !== undefined) {
    payload.overview_x = patch.position.x;
    payload.overview_y = patch.position.y;
  }
  return payload;
}

/** 创建角色的接口载荷。 */
export function characterCreatePayload(
  novelId: string,
  name: string,
  position: GraphPosition,
  customFields: CharacterCustomField[] = [],
): CreateCharacterPayload {
  return {
    novel_id: novelId,
    name,
    overview_x: position.x,
    overview_y: position.y,
    custom_fields: customFields,
  };
}

/** 视图模型 → 更新关系载荷；label 为空时回退到默认文案。 */
export function relationshipToPayload(
  relationship: Omit<Relationship, "id">,
  defaultLabel: string,
) {
  const label = relationship.label.trim() || defaultLabel;
  return {
    sourceToTargetLabel: label,
    targetToSourceLabel: label,
    note: relationship.description,
    kind: relationship.kind,
    strength: relationship.strength,
    isSecret: relationship.isSecret,
  };
}

/** 创建关系的接口载荷。 */
export function relationshipCreatePayload(
  novelId: string,
  relationship: Omit<Relationship, "id">,
  defaultLabel: string,
): CreateRelationshipPayload {
  return {
    novel_id: novelId,
    sourceId: relationship.sourceId,
    targetId: relationship.targetId,
    ...relationshipToPayload(relationship, defaultLabel),
  };
}
