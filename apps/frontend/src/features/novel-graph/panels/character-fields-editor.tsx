"use client";

import { EllipsisIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { splitTags } from "../character-fields";
import type { Character, CharacterCustomField, CharacterFieldType } from "../types";

const fieldTypes: Array<{ value: CharacterFieldType; label: string }> = [
  { value: "text", label: "短文本" },
  { value: "longText", label: "长文本" },
  { value: "tags", label: "标签" },
];

const presets: Array<Pick<CharacterCustomField, "label" | "type">> = [
  { label: "角色定位", type: "text" },
  { label: "阵营", type: "text" },
  { label: "标签", type: "tags" },
  { label: "年龄", type: "text" },
  { label: "能力", type: "longText" },
  { label: "秘密", type: "longText" },
  { label: "人物弧光", type: "longText" },
];

function TagInput({
  value,
  label,
  autoFocus,
  onChange,
}: {
  value: string;
  label: string;
  autoFocus: boolean;
  onChange: (value: string) => void;
}) {
  const tags = splitTags(value);
  const [draft, setDraft] = useState("");

  const commit = (text: string) => {
    const added = splitTags(text).filter((tag) => !tags.includes(tag));
    if (added.length > 0) onChange([...tags, ...added].join("，"));
    setDraft("");
  };

  const remove = (tag: string) => onChange(tags.filter((item) => item !== tag).join("，"));

  return (
    <div className="flex min-h-8 flex-wrap items-center gap-1 rounded-lg border border-input px-1.5 py-1 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary">
          {tag}
          <button
            type="button"
            aria-label={`移除标签 ${tag}`}
            className="-mr-1 rounded-full text-muted-foreground hover:text-foreground [&_svg]:size-3"
            onClick={() => remove(tag)}
          >
            <XIcon />
          </button>
        </Badge>
      ))}
      <input
        value={draft}
        aria-label={`${label} 新标签`}
        placeholder={tags.length > 0 ? "" : "输入后回车添加"}
        autoFocus={autoFocus}
        className="h-6 min-w-20 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
        onChange={(event) => {
          const text = event.target.value;
          if (/[,，、]/.test(text)) commit(text);
          else setDraft(text);
        }}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === "Enter") {
            event.preventDefault();
            commit(draft);
          } else if (event.key === "Backspace" && !draft && tags.length > 0) {
            remove(tags[tags.length - 1]);
          }
        }}
        onBlur={() => commit(draft)}
      />
    </div>
  );
}

function FieldValueEditor({
  field,
  autoFocus,
  onChange,
}: {
  field: CharacterCustomField;
  autoFocus: boolean;
  onChange: (value: string) => void;
}) {
  const label = field.label || "属性";

  if (field.type === "tags") {
    return <TagInput value={field.value} label={label} autoFocus={autoFocus} onChange={onChange} />;
  }

  if (field.type === "longText") {
    return (
      <Textarea
        value={field.value}
        aria-label={label}
        placeholder="填写内容"
        rows={2}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return (
    <Input
      value={field.value}
      aria-label={label}
      placeholder="填写内容"
      autoFocus={autoFocus}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function FieldRow({
  field,
  focusOnMount,
  onUpdateField,
  onRemoveField,
}: {
  field: CharacterCustomField;
  focusOnMount: boolean;
  onUpdateField: (fieldId: string, patch: Partial<Omit<CharacterCustomField, "id">>) => void;
  onRemoveField: (fieldId: string) => void;
}) {
  const update = (patch: Partial<Omit<CharacterCustomField, "id">>) =>
    onUpdateField(field.id, patch);

  return (
    <li className="flex items-start gap-2">
      <input
        value={field.label}
        aria-label="属性名"
        placeholder="属性名"
        autoFocus={focusOnMount && !field.label}
        className="h-8 w-24 shrink-0 truncate rounded-md bg-transparent px-2 text-sm text-muted-foreground outline-none placeholder:text-muted-foreground/60 hover:bg-muted focus:bg-muted focus:text-foreground"
        onChange={(event) => update({ label: event.target.value })}
      />
      <div className="min-w-0 flex-1">
        <FieldValueEditor
          field={field}
          autoFocus={focusOnMount && Boolean(field.label)}
          onChange={(value) => update({ value })}
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label={`${field.label || "属性"}选项`} />
          }
        >
          <EllipsisIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>类型</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={field.type}
              onValueChange={(type: CharacterFieldType) => update({ type })}
            >
              {fieldTypes.map((type) => (
                <DropdownMenuRadioItem key={type.value} value={type.value}>
                  {type.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => onRemoveField(field.id)}>
            <Trash2Icon />
            删除属性
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

export function CharacterFieldsEditor({
  character,
  onUpdateField,
  onRemoveField,
  onAddField,
}: {
  character: Character;
  onUpdateField: (fieldId: string, patch: Partial<Omit<CharacterCustomField, "id">>) => void;
  onRemoveField: (fieldId: string) => void;
  onAddField: (preset?: Pick<CharacterCustomField, "label" | "type">) => string;
}) {
  const [focusFieldId, setFocusFieldId] = useState<string>();

  const usedLabels = new Set(character.customFields.map((field) => field.label.trim()));
  const availablePresets = presets.filter((preset) => !usedLabels.has(preset.label));

  const addField = (preset?: Pick<CharacterCustomField, "label" | "type">) =>
    setFocusFieldId(onAddField(preset));

  return (
    <section className="flex flex-col gap-3">
      <div className="text-sm font-medium">自定义属性</div>
      {character.customFields.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {character.customFields.map((field) => (
            <FieldRow
              key={field.id}
              field={field}
              focusOnMount={field.id === focusFieldId}
              onUpdateField={onUpdateField}
              onRemoveField={onRemoveField}
            />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          还没有属性。从下面挑常用设定，或添加自定义属性。
        </p>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        {availablePresets.map((preset) => (
          <Button key={preset.label} variant="outline" size="xs" onClick={() => addField(preset)}>
            <PlusIcon />
            {preset.label}
          </Button>
        ))}
        <Button variant="ghost" size="xs" onClick={() => addField()}>
          <PlusIcon />
          自定义属性
        </Button>
      </div>
    </section>
  );
}
