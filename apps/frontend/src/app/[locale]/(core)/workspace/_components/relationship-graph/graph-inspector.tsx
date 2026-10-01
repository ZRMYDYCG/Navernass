"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { useCharacters, useRelationships } from "@/servers/library.server";
import { useRelationshipGraphStore } from "@/stores";

import { CharacterForm } from "./character-form";
import { RelationshipForm } from "./relationship-form";
import { toCharacter, toRelationship } from "./model";

/** 检查器：按画布选中对象分发到角色表单或关系表单。 */
export function GraphInspector({ novelId }: { novelId?: string }) {
  const t = useTranslations("relationshipGraph");
  const { data: profiles } = useCharacters(novelId);
  const { data: relationshipDtos } = useRelationships(novelId);
  const selectedCharacterId = useRelationshipGraphStore((state) => state.selectedCharacterId);
  const selectedRelationshipId = useRelationshipGraphStore((state) => state.selectedRelationshipId);

  const characters = useMemo(() => profiles.map(toCharacter), [profiles]);
  const relationships = useMemo(() => relationshipDtos.map(toRelationship), [relationshipDtos]);
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
