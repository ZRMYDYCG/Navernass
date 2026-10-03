"use client";

import { CameraIcon, Trash2Icon, UserRoundIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadFile } from "@/lib/http/modules/storage.api";
import { imageContentTypes } from "@/lib/http/modules/storage.schema";
import { useDeleteCharacter, useUpdateCharacter } from "@/servers/library.server";
import { useRelationshipGraphStore } from "@/stores";

import type { Character } from "./machine";
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
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadAvatar = useMutation({
    mutationFn: uploadFile,
    onSuccess: (avatar) => updateCharacter(character.id, { avatar }),
  });

  const patchCharacter = (patch: Partial<Omit<Character, "id">>) => {
    updateCharacter(character.id, {
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.avatar !== undefined && { avatar: patch.avatar }),
      ...(patch.summary !== undefined && { description: patch.summary }),
      ...(patch.customFields !== undefined && { custom_fields: patch.customFields }),
      ...(patch.position && {
        overview_x: patch.position.x,
        overview_y: patch.position.y,
      }),
    });
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
          <Field label={t("inspector.characterAvatar")}>
            <div className="flex items-center gap-3">
              <div className="group relative">
                <button
                  type="button"
                  disabled={uploadAvatar.isPending}
                  aria-label={t("inspector.uploadAvatar")}
                  className="block cursor-pointer rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => fileInput.current?.click()}
                >
                  <Avatar size="lg">
                    {character.avatar ? (
                      <AvatarImage src={character.avatar} alt={character.name} />
                    ) : null}
                    <AvatarFallback>{character.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/60 text-background opacity-0 transition-opacity group-hover:opacity-100">
                    <CameraIcon className="size-3.5" />
                  </span>
                </button>
                {character.avatar ? (
                  <button
                    type="button"
                    disabled={uploadAvatar.isPending}
                    aria-label={t("inspector.removeAvatar")}
                    className="absolute -top-1 -right-1 flex size-4.5 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100 focus-visible:outline-hidden"
                    onClick={() => patchCharacter({ avatar: "" })}
                  >
                    <XIcon className="size-2.5" />
                  </button>
                ) : null}
                <input
                  ref={fileInput}
                  type="file"
                  accept={imageContentTypes.join(",")}
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) uploadAvatar.mutate(file);
                  }}
                />
              </div>
              <div className="min-w-0 text-xs text-muted-foreground">
                <p>{t("inspector.avatarHint")}</p>
                {uploadAvatar.isError ? (
                  <p className="mt-1 text-destructive">{t("inspector.avatarUploadError")}</p>
                ) : null}
              </div>
            </div>
          </Field>
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
