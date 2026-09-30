"use client";

import "@xyflow/react/dist/style.css";

import { memo, useCallback, useEffect, useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Handle,
  Position,
  ReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
  type OnEdgesChange,
  type OnNodesChange,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useTranslations } from "next-intl";
import { cn } from "cn";

import { useCreateRelationship, useUpdateCharacter } from "@/lib/query/library.query";

import {
  characterDisplayFaction,
  characterDisplayRole,
  characterDisplayTags,
} from "../character-fields";
import { relationshipColors } from "../relationship-colors";
import {
  characterPatchToPayload,
  relationshipCreatePayload,
  useCharacters,
  useRelationships,
} from "../api";
import { useNovelGraphStore } from "../graph-store";
import type { Character, GraphPosition } from "../types";

interface CharacterNodeData extends Record<string, unknown> {
  character: Character;
  selected?: boolean;
}

const CharacterNode = memo(function CharacterNode({ data }: NodeProps<Node<CharacterNodeData>>) {
  const t = useTranslations("novelGraph.editor");
  const { character, selected } = data;
  const role = characterDisplayRole(character) || t("unsetRole");
  const faction = characterDisplayFaction(character);
  const tags = characterDisplayTags(character);
  const initial = character.name.trim().slice(0, 1) || "?";

  return (
    <div
      className={cn(
        "group w-64 overflow-hidden rounded-lg border bg-card text-card-foreground shadow-xl transition-colors",
        selected
          ? "border-primary ring-2 ring-primary/30"
          : "border-border hover:border-primary/50",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!size-2.5 !border-background !bg-primary opacity-80 transition-opacity group-hover:opacity-100"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!size-2.5 !border-background !bg-primary opacity-80 transition-opacity group-hover:opacity-100"
      />
      <div className="min-w-0">
        <div className="flex items-start gap-3 border-b border-border/70 p-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-base font-semibold">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{character.name}</div>
            <div className="mt-1 truncate text-xs text-muted-foreground">{role}</div>
            {faction ? (
              <div className="mt-0.5 truncate text-xs text-muted-foreground">{faction}</div>
            ) : null}
          </div>
        </div>
        <div className="bg-muted/40 px-3 py-2">
          {character.summary ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {character.summary}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">{t("noSummary")}</p>
          )}
        </div>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1 px-3 py-2">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-border bg-background px-1.5 py-0.5 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
});

const nodeTypes = { character: CharacterNode };

export function GraphEditorView({ novelId }: { novelId?: string }) {
  const t = useTranslations("novelGraph");
  const { data: characters } = useCharacters(novelId);
  const { data: relationships } = useRelationships(novelId);
  const updateCharacter = useUpdateCharacter(novelId);
  const createRelationship = useCreateRelationship(novelId);
  const selectedCharacterId = useNovelGraphStore((state) => state.selectedCharacterId);
  const selectedRelationshipId = useNovelGraphStore((state) => state.selectedRelationshipId);
  const selectCharacter = useNovelGraphStore((state) => state.selectCharacter);
  const selectRelationship = useNovelGraphStore((state) => state.selectRelationship);
  const openInspector = useNovelGraphStore((state) => state.openInspector);

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
