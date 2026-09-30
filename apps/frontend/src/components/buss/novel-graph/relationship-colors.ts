import type { RelationshipKind } from "./types";

/** 关系类型在画布中的连线颜色，React Flow / G6 / 3D 视图共用。 */
export const relationshipColors: Record<RelationshipKind, string> = {
  ally: "#22c55e",
  family: "#f59e0b",
  romance: "#ec4899",
  rival: "#a78bfa",
  enemy: "#ef4444",
  mentor: "#38bdf8",
  secret: "#facc15",
  custom: "#94a3b8",
};
