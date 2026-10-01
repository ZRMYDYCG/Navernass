"use client";

import { Trash2Icon, UserRoundIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteCharacter, useUpdateCharacter } from "@/servers/library.server";
import { useRelationshipGraphStore } from "@/stores";

import type { Character } from "./model";
import { characterPatchToPayload } from "./model";
import { CharacterFieldsEditor } from "./character-fields-editor";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

interface CharacterFormProps {
  novelId: string | undefined;
  character: Character;
}

/** 检查器中的角色表单：基本信息 + 自定义字段 + 删除。 */
export function CharacterForm({ novelId, character }: CharacterFormProps) {
  const t = useTranslations("relationshipGraph");
  const updateCharacter = useUpdateCharacter(novelId);
  const deleteCharacter = useDeleteCharacter(novelId);
  const selectCharacter = useRelationshipGraphStore((state) => state.selectCharacter);
  const closeInspector = useRelationshipGraphStore((state) => state.closeInspector);

  const patchCharacter = (patch: Partial<Omit<Character, "id">>) => {
    updateCharacter(character.id, characterPatchToPayload(patch));
  };

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
