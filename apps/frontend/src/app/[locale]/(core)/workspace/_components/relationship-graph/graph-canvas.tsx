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

import {
  useCreateRelationship,
  useCharacters,
  useRelationships,
  useUpdateCharacter,
} from "@/servers/library.server";
import { useRelationshipGraphStore } from "@/stores";

import type { GraphPosition } from "./model";
import {
  characterPatchToPayload,
  relationshipCreatePayload,
  toCharacter,
  toRelationship,
} from "./model";
import { relationshipColors } from "./display";
import { CharacterNode, type CharacterNodeData } from "./character-node";

const nodeTypes = { character: CharacterNode };

/** 人物关系画布：React Flow 编辑器，节点拖动即保存位置，连线即创建关系。 */
export function GraphCanvas({ novelId }: { novelId?: string }) {
  const t = useTranslations("relationshipGraph");
  const { data: profiles } = useCharacters(novelId);
  const { data: relationshipDtos } = useRelationships(novelId);
  const updateCharacter = useUpdateCharacter(novelId);
  const createRelationship = useCreateRelationship(novelId);
  const selectedCharacterId = useRelationshipGraphStore((state) => state.selectedCharacterId);
  const selectedRelationshipId = useRelationshipGraphStore((state) => state.selectedRelationshipId);
  const selectCharacter = useRelationshipGraphStore((state) => state.selectCharacter);
  const selectRelationship = useRelationshipGraphStore((state) => state.selectRelationship);
  const openInspector = useRelationshipGraphStore((state) => state.openInspector);

  const characters = useMemo(() => profiles.map(toCharacter), [profiles]);
  const relationships = useMemo(() => relationshipDtos.map(toRelationship), [relationshipDtos]);

  const setCharacterPosition = useCallback(
    (id: string, position: GraphPosition) =>
      updateCharacter(id, characterPatchToPayload({ position })),
    [updateCharacter],
  );

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
        if (change.type === "position" && change.position && !change.dragging) {
          setCharacterPosition(change.id, change.position);
        }
      }
    },
    [onNodesChangeBase, setCharacterPosition],
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
        relationshipCreatePayload(
          novelId,
          {
            sourceId: connection.source,
            targetId: connection.target,
            kind: "ally",
            label: t("kinds.ally"),
            strength: 50,
            isSecret: false,
            description: "",
          },
          t("kinds.ally"),
        ),
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
