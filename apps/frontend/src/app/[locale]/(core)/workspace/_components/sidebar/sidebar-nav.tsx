"use client";

import { BlocksIcon, BookOpenIcon, SearchIcon, UsersIcon, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import type { SidebarView } from "./types";

const views: { id: SidebarView; icon: LucideIcon }[] = [
  { id: "novel", icon: BookOpenIcon },
  { id: "search", icon: SearchIcon },
  { id: "plugins", icon: BlocksIcon },
  { id: "characters", icon: UsersIcon },
];

interface SidebarNavProps {
  active: SidebarView;
  onSelect: (view: SidebarView) => void;
}

export function SidebarNav({ active, onSelect }: SidebarNavProps) {
  const t = useTranslations("sidebar.views");

  return (
    <nav
      aria-label={t("label")}
      className="flex h-9 shrink-0 items-center justify-center gap-1 border-b border-border px-2"
    >
      {views.map(({ id, icon: Icon }) => (
        <Tooltip key={id}>
          <TooltipTrigger
            render={
              <Button
                variant={id === active ? "outline" : "ghost"}
                size="icon-sm"
                aria-label={t(id)}
                aria-pressed={id === active}
                onClick={() => onSelect(id)}
              />
            }
          >
            <Icon />
          </TooltipTrigger>
          <TooltipContent side="bottom">{t(id)}</TooltipContent>
        </Tooltip>
      ))}
    </nav>
  );
}
