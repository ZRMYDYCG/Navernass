"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  MessageSquareIcon,
  PanelLeftIcon,
  PanelRightIcon,
  SettingsIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  sidebarCollapsed: boolean;
  chatPanelCollapsed: boolean;
  onToggleSidebar: () => void;
  onToggleChatPanel: () => void;
  onOpenSettings: () => void;
}

export function AppHeader({
  sidebarCollapsed,
  chatPanelCollapsed,
  onToggleSidebar,
  onToggleChatPanel,
  onOpenSettings,
}: AppHeaderProps) {
  const t = useTranslations("appHeader");

  return (
    <header className="relative flex h-11 shrink-0 items-center border-b border-border bg-background px-2">
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("toggleSidebar")}
          aria-pressed={!sidebarCollapsed}
          onClick={onToggleSidebar}
        >
          <PanelLeftIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("back")}
          onClick={() => window.history.back()}
        >
          <ArrowLeftIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("forward")}
          onClick={() => window.history.forward()}
        >
          <ArrowRightIcon />
        </Button>
      </div>

      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-sm text-muted-foreground select-none">
        {t("workspace")}
      </span>

      <div className="ml-auto flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("toggleChatPanel")}
          aria-pressed={!chatPanelCollapsed}
          onClick={onToggleChatPanel}
        >
          <PanelRightIcon />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label={t("chats")}>
          <MessageSquareIcon />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label={t("settings")} onClick={onOpenSettings}>
          <SettingsIcon />
        </Button>
        <div className="ml-1">
          <Button size="sm">
            {t("agentsWindow")}
            <ArrowUpRightIcon />
          </Button>
        </div>
      </div>
    </header>
  );
}
