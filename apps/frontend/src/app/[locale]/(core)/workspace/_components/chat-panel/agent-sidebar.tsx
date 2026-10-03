"use client";

import { useQueryClient } from "@tanstack/react-query";
import { cn } from "cn";
import {
  CheckCircle2Icon,
  CircleDashedIcon,
  MoreHorizontalIcon,
  PanelRightIcon,
  PinIcon,
  SendIcon,
  SparklesIcon,
} from "lucide-react";
import { type ReactNode, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatSession } from "@/lib/http/modules/agent.schema";
import {
  agentKeys,
  useChatSessions,
  useDeleteChatSession,
  useUpdateChatSession,
} from "@/servers/agent.server";
import { useSession } from "@/servers/auth.server";
import { useWorkspaceStore } from "@/stores";
import type { AgentDraft } from "@/stores/workspace/slices/agent-drafts.slice";

interface AgentSidebarProps {
  novelId?: string;
  onClose: () => void;
  onNewAgent: () => void;
  onOpenDraft: (id: string) => void;
  onCustomize: () => void;
}

export function AgentSidebar({
  novelId,
  onClose,
  onNewAgent,
  onOpenDraft,
  onCustomize,
}: AgentSidebarProps) {
  const t = useTranslations("agentSidebar");
  const sessions = useChatSessions(novelId);
  const updateSession = useUpdateChatSession();
  const deleteSession = useDeleteChatSession();
  const queryClient = useQueryClient();
  const session = useSession();
  const user = session.data?.user;
  const displayName = user?.name || user?.email || t("anonymous");
  const [query, setQuery] = useState("");
  const activeSessionId = useWorkspaceStore((state) =>
    novelId ? state.sessionIds[novelId] : undefined,
  );
  const agentDrafts = useWorkspaceStore((state) => state.agentDrafts);
  const setAgentDraftPinned = useWorkspaceStore((state) => state.setAgentDraftPinned);
  const removeAgentDraft = useWorkspaceStore((state) => state.removeAgentDraft);
  const selectSession = useWorkspaceStore((state) => state.selectSession);
  const drafts = useMemo(
    () =>
      Object.values(agentDrafts)
        .filter((draft) => draft.novelId === novelId && draft.text.trim())
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [agentDrafts, novelId],
  );
  const visibleSessions = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const matched = keyword
      ? (sessions.data ?? []).filter((session) =>
          (session.title || t("untitled")).toLowerCase().includes(keyword),
        )
      : (sessions.data ?? []);
    return [...matched].sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at));
  }, [query, sessions.data, t]);
  const pinnedDrafts = drafts.filter((draft) => draft.pinned);
  const unpinnedDrafts = drafts.filter((draft) => !draft.pinned);
  const pinnedSessions = visibleSessions.filter((item) => item.pinned);
  const dayGroups = groupByDay(visibleSessions.filter((item) => !item.pinned));

  const openSession = (sessionId: string) => {
    if (!novelId) return;
    selectSession(novelId, sessionId);
  };

  const togglePinned = (target: ChatSession) =>
    updateSession.mutate({ id: target.id, payload: { pinned: !target.pinned } });

  const renameSession = (target: ChatSession, title: string) =>
    updateSession.mutate({ id: target.id, payload: { title } });

  const removeSession = (target: ChatSession) => {
    if (!novelId) return;
    deleteSession.mutate(target.id, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: agentKeys.sessions(novelId) });
        if (target.id === activeSessionId) selectSession(novelId, undefined);
      },
    });
  };

  const renderDraft = (draft: AgentDraft) => (
    <AgentItem
      key={draft.id}
      title={draft.text}
      updatedAt={draft.updatedAt}
      pinned={Boolean(draft.pinned)}
      draft
      onSelect={() => onOpenDraft(draft.id)}
      onTogglePinned={() => setAgentDraftPinned(draft.id, !draft.pinned)}
      onDelete={() => removeAgentDraft(draft.id)}
    />
  );

  const renderSession = (target: ChatSession) => (
    <AgentItem
      key={target.id}
      title={target.title || t("untitled")}
      updatedAt={Date.parse(target.updated_at)}
      pinned={target.pinned}
      active={activeSessionId === target.id}
      onSelect={() => openSession(target.id)}
      onTogglePinned={() => togglePinned(target)}
      onRename={(title) => renameSession(target, title)}
      onDelete={() => removeSession(target)}
    />
  );

  return (
    <aside className="flex h-full min-h-0 w-full flex-col bg-background">
      <header className="flex h-10 shrink-0 items-center justify-end border-b border-border px-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("close")}
          onClick={onClose}
        >
          <PanelRightIcon />
        </Button>
      </header>

      <div className="p-3">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("search")}
        />
      </div>

      <div className="space-y-1 px-3 pb-4">
        <button
          type="button"
          className="flex h-9 w-full items-center gap-3 rounded-md px-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          onClick={onNewAgent}
        >
          <SendIcon className="size-4" />
          <span className="flex-1 text-left">{t("newAgent")}</span>
          <span className="text-xs">⌘N</span>
        </button>
        <button
          type="button"
          className="flex h-9 w-full items-center gap-3 rounded-md px-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          onClick={onCustomize}
        >
          <SparklesIcon className="size-4" />
          <span>{t("customize")}</span>
        </button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-5 px-3 pb-4">
          {pinnedDrafts.length || pinnedSessions.length ? (
            <AgentGroup title={t("pinned")}>
              {pinnedDrafts.map(renderDraft)}
              {pinnedSessions.map(renderSession)}
            </AgentGroup>
          ) : null}
          {unpinnedDrafts.length ? (
            <AgentGroup title={t("drafts")}>{unpinnedDrafts.map(renderDraft)}</AgentGroup>
          ) : null}
          {dayGroups.map((group) => (
            <AgentGroup key={group.key} title={t(group.key)}>
              {group.sessions.map(renderSession)}
            </AgentGroup>
          ))}
        </div>
      </ScrollArea>

      <footer className="flex shrink-0 items-center gap-3 border-t border-border p-4">
        <Avatar size="lg">
          {user?.image ? <AvatarImage src={user.image} alt={displayName} /> : null}
          <AvatarFallback>{displayName.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{displayName}</p>
          {user?.email ? (
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          ) : null}
        </div>
      </footer>
    </aside>
  );
}

