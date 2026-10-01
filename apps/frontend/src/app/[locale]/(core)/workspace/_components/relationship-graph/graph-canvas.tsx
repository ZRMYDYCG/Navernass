"use client";

import "@xyflow/react/dist/style.css";

import { useCallback, useEffect, useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Panel,
  ReactFlow,
  type Connection,
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useStoreApi,
  useViewport,
} from "@xyflow/react";
import { LayoutGridIcon, MinusIcon, PlusIcon, ScanIcon, UserPlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  useCreateCharacter,
  useCreateRelationship,
  useUpdateCharacter,
} from "@/servers/library.server";
import { useRelationshipGraphStore } from "@/stores";

import { CharacterNode, type CharacterNodeData } from "./character-node";
import type { Character, Relationship, RelationshipKind } from "./machine";

const nodeTypes = { character: CharacterNode };

/** 关系类型在画布中的连线颜色。 */
const relationshipColors: Record<RelationshipKind, string> = {
  ally: "#22c55e",
  family: "#f59e0b",
  romance: "#ec4899",
  rival: "#a78bfa",
  enemy: "#ef4444",
  mentor: "#38bdf8",
  secret: "#facc15",
  custom: "#94a3b8",
};

interface GraphCanvasProps {
  novelId?: string;
  characters: Character[];
  relationships: Relationship[];
}

/** 人物关系画布：React Flow 编辑器，节点拖动即保存位置，连线即创建关系。 */
export function GraphCanvas({ novelId, characters, relationships }: GraphCanvasProps) {
  const t = useTranslations("relationshipGraph");
  const updateCharacter = useUpdateCharacter(novelId);
  const createRelationship = useCreateRelationship(novelId);
  const selectedCharacterId = useRelationshipGraphStore((state) => state.selectedCharacterId);
  const selectedRelationshipId = useRelationshipGraphStore((state) => state.selectedRelationshipId);
  const selectCharacter = useRelationshipGraphStore((state) => state.selectCharacter);
  const selectRelationship = useRelationshipGraphStore((state) => state.selectRelationship);
  const openInspector = useRelationshipGraphStore((state) => state.openInspector);

  const graphNodes = useMemo<Node<CharacterNodeData>[]>(
    () =>
      characters.map((character) => {
        return {
          id: character.id,
          type: "character",
          position: character.position,
          data: {
            character,
            selected: selectedCharacterId === character.id,
          },
        };
      }),
    [characters, selectedCharacterId],
  );

  const graphEdges = useMemo<Edge[]>(
    () =>
      relationships.map((relationship) => ({
        id: relationship.id,
        source: relationship.sourceId,
        target: relationship.targetId,
        label: relationship.label || t(`kinds.${relationship.kind}`),
        animated: relationship.isSecret,
        selected: selectedRelationshipId === relationship.id,
        style: {
          stroke: relationshipColors[relationship.kind],
          strokeWidth: 1.5 + relationship.strength / 45,
          strokeDasharray: relationship.isSecret ? "6 4" : undefined,
        },
        labelStyle: { fill: "currentColor", fontSize: 12 },
        labelBgStyle: { fill: "var(--background)", fillOpacity: 0.85 },
      })),
    [relationships, selectedRelationshipId, t],
  );

  const [nodes, setNodes, onNodesChangeBase] = useNodesState<Node<CharacterNodeData>>(graphNodes);
  const [edges, setEdges, onEdgesChangeBase] = useEdgesState(graphEdges);

  useEffect(() => setNodes(graphNodes), [graphNodes, setNodes]);
  useEffect(() => setEdges(graphEdges), [graphEdges, setEdges]);

  const onNodesChange: OnNodesChange<Node<CharacterNodeData>> = useCallback(
    (changes) => {
      onNodesChangeBase(changes);
      for (const change of changes) {
        // 拖拽落定才持久化位置。
        if (change.type === "position" && change.position && !change.dragging) {
          updateCharacter(change.id, {
            overview_x: change.position.x,
            overview_y: change.position.y,
          });
        }
      }
    },
    [onNodesChangeBase, updateCharacter],
  );

  const onEdgesChange: OnEdgesChange<Edge> = useCallback(
    (changes) => {
      onEdgesChangeBase(changes);
    },
    [onEdgesChangeBase],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (
        !novelId ||
        !connection.source ||
        !connection.target ||
        connection.source === connection.target
      )
        return;
      createRelationship.mutate(
        {
          novel_id: novelId,
          sourceId: connection.source,
          targetId: connection.target,
          sourceToTargetLabel: t("kinds.ally"),
          targetToSourceLabel: t("kinds.ally"),
          note: "",
          kind: "ally",
          strength: 50,
          isSecret: false,
        },
        {
          onSuccess: (relationship) => {
            selectRelationship(relationship.id);
            openInspector();
          },
        },
      );
    },
    [createRelationship, novelId, openInspector, selectRelationship, t],
  );

  return (
    <div className="relative h-full min-h-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        minZoom={0.25}
        maxZoom={1.6}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => {
          selectCharacter(node.id);
          openInspector();
        }}
        onEdgeClick={(_, edge) => {
          selectRelationship(edge.id);
          openInspector();
        }}
        onPaneClick={() => {
          selectCharacter(undefined);
          selectRelationship(undefined);
        }}
        className="bg-transparent"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1}
          color="color-mix(in_oklch,var(--foreground),transparent 80%)"
        />
        <Panel position="bottom-center">
          <Toolbar novelId={novelId} characters={characters} />
        </Panel>
      </ReactFlow>
      {characters.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          {t("editor.emptyCanvas")}
        </div>
      ) : null}
    </div>
  );
}

