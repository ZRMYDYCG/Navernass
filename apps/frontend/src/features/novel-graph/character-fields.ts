import type { Character } from "./types";

const fieldValue = (character: Character, labels: string[]) => {
  const normalizedLabels = labels.map((label) => label.toLowerCase());
  return (
    character.customFields.find((field) =>
      normalizedLabels.includes(field.label.trim().toLowerCase()),
    )?.value ?? ""
  );
};

export const characterDisplayRole = (character: Character) =>
  fieldValue(character, ["角色定位", "定位", "身份", "role"]) || "未设定";

export const characterDisplayFaction = (character: Character) =>
  fieldValue(character, ["阵营", "组织", "势力", "faction"]);

export const splitTags = (value: string) =>
  value
    .split(/[,，、]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

export const characterDisplayTags = (character: Character) =>
  splitTags(fieldValue(character, ["标签", "tag", "tags"]));

export const characterToneClass = (character: Character) => {
  const faction = characterDisplayFaction(character);
  if (faction.includes("夜幕")) return "bg-primary";
  if (faction.includes("北境")) return "bg-secondary";
  if (faction.includes("档案")) return "bg-accent";
  return "bg-muted-foreground";
};
