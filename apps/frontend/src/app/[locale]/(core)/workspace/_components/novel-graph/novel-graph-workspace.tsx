"use client";

import { useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { characterCreatePayload, useCharacters } from "./api";
import { useCreateCharacter } from "@/hooks/library/queries";
import { useNovelGraphStore } from "./graph-store";
import type { GraphViewMode } from "./types";
import { GraphInspector } from "./panels/graph-inspector";
import { GraphEditorView } from "./views/graph-editor-view";
import { G6ExploreView } from "./views/g6-explore-view";
import { World3DView } from "./views/world-3d-view";

export function NovelGraphWorkspace({ novelId }: { novelId?: string }) {
  const t = useTranslations("novelGraph.workspace");
  const [mode, setMode] = useState<GraphViewMode>("editor");
  const { data: characters } = useCharacters(novelId);
  const createCharacter = useCreateCharacter(novelId);
  const selectCharacter = useNovelGraphStore((state) => state.selectCharacter);
  const openInspector = useNovelGraphStore((state) => state.openInspector);
  const selectedCharacterId = useNovelGraphStore((state) => state.selectedCharacterId);
  const selectedRelationshipId = useNovelGraphStore((state) => state.selectedRelationshipId);
  const inspectorOpen = useNovelGraphStore((state) => state.inspectorOpen);
  const closeInspector = useNovelGraphStore((state) => state.closeInspector);
  const drawerOpen = inspectorOpen && Boolean(selectedCharacterId || selectedRelationshipId);

  const views: Array<{ id: GraphViewMode; label: string }> = [
    { id: "editor", label: t("viewEditor") },
    { id: "explore", label: t("viewExplore") },
    { id: "world3d", label: t("viewWorld3d") },
  ];

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

  const currentView = useMemo(() => {
    if (mode === "explore") return <G6ExploreView novelId={novelId} />;
    if (mode === "world3d") return <World3DView novelId={novelId} />;
    return <GraphEditorView novelId={novelId} />;
  }, [mode, novelId]);

  return (
    <section className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border/80 px-3">
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList variant="line">
            {views.map((view) => (
              <TabsTrigger key={view.id} value={view.id}>
                {view.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="ml-auto">
          <Button size="sm" disabled={!novelId || createCharacter.isPending} onClick={addCharacter}>
            <PlusIcon />
            {t("addCharacter")}
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="relative h-full min-h-0 overflow-hidden">{currentView}</div>
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
