import { useQuery } from "@tanstack/react-query";

import { getNovelCharacters, getNovelRelationships } from "@/lib/api/library.api";
import { libraryKeys } from "@/lib/query/library.query";
import type {
  CharacterProfile,
  CharacterRelationship,
  CreateCharacterPayload,
  CreateRelationshipPayload,
  UpdateCharacterPayload,
} from "@/schemas/library.schema";

import type { Character, CharacterCustomField, GraphPosition, Relationship } from "./types";

const defaultPosition: GraphPosition = { x: 160, y: 160 };
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

// 视图会把这些数组同步进 React Flow / G6 的内部状态，引用必须稳定，否则每次渲染都会触发同步形成死循环。
const noCharacters: Character[] = [];
const noRelationships: Relationship[] = [];
const selectCharacters = (profiles: CharacterProfile[]) => profiles.map(toCharacter);
const selectRelationships = (relationships: CharacterRelationship[]) =>
  relationships.map(toRelationship);

export function useCharacters(novelId: string | undefined) {
  const query = useQuery({
    queryKey: libraryKeys.characters(novelId ?? ""),
    queryFn: () => {
      if (!novelId) throw new Error("尚未选择小说");
      return getNovelCharacters(novelId);
    },
    enabled: Boolean(novelId),
    select: selectCharacters,
  });
  return { ...query, data: query.data ?? noCharacters };
}

export function useRelationships(novelId: string | undefined) {
  const query = useQuery({
    queryKey: libraryKeys.relationships(novelId ?? ""),
    queryFn: () => {
      if (!novelId) throw new Error("尚未选择小说");
      return getNovelRelationships(novelId);
    },
    enabled: Boolean(novelId),
    select: selectRelationships,
  });
  return { ...query, data: query.data ?? noRelationships };
}
