"use client";

import { BoxIcon, HistoryIcon, PuzzleIcon, SettingsIcon, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment, useEffect, useState, type ComponentType } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/servers/auth.server";

import { Changelog } from "./changelog";
import { Customize, type SkillEditorState } from "./customize";
import { General } from "./general";
import { Models } from "./models";

export type SettingsSectionId = "general" | "models" | "customize" | "changelog";

export interface SettingsSection {
  id: SettingsSectionId;
  icon: LucideIcon;
  content?: ComponentType<SettingsContentProps>;
}

interface SettingsContentProps {
  onOpenSkillEditor?: (state: SkillEditorState) => void;
  onTitleChange?: (title: string) => void;
}

export const settingsSectionGroups: SettingsSection[][] = [
  [{ id: "general", icon: SettingsIcon, content: General }],
  [
    { id: "models", icon: BoxIcon, content: Models },
    { id: "customize", icon: PuzzleIcon, content: Customize },
  ],
  [{ id: "changelog", icon: HistoryIcon, content: Changelog }],
];

function getSection(id: SettingsSectionId): SettingsSection {
  return (
    settingsSectionGroups.flat().find((section) => section.id === id) ?? settingsSectionGroups[0][0]
  );
}

function Profile() {
  const session = useSession();
  const user = session.data?.user;

  if (!user) return null;

  const displayName = user.name || user.email;

  return (
    <div className="flex items-center gap-2.5 px-1 py-1">
      <Avatar size="lg">
        {user.image ? <AvatarImage src={user.image} alt={displayName} /> : null}
        <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">{displayName}</span>
        {displayName !== user.email ? (
          <span className="truncate text-xs text-muted-foreground">{user.email}</span>
        ) : null}
      </div>
    </div>
  );
}

function SettingsNav({
  activeId,
  onSelect,
}: {
  activeId: SettingsSectionId;
  onSelect: (id: SettingsSectionId) => void;
}) {
  const t = useTranslations("settings");

  return (
    <nav aria-label={t("title")} className="flex w-52 shrink-0 flex-col gap-2 p-3">
      <Profile />
      <Separator className="h-px" />
      {settingsSectionGroups.map((group, index) => (
        <Fragment key={group[0].id}>
          {index > 0 ? <Separator className="h-px" /> : null}
          <ul className="flex flex-col gap-0.5">
            {group.map((section) => (
              <li key={section.id}>
                <Button
                  variant={section.id === activeId ? "secondary" : "ghost"}
                  size="sm"
                  aria-current={section.id === activeId ? "page" : undefined}
                  className="w-full justify-start"
                  onClick={() => onSelect(section.id)}
                >
                  <section.icon />
                  {t(`sections.${section.id}`)}
                </Button>
              </li>
            ))}
          </ul>
        </Fragment>
      ))}
    </nav>
  );
}

function ComingSoonSection({ section }: { section: SettingsSection }) {
  const t = useTranslations("settings");
  const Icon = section.icon;

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{t(`sections.${section.id}`)}</EmptyTitle>
        <EmptyDescription>{t("comingSoon")}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

/** 单个设置分区的内容，未实现的分区显示「即将推出」。 */
export function SettingsContent({
  sectionId,
  onOpenSkillEditor,
}: {
  sectionId: SettingsSectionId;
  onOpenSkillEditor?: (state: SkillEditorState) => void;
}) {
  const section = getSection(sectionId);
  const Content = section.content;
  return Content ? (
    <Content onOpenSkillEditor={onOpenSkillEditor} />
  ) : (
    <ComingSoonSection section={section} />
  );
}

export function Settings({ onOpenSkillEditor, onTitleChange }: SettingsContentProps) {
  const t = useTranslations("settings");
  const [activeId, setActiveId] = useState<SettingsSectionId>("general");

  useEffect(() => {
    onTitleChange?.(t(`sections.${activeId}`));
  }, [activeId, onTitleChange, t]);

  return (
    <section aria-label={t("title")} className="flex h-full min-h-0 bg-background">
      <SettingsNav activeId={activeId} onSelect={setActiveId} />
      <Separator orientation="vertical" />
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto w-full max-w-3xl px-10 py-8">
          <SettingsContent sectionId={activeId} onOpenSkillEditor={onOpenSkillEditor} />
        </div>
      </ScrollArea>
    </section>
  );
}
