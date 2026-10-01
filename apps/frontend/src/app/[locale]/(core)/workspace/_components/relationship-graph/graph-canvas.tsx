"use client";

import "@xyflow/react/dist/style.css";

import { useCallback, useEffect, useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  ReactFlow,
  type Connection,
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useTranslations } from "next-intl";

import { useCreateRelationship, useUpdateCharacter } from "@/servers/library.server";
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
      </ReactFlow>
      {characters.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          {t("editor.emptyCanvas")}
        </div>
      ) : null}
    </div>
  );
}
