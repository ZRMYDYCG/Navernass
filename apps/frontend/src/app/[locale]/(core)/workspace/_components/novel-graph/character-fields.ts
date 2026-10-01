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
  fieldValue(character, ["角色定位", "定位", "身份", "role"]);

export const characterDisplayFaction = (character: Character) =>
  fieldValue(character, ["阵营", "组织", "势力", "faction"]);

export const splitTags = (value: string) =>
  value
    .split(/[,，、]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

export const characterDisplayTags = (character: Character) =>
  splitTags(fieldValue(character, ["标签", "tag", "tags"]));

/** 画布渲染无法使用 CSS 变量，阵营配色在这里统一维护。 */
export const characterFactionColor = (character: Character) => {
  const faction = characterDisplayFaction(character);
  if (faction.includes("夜幕")) return "#67e8f9";
  if (faction.includes("北境")) return "#a78bfa";
  return "#fbbf24";
};