/** 角色卡片的近似尺寸，用于把新角色放到视野中心、整理布局时留出间距。 */
const nodeSize = { width: 256, height: 110 };
const zoomDuration = 200;

/** 画布底部的操作栏：新建角色、缩放与视图、整理布局。 */
function Toolbar({ novelId, characters }: { novelId?: string; characters: Character[] }) {
  const t = useTranslations("relationshipGraph.toolbar");
  const createCharacter = useCreateCharacter(novelId);
  const updateCharacter = useUpdateCharacter(novelId);
  const selectCharacter = useRelationshipGraphStore((state) => state.selectCharacter);
  const openInspector = useRelationshipGraphStore((state) => state.openInspector);
  const { zoomIn, zoomOut, zoomTo, fitView } = useReactFlow();
  const { zoom } = useViewport();
  const store = useStoreApi();

  const addCharacter = () => {
    if (!novelId) return;
    const {
      width,
      height,
      transform: [x, y, scale],
    } = store.getState();
    // 连续新建时错开一点，避免卡片完全叠在一起。
    const offset = (characters.length % 5) * 24;
    createCharacter.mutate(
      {
        novel_id: novelId,
        name: t("newCharacterName", { count: characters.length + 1 }),
        overview_x: Math.round((width / 2 - x) / scale - nodeSize.width / 2 + offset),
        overview_y: Math.round((height / 2 - y) / scale - nodeSize.height / 2 + offset),
        custom_fields: [],
      },
      {
        onSuccess: (character) => {
          selectCharacter(character.id);
          openInspector();
        },
      },
    );
  };

  const arrange = () => {
    const columns = Math.ceil(Math.sqrt(characters.length));
    characters.forEach((character, index) => {
      updateCharacter(character.id, {
        overview_x: (index % columns) * (nodeSize.width + 64),
        overview_y: Math.floor(index / columns) * (nodeSize.height + 80),
      });
    });
    requestAnimationFrame(() => void fitView({ duration: 300 }));
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-background/95 p-1 shadow-sm">
      <Button
        type="button"
        size="sm"
        disabled={!novelId || createCharacter.isPending}
        onClick={addCharacter}
      >
        <UserPlusIcon />
        {t("addCharacter")}
      </Button>
      <div className="mx-1 h-5 w-px bg-border" />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title={t("zoomOut")}
        aria-label={t("zoomOut")}
        onClick={() => void zoomOut({ duration: zoomDuration })}
      >
        <MinusIcon />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        title={t("resetZoom")}
        aria-label={t("resetZoom")}
        onClick={() => void zoomTo(1, { duration: zoomDuration })}
      >
        <span className="w-9 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title={t("zoomIn")}
        aria-label={t("zoomIn")}
        onClick={() => void zoomIn({ duration: zoomDuration })}
      >
        <PlusIcon />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title={t("fitView")}
        aria-label={t("fitView")}
        onClick={() => void fitView({ duration: 300 })}
      >
        <ScanIcon />
      </Button>
      <div className="mx-1 h-5 w-px bg-border" />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title={t("arrange")}
        aria-label={t("arrange")}
        disabled={characters.length < 2}
        onClick={arrange}
      >
        <LayoutGridIcon />
      </Button>
    </div>
  );
}
