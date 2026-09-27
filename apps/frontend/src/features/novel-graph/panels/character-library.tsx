"use client";

import { Button } from "@/components/ui/button";

import { useCharacters } from "../api";
import { useNovelGraphStore } from "../graph-store";

export function CharacterLibrary({ novelId }: { novelId?: string }) {
  const { data: characters, isPending } = useCharacters(novelId);
  const selectedCharacterId = useNovelGraphStore((state) => state.selectedCharacterId);
  const selectCharacter = useNovelGraphStore((state) => state.selectCharacter);
  const openInspector = useNovelGraphStore((state) => state.openInspector);

  return (
    <aside className="flex h-full min-h-0 flex-col bg-background">
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
            {!novelId
              ? "选择小说后查看角色"
              : isPending
                ? "加载中…"
                : "还没有角色，可在关系图谱中添加"}
          </li>
        ) : null}
      </ul>
    </aside>
  );
}
