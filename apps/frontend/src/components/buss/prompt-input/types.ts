export type ActivationKind = "skill" | "novel" | "chapter" | "character";

export interface ActivationBlock {
  kind: ActivationKind;
  id: string;
  label: string;
  avatar?: string;
}

export interface ActivationSuggestion extends ActivationBlock {
  description?: string;
}
