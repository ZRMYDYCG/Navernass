"use client";

import {
  BotIcon,
  GitBranchIcon,
  LoaderCircleIcon,
  PlusIcon,
  RouteIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState, type ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CustomSkill, Skill } from "@/lib/http/modules/skill.schema";
import type { BuiltinSubagent, CustomSubagent } from "@/lib/http/modules/subagent.schema";
import {
  useCustomSkills,
  useDeleteCustomSkill,
  useSkills,
  useUpdateCustomSkill,
} from "@/servers/skill.server";
import { useDeleteSubagent, useSubagents, useUpdateSubagent } from "@/servers/subagent.server";

import { Hooks } from "./hooks";
import { SubagentEditor, type SubagentEditorTarget } from "./subagent-editor";

const defaultSkillMd = `---
name: custom-skill
description: 描述这个 Skill 什么时候应该被使用。
license: user
metadata:
  version: "1.0.0"
  category: custom
  modes:
    - agent
---

# 自定义 Skill

1. 写清楚这个 Skill 的适用场景。
2. 写清楚执行步骤和输出要求。
3. 写清楚不能越过的边界。`;

const modules = [
  { id: "skills", icon: SparklesIcon },
  { id: "hooks", icon: GitBranchIcon },
  { id: "subagents", icon: UsersIcon },
  { id: "workflows", icon: RouteIcon, disabled: true },
] as const;

type ModuleId = (typeof modules)[number]["id"];

const statusFilters = ["all", "enabled", "disabled"] as const;
type StatusFilter = (typeof statusFilters)[number];

const skillSourceFilters = ["all", "builtin", "community", "custom"] as const;
type SkillSourceFilter = (typeof skillSourceFilters)[number];

const subagentKindFilters = ["all", "builtin", "custom"] as const;
type SubagentKindFilter = (typeof subagentKindFilters)[number];

type SkillEntry = { kind: "custom"; skill: CustomSkill } | { kind: "catalog"; skill: Skill };

type SubagentEntry =
  | { kind: "custom"; subagent: CustomSubagent }
  | { kind: "builtin"; subagent: BuiltinSubagent };

export interface SkillEditorState {
  id?: string;
  title: string;
  description: string;
  skillMd: string;
  enabled: boolean;
  readonly: boolean;
}

