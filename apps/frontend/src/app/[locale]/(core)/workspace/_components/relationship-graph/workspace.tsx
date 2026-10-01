"use client";

import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useCharacters, useCreateCharacter } from "@/servers/library.server";
import { useRelationshipGraphStore } from "@/stores";

import { characterCreatePayload } from "./model";
import { GraphCanvas } from "./graph-canvas";
import { GraphInspector } from "./graph-inspector";

/** 人物关系图工作区：顶栏操作 + 画布 + 检查器抽屉。 */
export function RelationshipGraphWorkspace({ novelId }: { novelId?: string }) {
  const t = useTranslations("relationshipGraph.workspace");
  const { data: characters } = useCharacters(novelId);
  const createCharacter = useCreateCharacter(novelId);
  const selectCharacter = useRelationshipGraphStore((state) => state.selectCharacter);
  const openInspector = useRelationshipGraphStore((state) => state.openInspector);
  const selectedCharacterId = useRelationshipGraphStore((state) => state.selectedCharacterId);
  const selectedRelationshipId = useRelationshipGraphStore((state) => state.selectedRelationshipId);
  const inspectorOpen = useRelationshipGraphStore((state) => state.inspectorOpen);
  const closeInspector = useRelationshipGraphStore((state) => state.closeInspector);
  const drawerOpen = inspectorOpen && Boolean(selectedCharacterId || selectedRelationshipId);

  const addCharacter = () => {
    if (!novelId) return;
    const count = characters.length + 1;
    createCharacter.mutate(
      characterCreatePayload(novelId, `新角色 ${count}`, {
        x: 140 + (count % 4) * 180,
        y: 120 + Math.floor(count / 4) * 150,
      }),
      {
        onSuccess: (character) => {
          selectCharacter(character.id);
          openInspector();
        },
      },
    );
  };

  return (
    <section className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border/80 px-3">
        <div className="ml-auto">
          <Button size="sm" disabled={!novelId || createCharacter.isPending} onClick={addCharacter}>
            <PlusIcon />
            {t("addCharacter")}
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="relative h-full min-h-0 overflow-hidden">
          <GraphCanvas novelId={novelId} />
        </div>
        <Drawer
          modal={false}
          open={drawerOpen}
          showSwipeHandle
          swipeDirection="down"
          onOpenChange={(open) => {
            if (!open) {
              closeInspector();
            }
          }}
        >
          <DrawerContent>
            <GraphInspector novelId={novelId} />
          </DrawerContent>
        </Drawer>
      </div>
    </section>
  );
}
