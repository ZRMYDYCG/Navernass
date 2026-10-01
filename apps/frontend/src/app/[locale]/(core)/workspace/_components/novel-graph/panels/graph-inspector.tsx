"use client";

import type { ReactNode } from "react";
import { Link2Icon, Trash2Icon, UserRoundIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { relationshipKindSchema } from "@/lib/http/modules/library.schema";

import {
  useDeleteCharacter,
  useDeleteRelationship,
  useUpdateCharacter,
  useUpdateRelationship,
} from "@/hooks/library/queries";

import {
  characterPatchToPayload,
  relationshipToPayload,
  useCharacters,
  useRelationships,
} from "../api";
import { useNovelGraphStore } from "../graph-store";
import type { Character, Relationship, RelationshipKind } from "../types";
import { CharacterFieldsEditor } from "./character-fields-editor";

const relationshipKinds = relationshipKindSchema.options;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function GraphInspector({ novelId }: { novelId?: string }) {
  const t = useTranslations("novelGraph");
  const { data: characters } = useCharacters(novelId);
  const { data: relationships } = useRelationships(novelId);
  const updateCharacter = useUpdateCharacter(novelId);
  const deleteCharacter = useDeleteCharacter(novelId);
  const updateRelationship = useUpdateRelationship(novelId);
  const deleteRelationship = useDeleteRelationship(novelId);
  const selectedCharacterId = useNovelGraphStore((state) => state.selectedCharacterId);
  const selectedRelationshipId = useNovelGraphStore((state) => state.selectedRelationshipId);
  const selectCharacter = useNovelGraphStore((state) => state.selectCharacter);
  const selectRelationship = useNovelGraphStore((state) => state.selectRelationship);
  const closeInspector = useNovelGraphStore((state) => state.closeInspector);

  const character = characters.find((item) => item.id === selectedCharacterId);
  const relationship = relationships.find((item) => item.id === selectedRelationshipId);

  const patchCharacter = (patch: Partial<Omit<Character, "id">>) => {
    if (!character) return;
    updateCharacter(character.id, characterPatchToPayload(patch));
  };

  const patchRelationship = (patch: Partial<Omit<Relationship, "id">>) => {
    if (!relationship) return;
    const next = { ...relationship, ...patch };
    updateRelationship(relationship.id, relationshipToPayload(next, t(`kinds.${next.kind}`)));
  };

  if (relationship) {
    const source = characters.find((item) => item.id === relationship.sourceId);
    const target = characters.find((item) => item.id === relationship.targetId);

    return (
      <div className="flex min-h-0 flex-col">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border/80 px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Link2Icon className="size-4 text-primary" />
              {t("inspector.relationshipTitle")}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {source?.name ?? t("inspector.unknownCharacter")} →{" "}
              {target?.name ?? t("inspector.unknownCharacter")}
            </p>
          </div>
          <DrawerClose
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t("inspector.closeRelationship")}
              />
            }
          >
            <XIcon />
          </DrawerClose>
        </div>
        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 md:grid-cols-3">
          <div className="space-y-4 md:col-span-1">
            <Field label={t("inspector.relationshipName")}>
              <Input
                value={relationship.label}
                onChange={(event) => patchRelationship({ label: event.target.value })}
              />
            </Field>
            <Field label={t("inspector.relationshipKind")}>
              <NativeSelect
                className="w-full"
                value={relationship.kind}
                onChange={(event) => {
                  const kind = event.target.value as RelationshipKind;
                  patchRelationship({ kind });
                }}
              >
                {relationshipKinds.map((kind) => (
                  <NativeSelectOption key={kind} value={kind}>
                    {t(`kinds.${kind}`)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field label={t("inspector.strength", { value: relationship.strength })}>
              <input
                type="range"
                min={1}
                max={100}
                value={relationship.strength}
                className="w-full accent-primary"
                onChange={(event) => patchRelationship({ strength: Number(event.target.value) })}
              />
            </Field>
            <label className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm">
              <input
                type="checkbox"
                checked={relationship.isSecret}
                onChange={(event) => patchRelationship({ isSecret: event.target.checked })}
              />
              {t("inspector.secretRelationship")}
            </label>
          </div>
          <div className="space-y-4 md:col-span-2">
            <Field label={t("inspector.relationshipDescription")}>
              <Textarea
                value={relationship.description}
                onChange={(event) => patchRelationship({ description: event.target.value })}
                placeholder={t("inspector.relationshipPlaceholder")}
              />
            </Field>
          </div>
        </div>
        <div className="flex shrink-0 justify-end border-t border-border/80 p-4">
          <Button
            variant="destructive"
            onClick={() =>
              deleteRelationship.mutate(relationship.id, {
                onSuccess: () => {
                  selectRelationship(undefined);
                  closeInspector();
                },
              })
            }
          >
            <Trash2Icon />
            {t("inspector.deleteRelationship")}
          </Button>
        </div>
      </div>
    );
  }

  if (character) {
    return (
      <div className="flex min-h-0 flex-col">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border/80 px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <UserRoundIcon className="size-4 text-primary" />
              {t("inspector.characterTitle")}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t("inspector.characterHint")}</p>
          </div>
          <DrawerClose
            render={
              <Button variant="ghost" size="icon-sm" aria-label={t("inspector.closeCharacter")} />
            }
          >
            <XIcon />
          </DrawerClose>
        </div>
        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 md:grid-cols-5">
          <div className="space-y-4 md:col-span-2">
            <Field label={t("inspector.characterName")}>
              <Input
                value={character.name}
                onChange={(event) => patchCharacter({ name: event.target.value })}
              />
            </Field>
            <Field label={t("inspector.characterSummary")}>
              <Textarea
                value={character.summary}
                onChange={(event) => patchCharacter({ summary: event.target.value })}
                placeholder={t("inspector.characterPlaceholder")}
              />
            </Field>
          </div>
          <div className="md:col-span-3">
            <CharacterFieldsEditor
              character={character}
              onUpdateField={(fieldId, patch) =>
                patchCharacter({
                  customFields: character.customFields.map((field) =>
                    field.id === fieldId ? { ...field, ...patch } : field,
                  ),
                })
              }
              onRemoveField={(fieldId) =>
                patchCharacter({
                  customFields: character.customFields.filter((field) => field.id !== fieldId),
                })
              }
              onAddField={(preset) => {
                const field = {
                  id: crypto.randomUUID(),
                  label: preset?.label ?? "",
                  value: "",
                  type: preset?.type ?? "text",
                };
                patchCharacter({ customFields: [...character.customFields, field] });
                return field.id;
              }}
            />
          </div>
        </div>
        <div className="flex shrink-0 justify-end border-t border-border/80 p-4">
          <Button
            variant="destructive"
            onClick={() =>
              deleteCharacter.mutate(character.id, {
                onSuccess: () => {
                  selectCharacter(undefined);
                  closeInspector();
                },
              })
            }
          >
            <Trash2Icon />
            {t("inspector.deleteCharacter")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col p-4">
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        {t("inspector.empty")}
      </div>
    </div>
  );
}
