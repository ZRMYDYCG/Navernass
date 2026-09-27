"use client";

import {
  BookOpenIcon,
  BotIcon,
  BoxIcon,
  HistoryIcon,
  PuzzleIcon,
  SettingsIcon,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment, useState } from "react";

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

import { GeneralSettings } from "./general-settings";

type SettingsSection = "general" | "agents" | "models" | "customize" | "docs" | "changelog";

interface SectionEntry {
  id: SettingsSection;
  icon: LucideIcon;
}

const sectionGroups: SectionEntry[][] = [
  [{ id: "general", icon: SettingsIcon }],
  [{ id: "agents", icon: BotIcon }],
  [
    { id: "models", icon: BoxIcon },
    { id: "customize", icon: PuzzleIcon },
  ],
  [
    { id: "docs", icon: BookOpenIcon },
    { id: "changelog", icon: HistoryIcon },
  ],
];

function SettingsNav({
  active,
  onSelect,
}: {
  active: SectionEntry;
  onSelect: (entry: SectionEntry) => void;
}) {
  const t = useTranslations("settings");

  return (
    <nav aria-label={t("title")} className="flex w-52 shrink-0 flex-col gap-2 p-3">
      {sectionGroups.map((group, index) => (
        <Fragment key={group[0].id}>
          {index > 0 ? <Separator /> : null}
          <ul className="flex flex-col gap-0.5">
            {group.map((entry) => (
              <li key={entry.id}>
                <Button
                  variant={entry === active ? "secondary" : "ghost"}
                  size="sm"
                  aria-current={entry === active ? "page" : undefined}
                  className="w-full justify-start"
                  onClick={() => onSelect(entry)}
                >
                  <entry.icon />
                  {t(`sections.${entry.id}`)}
                </Button>
              </li>
            ))}
          </ul>
        </Fragment>
      ))}
    </nav>
  );
}

function PlaceholderSection({ entry: { id, icon: Icon } }: { entry: SectionEntry }) {
  const t = useTranslations("settings");

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{t(`sections.${id}`)}</EmptyTitle>
        <EmptyDescription>{t("comingSoon")}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function SettingsView() {
  const t = useTranslations("settings");
  const [active, setActive] = useState<SectionEntry>(sectionGroups[0][0]);

  return (
    <section aria-label={t("title")} className="flex h-full min-h-0 bg-background">
      <SettingsNav active={active} onSelect={setActive} />
      <Separator orientation="vertical" />
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto w-full max-w-3xl px-10 py-8">
          {active.id === "general" ? <GeneralSettings /> : <PlaceholderSection entry={active} />}
        </div>
      </ScrollArea>
    </section>
  );
}
