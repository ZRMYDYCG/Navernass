"use client";

import { BoxIcon, HistoryIcon, PuzzleIcon, SettingsIcon, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment, useState, type ComponentType } from "react";

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

import { Changelog } from "./changelog";
import { General } from "./general";
import { Models } from "./models";

type SettingsSectionId = "general" | "models" | "customize" | "changelog";

interface SettingsSection {
  id: SettingsSectionId;
  icon: LucideIcon;
  content?: ComponentType;
}

const sectionGroups: SettingsSection[][] = [
  [{ id: "general", icon: SettingsIcon, content: General }],
  [
    { id: "models", icon: BoxIcon, content: Models },
    { id: "customize", icon: PuzzleIcon },
  ],
  [{ id: "changelog", icon: HistoryIcon, content: Changelog }],
];

function getSection(id: SettingsSectionId): SettingsSection {
  return sectionGroups.flat().find((section) => section.id === id) ?? sectionGroups[0][0];
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
      {sectionGroups.map((group, index) => (
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

export function Settings() {
  const t = useTranslations("settings");
  const [activeId, setActiveId] = useState<SettingsSectionId>("general");
  const active = getSection(activeId);
  const Content = active.content;

  return (
    <section aria-label={t("title")} className="flex h-full min-h-0 bg-background">
      <SettingsNav activeId={activeId} onSelect={setActiveId} />
      <Separator orientation="vertical" />
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto w-full max-w-3xl px-10 py-8">
          {Content ? <Content /> : <ComingSoonSection section={active} />}
        </div>
      </ScrollArea>
    </section>
  );
}
