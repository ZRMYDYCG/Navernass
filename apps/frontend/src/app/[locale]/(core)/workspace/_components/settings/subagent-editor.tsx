"use client";

import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/http/error";
import {
  subagentPayloadSchema,
  type BuiltinSubagent,
  type CustomSubagent,
} from "@/lib/http/modules/subagent.schema";
import { useProviders } from "@/servers/provider.server";
import { useCreateSubagent, useUpdateSubagent } from "@/servers/subagent.server";

export type SubagentEditorTarget =
  | { kind: "new" }
  | { kind: "custom"; subagent: CustomSubagent }
  | { kind: "builtin"; subagent: BuiltinSubagent };

const inheritModel = "inherit";

const defaultInstructions = `你是一个专注于某个创作环节的 Subagent。

1. 写清楚它负责什么、不负责什么。
2. 写清楚需要参考哪些小说事实。
3. 写清楚输出格式，方便主 Agent 合并。`;

interface SubagentEditorProps {
  target: SubagentEditorTarget;
  onBack: () => void;
  onSaved: (subagent: CustomSubagent) => void;
}

export function SubagentEditor({ target, onBack, onSaved }: SubagentEditorProps) {
  const t = useTranslations("settings.customize.subagents");
  const providers = useProviders();
  const createSubagent = useCreateSubagent();
  const updateSubagent = useUpdateSubagent();
  const source = target.kind === "new" ? undefined : target.subagent;
  const readonly = target.kind === "builtin";
  const [name, setName] = useState(source?.name ?? "");
  const [description, setDescription] = useState(source?.description ?? "");
  const [instructions, setInstructions] = useState(source?.instructions ?? defaultInstructions);
  const [model, setModel] = useState(
    (target.kind === "custom" && target.subagent.providerId) || inheritModel,
  );
  const mutation = target.kind === "custom" ? updateSubagent : createSubagent;
  const payload = {
    name,
    description,
    instructions,
    providerId: model === inheritModel ? null : model,
    enabled: target.kind === "custom" ? target.subagent.enabled : true,
  };
  const valid = subagentPayloadSchema.safeParse(payload).success;
  const modelItems = [
    { value: inheritModel, label: t("inheritModel") },
    ...(providers.data ?? []).map((provider) => ({
      value: provider.id,
      label: `${provider.name} · ${provider.model}`,
    })),
  ];

  const save = async () => {
    const saved =
      target.kind === "custom"
        ? await updateSubagent.mutateAsync({ id: target.subagent.id, payload })
        : await createSubagent.mutateAsync(payload);
    onSaved(saved);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("back")}
          onClick={onBack}
        >
          <ArrowLeftIcon />
        </Button>
        <div className="flex min-w-0 flex-1 items-center gap-1 text-sm text-muted-foreground">
          <span>{t("breadcrumb")}</span>
          <ChevronRightIcon className="size-3.5 shrink-0" />
          <span className="truncate text-foreground">{source?.name ?? t("newTitle")}</span>
          {readonly ? <Badge variant="secondary">{t("builtinBadge")}</Badge> : null}
        </div>
        {readonly ? null : (
          <Button type="button" size="sm" disabled={!valid || mutation.isPending} onClick={save}>
            {mutation.isPending ? t("saving") : t("save")}
          </Button>
        )}
      </header>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="subagent-name">{t("fields.name")}</FieldLabel>
          <Input
            id="subagent-name"
            value={name}
            readOnly={readonly}
            maxLength={64}
            placeholder="dialogue-coach"
            onChange={(event) => setName(event.target.value)}
          />
          <FieldDescription>{t("fields.nameHelp")}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel>{t("fields.model")}</FieldLabel>
          <Select
            items={modelItems}
            value={model}
            disabled={readonly}
            onValueChange={(value) => {
              if (typeof value === "string") setModel(value);
            }}
          >
            <SelectTrigger aria-label={t("fields.model")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modelItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>{t("fields.modelHelp")}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="subagent-description">{t("fields.description")}</FieldLabel>
          <Textarea
            id="subagent-description"
            value={description}
            readOnly={readonly}
            maxLength={1024}
            rows={2}
            placeholder={t("fields.descriptionPlaceholder")}
            onChange={(event) => setDescription(event.target.value)}
          />
          <FieldDescription>{t("fields.descriptionHelp")}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="subagent-instructions">{t("fields.instructions")}</FieldLabel>
          <Textarea
            id="subagent-instructions"
            value={instructions}
            readOnly={readonly}
            rows={16}
            onChange={(event) => setInstructions(event.target.value)}
          />
          {mutation.isError ? <FieldError>{getErrorMessage(mutation.error)}</FieldError> : null}
        </Field>
      </FieldGroup>
    </div>
  );
}
