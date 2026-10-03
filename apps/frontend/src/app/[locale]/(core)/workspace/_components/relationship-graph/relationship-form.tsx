"use client";

import { Link2Icon, Trash2Icon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { relationshipKindSchema } from "@/lib/http/modules/library.schema";
import { useDeleteRelationship, useUpdateRelationship } from "@/servers/library.server";
import { useRelationshipGraphStore } from "@/stores";

import type { Relationship, RelationshipKind } from "./machine";

const relationshipKinds = relationshipKindSchema.options;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

interface RelationshipFormProps {
  novelId: string | undefined;
  relationship: Relationship;
  sourceName?: string;
  targetName?: string;
}

/** 检查器中的关系表单：名称、类型、强度与描述。 */
export function RelationshipForm({
  novelId,
  relationship,
  sourceName,
  targetName,
}: RelationshipFormProps) {
  const t = useTranslations("relationshipGraph");
  const updateRelationship = useUpdateRelationship(novelId);
  const deleteRelationship = useDeleteRelationship(novelId);
  const selectRelationship = useRelationshipGraphStore((state) => state.selectRelationship);
  const closeInspector = useRelationshipGraphStore((state) => state.closeInspector);

  const patchRelationship = (patch: Partial<Omit<Relationship, "id">>) => {
    const next = { ...relationship, ...patch };
    updateRelationship(relationship.id, {
      sourceToTargetLabel: next.label,
      targetToSourceLabel: next.label,
      note: next.description,
      kind: next.kind,
      strength: next.strength,
      isSecret: next.isSecret,
    });
  };

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border/80 px-5 py-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Link2Icon className="size-4 text-primary" />
            {t("inspector.relationshipTitle")}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {sourceName ?? t("inspector.unknownCharacter")} →{" "}
            {targetName ?? t("inspector.unknownCharacter")}
          </p>
        </div>
        <DrawerClose
          render={
            <Button variant="ghost" size="icon-sm" aria-label={t("inspector.closeRelationship")} />
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
