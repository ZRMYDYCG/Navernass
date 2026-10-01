"use client";

import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { useTranslations } from "next-intl";
import { cn } from "cn";

import type { Character } from "./machine";

export interface CharacterNodeData extends Record<string, unknown> {
  character: Character;
  selected?: boolean;
}

const fieldValue = (character: Character, labels: string[]) => {
  const normalizedLabels = labels.map((label) => label.toLowerCase());
  return (
    character.customFields.find((field) =>
      normalizedLabels.includes(field.label.trim().toLowerCase()),
    )?.value ?? ""
  );
};

const characterDisplayRole = (character: Character) =>
  fieldValue(character, ["角色定位", "定位", "身份", "role"]);

const characterDisplayFaction = (character: Character) =>
  fieldValue(character, ["阵营", "组织", "势力", "faction"]);

const splitTags = (value: string) =>
  value
    .split(/[,，、]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

const characterDisplayTags = (character: Character) =>
  splitTags(fieldValue(character, ["标签", "tag", "tags"]));

/** 关系画布上的角色节点卡片。 */
export const CharacterNode = memo(function CharacterNode({
  data,
}: NodeProps<Node<CharacterNodeData>>) {
  const t = useTranslations("relationshipGraph.editor");
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
