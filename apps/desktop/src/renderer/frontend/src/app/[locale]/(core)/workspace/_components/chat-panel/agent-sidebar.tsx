"use client";

import { CheckCircle2Icon, PanelRightIcon, PinIcon, SendIcon, SparklesIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatSession } from "@/lib/http/modules/agent.schema";
import { useChatSessions, useUpdateChatSession } from "@/servers/agent.server";
import { useSession } from "@/servers/auth.server";
import { useWorkspaceStore } from "@/stores";

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
  const session = useSession();
  const user = session.data?.user;
  const displayName = user?.name || user?.email || t("anonymous");
  const [query, setQuery] = useState("");
  const activeSessionId = useWorkspaceStore((state) =>
    novelId ? state.sessionIds[novelId] : undefined,
  );
  const agentDrafts = useWorkspaceStore((state) => state.agentDrafts);
  const setAgentDraftPinned = useWorkspaceStore((state) => state.setAgentDraftPinned);
  const selectSession = useWorkspaceStore((state) => state.selectSession);
  const drafts = useMemo(
    () =>
      Object.values(agentDrafts)
        .filter((draft) => draft.novelId === novelId && draft.text.trim())
        .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt),
    [agentDrafts, novelId],
  );
  const visibleSessions = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const matched = keyword
      ? (sessions.data ?? []).filter((session) =>
          (session.title || t("untitled")).toLowerCase().includes(keyword),
        )
      : (sessions.data ?? []);
    return [...matched].sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) || Date.parse(b.updated_at) - Date.parse(a.updated_at),
    );
  }, [query, sessions.data, t]);

  const openSession = (sessionId: string) => {
    if (!novelId) return;
    selectSession(novelId, sessionId);
  };

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
          <DraftGroup
            drafts={drafts}
            onSelect={onOpenDraft}
            onTogglePinned={(id, pinned) => setAgentDraftPinned(id, pinned)}
          />
          <SessionGroup
            title={t("today")}
            sessions={visibleSessions}
            activeSessionId={activeSessionId}
            onSelect={openSession}
            onTogglePinned={(session) =>
              updateSession.mutate({ id: session.id, payload: { pinned: !session.pinned } })
            }
          />
          <SessionGroup
            title={t("older")}
            sessions={[]}
            activeSessionId={activeSessionId}
            onSelect={openSession}
            onTogglePinned={(session) =>
              updateSession.mutate({ id: session.id, payload: { pinned: !session.pinned } })
            }
          />
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

function DraftGroup({
  drafts,
  onSelect,
  onTogglePinned,
}: {
  drafts: Array<{ id: string; text: string; pinned?: boolean }>;
  onSelect: (id: string) => void;
  onTogglePinned: (id: string, pinned: boolean) => void;
}) {
  const t = useTranslations("agentSidebar");
  if (!drafts.length) return null;

  return (
    <section>
      <h3 className="mb-2 px-2 text-xs font-medium text-muted-foreground">{t("drafts")}</h3>
      <div className="space-y-1">
        {drafts.map((draft) => (
          <div key={draft.id} className="group flex items-start rounded-md pr-1 hover:bg-accent">
            <button
              type="button"
              className="flex min-w-0 flex-1 items-start gap-2 px-2 py-1.5 text-left text-sm text-muted-foreground group-hover:text-accent-foreground"
              onClick={() => onSelect(draft.id)}
            >
              <CheckCircle2Icon className="mt-0.5 size-4" />
              <span className="min-w-0 flex-1 truncate">{draft.text}</span>
            </button>
            <button
              type="button"
              className={
                draft.pinned ? "mt-1.5 text-primary" : "mt-1.5 opacity-0 group-hover:opacity-100"
              }
              onClick={() => onTogglePinned(draft.id, !draft.pinned)}
            >
              <PinIcon className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function SessionGroup({
  title,
  sessions,
  activeSessionId,
  onSelect,
  onTogglePinned,
}: {
  title: string;
  sessions: ChatSession[];
  activeSessionId?: string;
  onSelect: (sessionId: string) => void;
  onTogglePinned: (session: ChatSession) => void;
}) {
  const t = useTranslations("agentSidebar");
  if (!sessions.length) return null;

  return (
    <section>
      <h3 className="mb-2 px-2 text-xs font-medium text-muted-foreground">{title}</h3>
      <div className="space-y-1">
        {sessions.map((session) => (
          <div key={session.id} className="group flex items-start rounded-md pr-1 hover:bg-accent">
            <button
              type="button"
              className="flex min-w-0 flex-1 items-start gap-2 px-2 py-1.5 text-left text-sm text-muted-foreground group-hover:text-accent-foreground"
              onClick={() => onSelect(session.id)}
            >
              <CheckCircle2Icon
                className={
                  activeSessionId === session.id ? "mt-0.5 size-4 text-primary" : "mt-0.5 size-4"
                }
              />
              <span className="min-w-0 flex-1 truncate">{session.title || t("untitled")}</span>
            </button>
            <button
              type="button"
              className={
                session.pinned ? "mt-1.5 text-primary" : "mt-1.5 opacity-0 group-hover:opacity-100"
              }
              onClick={() => onTogglePinned(session)}
            >
              <PinIcon className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
