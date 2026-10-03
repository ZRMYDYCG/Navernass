export type ActivationKind = "skill" | "novel" | "chapter";

export interface ActivationBlock {
  kind: ActivationKind;
  id: string;
  label: string;
}

export interface ActivationSuggestion extends ActivationBlock {
  description?: string;
}
