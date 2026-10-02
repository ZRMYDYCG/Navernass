"use client";

import { useTranslations } from "next-intl";

import { useRelationshipGraphStore } from "@/stores";

import { CharacterForm } from "./character-form";
import { RelationshipForm } from "./relationship-form";
import type { Character, Relationship } from "./machine";

interface GraphInspectorProps {
  novelId?: string;
  characters: Character[];
  relationships: Relationship[];
}

/** 检查器：按画布选中对象分发到角色表单或关系表单。 */
export function GraphInspector({ novelId, characters, relationships }: GraphInspectorProps) {
  const t = useTranslations("relationshipGraph");
  const selectedCharacterId = useRelationshipGraphStore((state) => state.selectedCharacterId);
  const selectedRelationshipId = useRelationshipGraphStore((state) => state.selectedRelationshipId);

  const character = characters.find((item) => item.id === selectedCharacterId);
  const relationship = relationships.find((item) => item.id === selectedRelationshipId);

  if (relationship) {
    return (
      <RelationshipForm
        novelId={novelId}
        relationship={relationship}
        sourceName={characters.find((item) => item.id === relationship.sourceId)?.name}
        targetName={characters.find((item) => item.id === relationship.targetId)?.name}
      />
    );
  }

  if (character) {
    return <CharacterForm novelId={novelId} character={character} />;
  }

  return (
    <div className="flex min-h-0 flex-col p-4">
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        {t("inspector.empty")}
      </div>
    </div>
  );
}
