"use client";

import { CheckIcon, ChevronDownIcon, HistoryIcon, MessageSquareIcon, PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ChatSession } from "@/schemas/agent.schema";

interface SessionSwitcherProps {
  sessions: ChatSession[];
  activeSessionId?: string;
  disabled: boolean;
  loading: boolean;
  onSelect: (sessionId: string) => void;
  onNew: () => void;
}

export function SessionSwitcher({
  sessions,
  activeSessionId,
  disabled,
  loading,
  onSelect,
  onNew,
}: SessionSwitcherProps) {
  const t = useTranslations("chat.sessions");
  const activeSession = sessions.find((session) => session.id === activeSessionId);

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
      <div className="min-w-0 flex-1">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="sm" disabled={disabled} aria-label={t("switch")} />
            }
          >
            <MessageSquareIcon />
            <span className="max-w-64 truncate">
              {activeSession?.title || t("newConversation")}
            </span>
            <ChevronDownIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <span className="flex items-center gap-1.5">
                  <HistoryIcon />
                  {t("history")}
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {sessions.map((session) => (
              <DropdownMenuItem key={session.id} onClick={() => onSelect(session.id)}>
                <span className="min-w-0 flex-1 truncate">{session.title || t("untitled")}</span>
                {session.activeRun ? (
                  <span className="text-xs text-muted-foreground">{t("running")}</span>
                ) : null}
                {session.id === activeSessionId ? <CheckIcon /> : null}
              </DropdownMenuItem>
            ))}
            {!loading && sessions.length === 0 ? (
              <DropdownMenuItem disabled>{t("empty")}</DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        disabled={disabled}
        aria-label={t("new")}
        onClick={onNew}
      >
        <PlusIcon />
      </Button>
    </header>
  );
}
