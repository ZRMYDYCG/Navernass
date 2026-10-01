"use client";

import { cn } from "cn";
import { FileTextIcon, NetworkIcon, SettingsIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useChapter } from "@/servers/library.server";

export type EditorTab = "chapter" | "graph" | "settings";

interface EditorTabsProps {
  chapterId?: string;
  settingsOpen: boolean;
  graphOpen: boolean;
  activeTab: EditorTab;
  onSelectTab: (tab: EditorTab) => void;
  onCloseGraph: () => void;
  onCloseSettings: () => void;
}

function TabItem({
  active,
  icon,
  label,
  onSelect,
  closeLabel,
  onClose,
}: {
  active: boolean;
  icon: ReactNode;
  label: ReactNode;
  onSelect: () => void;
  closeLabel?: string;
  onClose?: () => void;
}) {
  return (
    <div
      className={cn(
        "-mb-px flex items-center gap-1 border-r border-b border-border pr-1.5 text-sm",
        active
          ? "border-b-background bg-background text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <button
        type="button"
        role="tab"
        aria-selected={active}
        className="flex h-full items-center gap-1.5 pl-3 outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4 [&_svg]:shrink-0"
        onClick={onSelect}
      >
        {icon}
        <span className="max-w-48 truncate">{label}</span>
      </button>
      {onClose ? (
        <Button variant="ghost" size="icon-xs" aria-label={closeLabel} onClick={onClose}>
          <XIcon />
        </Button>
      ) : (
        <span className="w-1.5" />
      )}
    </div>
  );
}

function ChapterTabLabel({ chapterId }: { chapterId: string }) {
  const { data: chapter } = useChapter(chapterId);
  return chapter ? chapter.title : <Skeleton className="h-3.5 w-16" />;
}

export function EditorTabs({
  chapterId,
  settingsOpen,
  graphOpen,
  activeTab,
  onSelectTab,
  onCloseGraph,
  onCloseSettings,
}: EditorTabsProps) {
  const t = useTranslations("editorTabs");

  return (
    <div
      role="tablist"
      aria-label={t("label")}
      className="flex h-9 shrink-0 items-stretch border-b border-border bg-muted"
    >
      {chapterId ? (
        <TabItem
          active={activeTab === "chapter"}
          icon={<FileTextIcon />}
          label={<ChapterTabLabel chapterId={chapterId} />}
          onSelect={() => onSelectTab("chapter")}
        />
      ) : null}
      {graphOpen ? (
        <TabItem
          active={activeTab === "graph"}
          icon={<NetworkIcon />}
          label={t("graph")}
          onSelect={() => onSelectTab("graph")}
          closeLabel={t("closeGraph")}
          onClose={onCloseGraph}
        />
      ) : null}
      {settingsOpen ? (
        <TabItem
          active={activeTab === "settings"}
          icon={<SettingsIcon />}
          label={t("settings")}
          onSelect={() => onSelectTab("settings")}
          closeLabel={t("closeSettings")}
          onClose={onCloseSettings}
        />
      ) : null}
    </div>
  );
}
