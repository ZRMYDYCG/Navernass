"use client";

import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
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
  const { character, selected } = data;
  const meta = [characterDisplayRole(character), characterDisplayFaction(character)]
    .filter(Boolean)
    .join(" · ");
  const tags = characterDisplayTags(character).slice(0, 3);
  const handleClassName = cn(
    "!size-2 !border-2 !border-card !bg-muted-foreground transition-opacity",
    selected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
  );

  return (
    <div
      className={cn(
        "group w-56 rounded-md border bg-card px-3.5 py-3 text-card-foreground transition-shadow",
        selected
          ? "border-foreground/40 shadow-md"
          : "border-border shadow-xs hover:border-foreground/25 hover:shadow-sm",
      )}
    >
      <Handle type="target" position={Position.Left} className={handleClassName} />
      <Handle type="source" position={Position.Right} className={handleClassName} />
      <div className="truncate font-serif text-base leading-snug font-semibold">
        {character.name}
      </div>
      {meta ? <div className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</div> : null}
      {character.summary || tags.length > 0 ? (
        <div className="mt-2.5 border-t border-dashed border-border pt-2.5">
          {character.summary ? (
            <p className="line-clamp-3 text-xs leading-relaxed text-foreground/75">
              {character.summary}
            </p>
          ) : null}
          {tags.length > 0 ? (
            <div
              className={cn(
                "truncate text-xs text-muted-foreground",
                character.summary ? "mt-1.5" : null,
              )}
            >
              {tags.map((tag) => `#${tag}`).join("  ")}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});