const DAY_GROUP_KEYS = ["today", "yesterday", "older"] as const;

function groupByDay(sessions: ChatSession[]) {
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const startOfYesterday = startOfToday - 86_400_000;
  const dayOf = (session: ChatSession) => {
    const updatedAt = Date.parse(session.updated_at);
    if (updatedAt >= startOfToday) return "today";
    if (updatedAt >= startOfYesterday) return "yesterday";
    return "older";
  };
  return DAY_GROUP_KEYS.map((key) => ({
    key,
    sessions: sessions.filter((session) => dayOf(session) === key),
  })).filter((group) => group.sessions.length > 0);
}

function AgentGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 px-2 text-xs font-medium text-muted-foreground">{title}</h3>
      <div className="space-y-0.5">{children}</div>
    </section>
  );
}

interface AgentItemProps {
  title: string;
  updatedAt: number;
  pinned: boolean;
  draft?: boolean;
  active?: boolean;
  onSelect: () => void;
  onTogglePinned: () => void;
  onRename?: (title: string) => void;
  onDelete: () => void;
}

function AgentItem({
  title,
  updatedAt,
  pinned,
  draft = false,
  active = false,
  onSelect,
  onTogglePinned,
  onRename,
  onDelete,
}: AgentItemProps) {
  const t = useTranslations("agentSidebar");
  const [renaming, setRenaming] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);
  // 菜单关闭时默认把焦点还给触发器，会立刻让重命名输入框失焦。
  const menuFinalFocus = () => renameInputRef.current ?? true;

  const commitRename = (value: string) => {
    setRenaming(false);
    const nextTitle = value.trim();
    if (nextTitle && nextTitle !== title) onRename?.(nextTitle);
  };

  // ContextMenu 与 DropdownMenu 底层都是 Base UI Menu.Item，同一份菜单项可在两处复用。
  const menuItems = (
    <>
      <DropdownMenuItem onClick={onTogglePinned}>{pinned ? t("unpin") : t("pin")}</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onDelete}>{t("delete")}</DropdownMenuItem>
      {onRename ? (
        <DropdownMenuItem onClick={() => setRenaming(true)}>{t("rename")}</DropdownMenuItem>
      ) : null}
    </>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <div
            className={cn(
              "group flex h-8 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground data-popup-open:bg-accent data-popup-open:text-accent-foreground has-data-popup-open:bg-accent has-data-popup-open:text-accent-foreground",
              active && "bg-accent text-accent-foreground",
            )}
          />
        }
      >
        <button
          type="button"
          aria-label={pinned ? t("unpin") : t("pin")}
          className="flex size-4 shrink-0 items-center justify-center"
          onClick={onTogglePinned}
        >
          {pinned && !draft ? (
            <PinIcon className="size-3.5" />
          ) : (
            <>
              {draft ? (
                <CircleDashedIcon className="size-4 group-hover:hidden" />
              ) : (
                <CheckCircle2Icon className="size-4 group-hover:hidden" />
              )}
              <PinIcon className="hidden size-3.5 group-hover:block" />
            </>
          )}
        </button>
        {renaming ? (
          <input
            ref={renameInputRef}
            defaultValue={title}
            autoFocus
            aria-label={t("rename")}
            className="h-6 min-w-0 flex-1 rounded-sm bg-background px-1 text-foreground ring-1 ring-ring outline-none"
            onFocus={(event) => event.currentTarget.select()}
            onBlur={(event) => commitRename(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return;
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "Escape") {
                event.currentTarget.value = title;
                event.currentTarget.blur();
              }
            }}
          />
        ) : (
          <button
            type="button"
            className="min-w-0 flex-1 truncate text-left"
            onClick={onSelect}
            onDoubleClick={onRename ? () => setRenaming(true) : undefined}
          >
            {title}
          </button>
        )}
        <span className="shrink-0 text-xs text-muted-foreground">{formatAge(updatedAt)}</span>
        <div className="flex opacity-0 group-hover:opacity-100 has-data-popup-open:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button type="button" variant="ghost" size="icon-xs" aria-label={t("more")} />
              }
            >
              <MoreHorizontalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" finalFocus={menuFinalFocus}>
              {menuItems}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent finalFocus={menuFinalFocus}>{menuItems}</ContextMenuContent>
    </ContextMenu>
  );
}

function formatAge(timestamp: number) {
  const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}
