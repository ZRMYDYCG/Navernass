import type { z } from "zod";

import type {
  characterFieldSchema,
  relationshipKindSchema,
} from "@/lib/http/modules/library.schema";

export type GraphViewMode = "editor" | "explore" | "world3d";

export type RelationshipKind = z.infer<typeof relationshipKindSchema>;

export interface GraphPosition {
  x: number;
  y: number;
}

export type CharacterCustomField = z.infer<typeof characterFieldSchema>;

export type CharacterFieldType = CharacterCustomField["type"];

export interface Character {
  id: string;
  name: string;
  summary: string;
  customFields: CharacterCustomField[];
  position: GraphPosition;
}

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  kind: RelationshipKind;
  label: string;
  strength: number;
  isSecret: boolean;
  description: string;
}
