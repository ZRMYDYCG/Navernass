"use client";

import {
  FileCodeIcon,
  GitBranchIcon,
  LoaderCircleIcon,
  PlusIcon,
  RouteIcon,
  SparklesIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { cn } from "cn";

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
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import type { CustomSkill, Skill } from "@/lib/http/modules/skill.schema";
import {
  useCustomSkills,
  useDeleteCustomSkill,
  useSkills,
  useUpdateCustomSkill,
} from "@/servers/skill.server";

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
  { id: "hooks", icon: GitBranchIcon, disabled: true },
  { id: "subagents", icon: UsersIcon, disabled: true },
  { id: "workflows", icon: RouteIcon, disabled: true },
] as const;

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
            variant={module.id === "skills" ? "secondary" : "ghost"}
            size="sm"
            disabled={"disabled" in module && module.disabled}
          >
            <module.icon />
            {t(`modules.${module.id}`)}
          </Button>
        ))}
      </div>
      <Skills onOpenSkillEditor={onOpenSkillEditor} />
    </div>
  );
}

function Skills({ onOpenSkillEditor }: { onOpenSkillEditor?: (state: SkillEditorState) => void }) {
  const t = useTranslations("settings.customize.skills");
  const skills = useSkills();
  const customSkills = useCustomSkills();
  const updateSkill = useUpdateCustomSkill();
  const deleteSkill = useDeleteCustomSkill();
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CustomSkill | null>(null);

  const builtins = useMemo(
    () => filterSkills(skills.data?.filter((skill) => skill.source !== "custom") ?? [], query),
    [query, skills.data],
  );
  const customs = useMemo(
    () => filterSkills(customSkills.data ?? [], query),
    [customSkills.data, query],
  );
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("search")}
            className="h-8"
          />
        </div>
        <Button type="button" size="sm" onClick={() => onOpenSkillEditor?.(newSkill())}>
          <PlusIcon />
          {t("new")}
        </Button>
      </header>
      <SkillGroup
        title={t("customTitle", { count: customs.length })}
        loading={customSkills.isLoading}
        emptyTitle={t("emptyCustomTitle")}
        emptyDescription={t("emptyCustomDescription")}
      >
        {customs.map((skill) => (
          <SkillRow
            key={skill.id}
            skill={skill}
            onOpen={() => onOpenSkillEditor?.(editSkill(skill))}
            onToggle={(enabled) => updateSkill.mutate({ id: skill.id, payload: { enabled } })}
            onDelete={() => setDeleteTarget(skill)}
          />
        ))}
      </SkillGroup>

      <ScrollArea className="max-h-96">
        <SkillGroup
          title={t("builtinTitle", { count: builtins.length })}
          loading={skills.isLoading}
          emptyTitle={t("emptyBuiltinTitle")}
          emptyDescription={t("emptyBuiltinDescription")}
        >
          {builtins.map((skill) => (
            <SkillRow
              key={skill.id}
              skill={skill}
              onOpen={() => onOpenSkillEditor?.(previewSkill(skill))}
            />
          ))}
        </SkillGroup>
      </ScrollArea>

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

interface SkillGroupProps {
  title: string;
  loading: boolean;
  emptyTitle: string;
  emptyDescription: string;
  children: React.ReactNode;
}

function SkillGroup({ title, loading, emptyTitle, emptyDescription, children }: SkillGroupProps) {
  const empty = !loading && (!Array.isArray(children) || children.length === 0);
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium">{title}</h2>
        {loading ? (
          <LoaderCircleIcon className="size-3.5 animate-spin text-muted-foreground" />
        ) : null}
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        {empty ? (
          <Empty className="min-h-40">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SparklesIcon />
              </EmptyMedia>
              <EmptyTitle>{emptyTitle}</EmptyTitle>
              <EmptyDescription>{emptyDescription}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

interface SkillRowProps {
  skill: Skill;
  onOpen?: () => void;
  onToggle?: (enabled: boolean) => void;
  onDelete?: () => void;
}

function SkillRow({ skill, onOpen, onToggle, onDelete }: SkillRowProps) {
  const t = useTranslations("settings.customize.skills");
  const metadata = skillMetadata(skill);
  return (
    <div className="group flex min-h-14 items-center gap-3 border-b border-border px-3 py-2 last:border-b-0">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <FileCodeIcon className="size-4" />
      </div>
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "min-w-0 flex-1 text-start outline-none",
          "cursor-default rounded-sm focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium">{skill.displayName}</span>
          <Badge variant="outline">{skill.category}</Badge>
          {!skill.enabled ? <Badge variant="secondary">{t("disabled")}</Badge> : null}
        </div>
        <p className="truncate text-sm text-muted-foreground">{skill.description}</p>
        {metadata ? <p className="truncate text-xs text-muted-foreground">{metadata}</p> : null}
      </button>
      {onToggle ? (
        <Switch checked={skill.enabled} onCheckedChange={onToggle} aria-label={t("toggle")} />
      ) : null}
      {onOpen ? (
        <Button type="button" variant="ghost" size="sm" onClick={onOpen}>
          {t("edit")}
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("delete")}
          onClick={onDelete}
        >
          <Trash2Icon />
        </Button>
      ) : null}
    </div>
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

function filterSkills<T extends Skill>(skills: T[], query: string) {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return skills;
  return skills.filter((skill) =>
    [skill.displayName, skill.description, skill.category, skill.slug]
      .join(" ")
      .toLowerCase()
      .includes(keyword),
  );
}

function skillMetadata(skill: Skill) {
  return [`v${skill.version}`, skill.source].filter(Boolean).join(" · ");
}
