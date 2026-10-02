"use client";

import { useEffect, useReducer } from "react";

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useCharacters, useRelationships } from "@/servers/library.server";
import { useRelationshipGraphStore } from "@/stores";

import { GraphCanvas } from "./graph-canvas";
import { GraphInspector } from "./graph-inspector";
import { graphReducer, initialGraphState } from "./machine";

/** 人物关系图工作区：数据入口（DTO 同步进状态机）+ 画布 + 检查器抽屉。 */
export function RelationshipGraphWorkspace({ novelId }: { novelId?: string }) {
  const { data: profiles } = useCharacters(novelId);
  const { data: relationshipDtos } = useRelationships(novelId);
  const [graph, dispatch] = useReducer(graphReducer, initialGraphState);
  const selectedCharacterId = useRelationshipGraphStore((state) => state.selectedCharacterId);
  const selectedRelationshipId = useRelationshipGraphStore((state) => state.selectedRelationshipId);
  const inspectorOpen = useRelationshipGraphStore((state) => state.inspectorOpen);
  const closeInspector = useRelationshipGraphStore((state) => state.closeInspector);
  const drawerOpen = inspectorOpen && Boolean(selectedCharacterId || selectedRelationshipId);

  useEffect(() => {
    if (profiles) dispatch({ type: "CHARACTERS_SYNCED", profiles });
  }, [profiles]);

  useEffect(() => {
    if (relationshipDtos) {
      dispatch({ type: "RELATIONSHIPS_SYNCED", relationships: relationshipDtos });
    }
  }, [relationshipDtos]);

  return (
    <section className="flex h-full min-h-0 flex-col bg-background">
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="relative h-full min-h-0 overflow-hidden">
          <GraphCanvas
            novelId={novelId}
            characters={graph.characters}
            relationships={graph.relationships}
          />
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
            <GraphInspector
              novelId={novelId}
              characters={graph.characters}
              relationships={graph.relationships}
            />
          </DrawerContent>
        </Drawer>
      </div>
    </section>
  );
}