export function Customize({
  onOpenSkillEditor,
}: {
  onOpenSkillEditor?: (state: SkillEditorState) => void;
}) {
  const t = useTranslations("settings.customize");
  const [activeModule, setActiveModule] = useState<ModuleId>("skills");
  const [subagentEditor, setSubagentEditor] = useState<SubagentEditorTarget | null>(null);

  if (subagentEditor) {
    return (
      <SubagentEditor
        key={
          subagentEditor.kind === "custom"
            ? subagentEditor.subagent.id
            : subagentEditor.kind === "builtin"
              ? subagentEditor.subagent.name
              : "new-subagent"
        }
        target={subagentEditor}
        onBack={() => setSubagentEditor(null)}
        onSaved={(subagent) => setSubagentEditor({ kind: "custom", subagent })}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {modules.map((module) => (
          <Button
            key={module.id}
            type="button"
            variant={module.id === activeModule ? "secondary" : "ghost"}
            size="sm"
            disabled={"disabled" in module && module.disabled}
            onClick={() => setActiveModule(module.id)}
          >
            <module.icon />
            {t(`modules.${module.id}`)}
          </Button>
        ))}
      </div>
      {activeModule === "subagents" ? <Subagents onOpen={setSubagentEditor} /> : null}
      {activeModule === "hooks" ? <Hooks /> : null}
      {activeModule === "skills" ? <Skills onOpenSkillEditor={onOpenSkillEditor} /> : null}
    </div>
  );
}

function Skills({ onOpenSkillEditor }: { onOpenSkillEditor?: (state: SkillEditorState) => void }) {
  const t = useTranslations("settings.customize.skills");
  const keywordId = useId();
  const skills = useSkills();
  const customSkills = useCustomSkills();
  const updateSkill = useUpdateCustomSkill();
  const deleteSkill = useDeleteCustomSkill();
  const [keyword, setKeyword] = useState("");
  const [source, setSource] = useState<SkillSourceFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [deleteTarget, setDeleteTarget] = useState<CustomSkill | null>(null);
  const loading = skills.isLoading || customSkills.isLoading;

  const entries = useMemo(() => {
    const all = [
      ...(customSkills.data ?? []).map((skill): SkillEntry => ({ kind: "custom", skill })),
      ...(skills.data ?? [])
        .filter((skill) => skill.source !== "custom")
        .map((skill): SkillEntry => ({ kind: "catalog", skill })),
    ];
    return all.filter(
      ({ skill }) =>
        (source === "all" || skill.source === source) &&
        matchesStatus(skill.enabled, status) &&
        matchesKeyword([skill.displayName, skill.description, skill.category, skill.slug], keyword),
    );
  }, [customSkills.data, keyword, skills.data, source, status]);

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex items-end gap-3"
        onSubmit={(event) => event.preventDefault()}
        onReset={() => {
          setKeyword("");
          setSource("all");
          setStatus("all");
        }}
      >
        <Field className="min-w-0 flex-1">
          <FieldLabel htmlFor={keywordId}>{t("keyword")}</FieldLabel>
          <Input
            id={keywordId}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={t("search")}
          />
        </Field>
        <FilterSelect
          label={t("source")}
          value={source}
          items={skillSourceFilters.map((value) => ({
            value,
            label: value === "all" ? t("all") : t(`sources.${value}`),
          }))}
          onValueChange={setSource}
        />
        <FilterSelect
          label={t("status")}
          value={status}
          items={statusFilters.map((value) => ({
            value,
            label: value === "all" ? t("all") : t(`statuses.${value}`),
          }))}
          onValueChange={setStatus}
        />
        <Button type="reset" variant="outline">
          {t("reset")}
        </Button>
      </form>

      <section className="flex flex-col gap-2">
        <header className="flex items-center gap-2">
          <h2 className="text-sm font-medium">{t("listTitle")}</h2>
          <span className="text-xs text-muted-foreground">
            {t("total", { count: entries.length })}
          </span>
          {loading ? (
            <LoaderCircleIcon className="size-3.5 animate-spin text-muted-foreground" />
          ) : null}
          <Button
            type="button"
            size="sm"
            className="ml-auto"
            onClick={() => onOpenSkillEditor?.(newSkill())}
          >
            <PlusIcon />
            {t("new")}
          </Button>
        </header>
        <div className="-mx-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.name")}</TableHead>
                <TableHead>{t("columns.source")}</TableHead>
                <TableHead>{t("columns.version")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead>
                  <span className="flex justify-end">{t("columns.actions")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length ? (
                entries.map((entry) => (
                  <TableRow key={entry.skill.id}>
                    <TableCell>
                      <NameCell title={entry.skill.displayName} detail={entry.skill.description} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.kind === "custom" ? "secondary" : "outline"}>
                        {t(`sources.${entry.skill.source}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground tabular-nums">
                        v{entry.skill.version}
                      </span>
                    </TableCell>
                    <TableCell>
                      {entry.kind === "custom" ? (
                        <Switch
                          size="sm"
                          checked={entry.skill.enabled}
                          aria-label={t("toggle", { name: entry.skill.displayName })}
                          onCheckedChange={(enabled) =>
                            updateSkill.mutate({ id: entry.skill.id, payload: { enabled } })
                          }
                        />
                      ) : (
                        <Switch
                          size="sm"
                          checked={entry.skill.enabled}
                          disabled
                          aria-label={t("toggle", { name: entry.skill.displayName })}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {entry.kind === "custom" ? (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              onClick={() => onOpenSkillEditor?.(editSkill(entry.skill))}
                            >
                              {t("edit")}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="xs"
                              onClick={() => setDeleteTarget(entry.skill)}
                            >
                              {t("delete")}
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => onOpenSkillEditor?.(previewSkill(entry.skill))}
                          >
                            {t("open")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableMessage colSpan={5}>
                  {loading ? (
                    <span className="text-sm text-muted-foreground">{t("loading")}</span>
                  ) : (
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <SparklesIcon />
                        </EmptyMedia>
                        <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
                        <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </TableMessage>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? t("deleteDescription", { name: deleteTarget.displayName }) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteSkill.isPending}
              onClick={() => {
                if (!deleteTarget) return;
                deleteSkill.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
              }}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Subagents({ onOpen }: { onOpen: (target: SubagentEditorTarget) => void }) {
  const t = useTranslations("settings.customize.subagents");
  const keywordId = useId();
  const subagents = useSubagents();
  const updateSubagent = useUpdateSubagent();
  const deleteSubagent = useDeleteSubagent();
  const [keyword, setKeyword] = useState("");
  const [kind, setKind] = useState<SubagentKindFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [deleteTarget, setDeleteTarget] = useState<CustomSubagent | null>(null);

  const entries = useMemo(() => {
    const all = [
      ...(subagents.data?.custom ?? []).map((subagent): SubagentEntry => ({
        kind: "custom",
        subagent,
      })),
      ...(subagents.data?.builtin ?? []).map((subagent): SubagentEntry => ({
        kind: "builtin",
        subagent,
      })),
    ];
    return all.filter(
      (entry) =>
        (kind === "all" || entry.kind === kind) &&
        matchesStatus(entry.kind === "builtin" || entry.subagent.enabled, status) &&
        matchesKeyword([entry.subagent.name, entry.subagent.description], keyword),
    );
  }, [keyword, kind, status, subagents.data]);

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex items-end gap-3"
        onSubmit={(event) => event.preventDefault()}
        onReset={() => {
          setKeyword("");
          setKind("all");
          setStatus("all");
        }}
      >
        <Field className="min-w-0 flex-1">
          <FieldLabel htmlFor={keywordId}>{t("keyword")}</FieldLabel>
          <Input
            id={keywordId}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={t("search")}
          />
        </Field>
        <FilterSelect
          label={t("kind")}
          value={kind}
          items={subagentKindFilters.map((value) => ({
            value,
            label: value === "all" ? t("all") : t(`kinds.${value}`),
          }))}
          onValueChange={setKind}
        />
        <FilterSelect
          label={t("status")}
          value={status}
          items={statusFilters.map((value) => ({
            value,
            label: value === "all" ? t("all") : t(`statuses.${value}`),
          }))}
          onValueChange={setStatus}
        />
        <Button type="reset" variant="outline">
          {t("reset")}
        </Button>
      </form>

      <section className="flex flex-col gap-2">
        <header className="flex items-center gap-2">
          <h2 className="text-sm font-medium">{t("listTitle")}</h2>
          <span className="text-xs text-muted-foreground">
            {t("total", { count: entries.length })}
          </span>
          {subagents.isLoading ? (
            <LoaderCircleIcon className="size-3.5 animate-spin text-muted-foreground" />
          ) : null}
          <Button
            type="button"
            size="sm"
            className="ml-auto"
            onClick={() => onOpen({ kind: "new" })}
          >
            <PlusIcon />
            {t("new")}
          </Button>
        </header>
        <div className="-mx-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.name")}</TableHead>
                <TableHead>{t("columns.kind")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead>
                  <span className="flex justify-end">{t("columns.actions")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length ? (
                entries.map((entry) => (
                  <TableRow
                    key={
                      entry.kind === "custom" ? entry.subagent.id : `builtin:${entry.subagent.name}`
                    }
                  >
                    <TableCell>
                      <NameCell title={entry.subagent.name} detail={entry.subagent.description} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.kind === "custom" ? "secondary" : "outline"}>
                        {t(`kinds.${entry.kind}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {entry.kind === "custom" ? (
                        <Switch
                          size="sm"
                          checked={entry.subagent.enabled}
                          aria-label={t("toggle", { name: entry.subagent.name })}
                          onCheckedChange={(enabled) =>
                            updateSubagent.mutate({ id: entry.subagent.id, payload: { enabled } })
                          }
                        />
                      ) : (
                        <Switch
                          size="sm"
                          checked
                          disabled
                          aria-label={t("toggle", { name: entry.subagent.name })}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {entry.kind === "custom" ? (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              onClick={() => onOpen({ kind: "custom", subagent: entry.subagent })}
                            >
                              {t("edit")}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="xs"
                              onClick={() => setDeleteTarget(entry.subagent)}
                            >
                              {t("delete")}
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => onOpen({ kind: "builtin", subagent: entry.subagent })}
                          >
                            {t("open")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableMessage colSpan={4}>
                  {subagents.isLoading ? (
                    <span className="text-sm text-muted-foreground">{t("loading")}</span>
                  ) : (
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <BotIcon />
                        </EmptyMedia>
                        <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
                        <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </TableMessage>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? t("deleteDescription", { name: deleteTarget.name }) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteSubagent.isPending}
              onClick={() => {
                if (!deleteTarget) return;
                deleteSubagent.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
              }}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  items,
  onValueChange,
}: {
  label: string;
  value: T;
  items: { value: T; label: string }[];
  onValueChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <Field className="min-w-0 flex-1">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        items={items}
        value={value}
        onValueChange={(next) => {
          const item = items.find((candidate) => candidate.value === next);
          if (item) onValueChange(item.value);
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function NameCell({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex max-w-80 min-w-0 flex-col">
      <span className="truncate font-medium">{title}</span>
      <span className="truncate text-xs text-muted-foreground">{detail}</span>
    </div>
  );
}

function TableMessage({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan}>
        <div className="flex min-h-40 items-center justify-center whitespace-normal">
          {children}
        </div>
      </TableCell>
    </TableRow>
  );
}

function newSkill(): SkillEditorState {
  return {
    title: "custom-skill",
    description: "",
    skillMd: defaultSkillMd,
    enabled: true,
    readonly: false,
  };
}

function editSkill(skill: CustomSkill): SkillEditorState {
  return {
    id: skill.id,
    title: skill.displayName,
    description: skill.description,
    skillMd: skill.skillMd,
    enabled: skill.enabled,
    readonly: false,
  };
}

function previewSkill(skill: Skill): SkillEditorState {
  return {
    id: skill.id,
    title: skill.displayName,
    description: skill.description,
    enabled: skill.enabled,
    readonly: true,
    skillMd: `---\nname: ${skill.slug}\ndescription: ${skill.description}\nmetadata:\n  version: "${skill.version}"\n  category: ${skill.category}\n---\n\n# ${skill.displayName}\n\n${skill.description}`,
  };
}

function matchesStatus(enabled: boolean, status: StatusFilter) {
  return status === "all" || (status === "enabled") === enabled;
}

function matchesKeyword(fields: string[], keyword: string) {
  const normalized = keyword.trim().toLowerCase();
  return !normalized || fields.join(" ").toLowerCase().includes(normalized);
}
