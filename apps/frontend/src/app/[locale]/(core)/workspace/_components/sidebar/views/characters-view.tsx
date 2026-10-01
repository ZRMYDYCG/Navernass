"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useCharacters } from "@/servers/library.server";
import { useRelationshipGraphStore } from "@/stores";

/** 「角色」视图：角色列表，点击选中并打开关系图的检查器。 */
export function CharactersView({ novelId }: { novelId: string }) {
  const t = useTranslations("relationshipGraph.library");
  const { data: characters, isPending } = useCharacters(novelId);
  const selectedCharacterId = useRelationshipGraphStore((state) => state.selectedCharacterId);
  const selectCharacter = useRelationshipGraphStore((state) => state.selectCharacter);
  const openInspector = useRelationshipGraphStore((state) => state.openInspector);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <ul className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {characters.map((character) => {
          const selected = character.id === selectedCharacterId;
          return (
            <li key={character.id}>
              <Button
                variant={selected ? "secondary" : "ghost"}
                size="sm"
                aria-current={selected ? "true" : undefined}
                className="w-full justify-start"
                onClick={() => {
                  selectCharacter(character.id);
                  openInspector();
                }}
              >
                <span className="truncate">{character.name}</span>
              </Button>
            </li>
          );
        })}
        {characters.length === 0 ? (
          <li className="px-3 py-6 text-center text-xs text-muted-foreground">
            {isPending ? t("loading") : t("empty")}
          </li>
        ) : null}
      </ul>
    </div>
  );
}
