"use client";

import { useEffect, useMemo, useRef } from "react";

import { characterDisplayFaction, characterDisplayRole } from "../character-fields";
import { useCharacters, useRelationships } from "../api";
import { relationshipKindLabel, useNovelGraphStore } from "../graph-store";

type G6Graph = {
  render: () => Promise<void> | void;
  fitView?: (options?: {
    direction?: "both" | "x" | "y";
    when?: "always" | "overflow";
  }) => Promise<void> | void;
  destroy: () => void;
  on?: (
    event: string,
    handler: (event: { itemId?: string; target?: { id?: string } }) => void,
  ) => void;
};

const relationColorByKind: Record<string, string> = {
  ally: "#22c55e",
  family: "#f59e0b",
  romance: "#ec4899",
  rival: "#a78bfa",
  enemy: "#ef4444",
  mentor: "#38bdf8",
  secret: "#facc15",
  custom: "#94a3b8",
};

export function G6ExploreView({ novelId }: { novelId?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: characters } = useCharacters(novelId);
  const { data: relationships } = useRelationships(novelId);
  const selectCharacter = useNovelGraphStore((state) => state.selectCharacter);
  const selectRelationship = useNovelGraphStore((state) => state.selectRelationship);
  const openInspector = useNovelGraphStore((state) => state.openInspector);

  const graphData = useMemo(() => {
    const degreeMap = new Map<string, number>();
    relationships.forEach((relationship) => {
      degreeMap.set(relationship.sourceId, (degreeMap.get(relationship.sourceId) ?? 0) + 1);
      degreeMap.set(relationship.targetId, (degreeMap.get(relationship.targetId) ?? 0) + 1);
    });

    return {
      nodes: characters.map((character, index) => {
        const faction = characterDisplayFaction(character);
        const degree = degreeMap.get(character.id) ?? 0;
        const ring = 190 + (index % 4) * 78;
        const angle = (index / Math.max(characters.length, 1)) * Math.PI * 2;
        return {
          id: character.id,
          style: {
            x: degree > 0 ? character.position.x : Math.cos(angle) * ring + 420,
            y: degree > 0 ? character.position.y : Math.sin(angle) * ring + 260,
          },
          data: {
            label: character.name,
            role: characterDisplayRole(character),
            faction,
            degree,
            color: faction.includes("夜幕")
              ? "#67e8f9"
              : faction.includes("北境")
                ? "#a78bfa"
                : "#fbbf24",
          },
        };
      }),
      edges: relationships.map((relationship) => ({
        id: relationship.id,
        source: relationship.sourceId,
        target: relationship.targetId,
        data: {
          label: relationship.label || relationshipKindLabel[relationship.kind],
          kind: relationship.kind,
          color: relationColorByKind[relationship.kind],
          strength: relationship.strength,
          secret: relationship.isSecret,
        },
      })),
    };
  }, [characters, relationships]);

  useEffect(() => {
    let graph: G6Graph | undefined;
    let disposed = false;

    async function mount() {
      const container = containerRef.current;
      if (!container) return;
      const { Graph } = await import("@antv/g6");
      if (disposed) return;

      graph = new Graph({
        container,
        autoFit: {
          type: "view",
          options: { direction: "both", when: "always" },
        },
        padding: [96, 96, 96, 96],
        zoomRange: [0.35, 1.65],
        data: graphData,
        layout: {
          type: "force",
          preventOverlap: true,
          nodeSize: 88,
          linkDistance: 190,
          nodeStrength: -300,
          edgeStrength: 0.72,
        },
        node: {
          type: "circle",
          style: {
            size: (datum: { data?: { degree?: number } }) =>
              40 + Math.min(datum.data?.degree ?? 0, 6) * 6,
            fill: (datum: { data?: { color?: string } }) => datum.data?.color ?? "#67e8f9",
            fillOpacity: 0.9,
            stroke: "rgba(255,255,255,0.46)",
            lineWidth: 1.4,
            shadowColor: (datum: { data?: { color?: string } }) => datum.data?.color ?? "#67e8f9",
            shadowBlur: 26,
            halo: true,
            haloStroke: (datum: { data?: { color?: string } }) => datum.data?.color ?? "#67e8f9",
            haloStrokeOpacity: 0.34,
            haloLineWidth: 12,
            icon: true,
            iconText: (datum: { data?: { label?: string } }) =>
              datum.data?.label?.slice(0, 1) ?? "角",
            iconFill: "#0b0712",
            iconFontSize: 14,
            iconFontWeight: 800,
            labelText: (datum: { data?: { label?: string } }) => datum.data?.label ?? "",
            labelFill: "rgba(255,255,255,0.9)",
            labelFontSize: 12,
            labelFontWeight: 650,
            labelPlacement: "bottom",
            labelOffsetY: 8,
            badge: true,
            badges: (datum: { data?: { degree?: number; role?: string } }) => {
              const degree = datum.data?.degree ?? 0;
              if (degree <= 0) return [];
              return [
                {
                  text: String(degree),
                  placement: "right-top",
                  fill: "rgba(12,8,22,0.92)",
                  stroke: "rgba(255,255,255,0.26)",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: [2, 6],
                },
              ];
            },
          },
        },
        edge: {
          style: {
            stroke: (datum: { data?: { color?: string } }) => datum.data?.color ?? "#94a3b8",
            strokeOpacity: (datum: { data?: { secret?: boolean } }) =>
              datum.data?.secret ? 0.78 : 0.58,
            lineWidth: (datum: { data?: { strength?: number } }) =>
              1.4 + (datum.data?.strength ?? 50) / 34,
            labelText: (datum: { data?: { label?: string } }) => datum.data?.label ?? "",
            labelFill: "rgba(255,255,255,0.82)",
            labelFontSize: 12,
            labelPadding: [4, 8],
            labelBackground: true,
            labelBackgroundFill: "rgba(12,8,22,0.86)",
            labelBackgroundStroke: "rgba(255,255,255,0.12)",
            labelBackgroundLineWidth: 1,
            endArrow: true,
            endArrowSize: 8,
          },
        },
        behaviors: ["drag-canvas", "zoom-canvas", "drag-element", "hover-activate", "click-select"],
      }) as G6Graph;

      graph.on?.("node:click", (event) => {
        selectCharacter(event.itemId ?? event.target?.id);
        openInspector();
      });
      graph.on?.("edge:click", (event) => {
        selectRelationship(event.itemId ?? event.target?.id);
        openInspector();
      });
      await graph.render();
      await graph.fitView?.({ direction: "both", when: "always" });
    }

    mount();

    return () => {
      disposed = true;
      graph?.destroy();
    };
  }, [graphData, openInspector, selectCharacter, selectRelationship]);

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-background">
      <div ref={containerRef} className="h-full w-full" />
      <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-3 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-xs text-muted-foreground shadow-lg backdrop-blur-xl">
        <span>关系密度</span>
        <span className="h-1.5 w-14 rounded-full bg-primary/70" />
        <span>数字代表连接数</span>
      </div>
    </div>
  );
}
