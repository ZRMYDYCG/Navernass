"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRightIcon,
  BookIcon,
  ChevronRightIcon,
  LoaderCircleIcon,
  PlusIcon,
  SquarePenIcon,
  Trash2Icon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "@/i18n/navigation";
import type { ChatSession } from "@/lib/http/modules/agent.schema";
import { agentKeys, useChatSessions, useDeleteChatSession } from "@/servers/agent.server";
import { useNovels } from "@/servers/library.server";
import { useWorkspaceStore } from "@/stores";

import { ChatPanel } from "../../workspace/_components/chat-panel/chat-panel";

/** Agents 窗口：以对话为中心的小说模式，左侧按小说分组切换对话，与工作台共享当前小说与会话。 */
export function Agents({
  sidebarFooter,
  guest = false,
}: {
  sidebarFooter?: ReactNode;
  guest?: boolean;
}) {
  const t = useTranslations("agents");
  const router = useRouter();
  const novels = useNovels(!guest);
  const storedNovelId = useWorkspaceStore((state) => state.novelId);
  const chapterId = useWorkspaceStore((state) => state.chapterId);
  const sessionIds = useWorkspaceStore((state) => state.sessionIds);
  const [hydrated, setHydrated] = useState(false);
  // ChatPanel 只在挂载时读取会话；侧栏切换对话时换 key 让它重建，流式中新建的会话不会触发重建。
  const [chatKey, setChatKey] = useState(0);

  useEffect(() => {
    void Promise.resolve(useWorkspaceStore.persist.rehydrate()).then(() => setHydrated(true));
  }, []);

  const novelId = novels.data?.some((novel) => novel.id === storedNovelId)
    ? storedNovelId
    : novels.data?.[0]?.id;
  const sessionId = novelId ? sessionIds[novelId] : undefined;
  const sessions = useChatSessions(novelId);
  const activeSession = sessions.data?.find((session) => session.id === sessionId);

  const openChat = (targetNovelId: string, targetSessionId?: string) => {
    const store = useWorkspaceStore.getState();
    if (targetNovelId !== storedNovelId) store.selectNovel(targetNovelId);
    store.selectSession(targetNovelId, targetSessionId);
    setChatKey((key) => key + 1);
  };

  return (
    <div className="flex h-dvh min-h-0 bg-card">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-background">
        <div className="p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!novelId}
            onClick={() => novelId && openChat(novelId)}
          >
            <SquarePenIcon />
            {t("newChat")}
          </Button>
        </div>
        <p className="px-4 pt-2 pb-1 text-xs text-muted-foreground">{t("novels")}</p>
        <ScrollArea className="min-h-0 flex-1">
          <div className="px-2 pb-2">
            {(hydrated ? novels.data : undefined)?.map((novel) => (
              <Novel
                key={novel.id}
                novelId={novel.id}
                title={novel.title}
                current={novel.id === novelId}
                activeSessionId={novel.id === novelId ? sessionId : undefined}
                onOpenChat={(targetSessionId) => openChat(novel.id, targetSessionId)}
              />
            ))}
          </div>
        </ScrollArea>
        {sidebarFooter}
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-4">
          <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
            {activeSession?.title || t("newChat")}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={guest}
            onClick={() => router.push("/workspace")}
          >
            {t("editor")}
            <ArrowUpRightIcon />
          </Button>
        </header>
        <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
          {hydrated && (guest || novels.isSuccess) ? (
            <ChatPanel
              key={`${novelId ?? "none"}:${chatKey}`}
              novelId={novelId}
              chapterId={chapterId}
              sessionSwitcher={false}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}

interface NovelProps {
  novelId: string;
  title: string;
  current: boolean;
  activeSessionId?: string;
  onOpenChat: (sessionId?: string) => void;
}

/** 侧栏里的一部小说：可展开查看其下的对话。 */
function Novel({ novelId, title, current, activeSessionId, onOpenChat }: NovelProps) {
  const t = useTranslations("agents");
  const [expanded, setExpanded] = useState(current);

  return (
    <div>
      <div className="group flex items-center rounded-md pr-1 hover:bg-accent/60">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className="flex min-w-0 flex-1 cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm outline-none"
        >
          <ChevronRightIcon
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-90",
            )}
          />
          <BookIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{title}</span>
        </button>
        <div className="flex opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            title={t("newChatIn", { title })}
            aria-label={t("newChatIn", { title })}
            onClick={() => onOpenChat()}
          >
            <PlusIcon />
          </Button>
        </div>
      </div>
      {expanded ? (
        <Sessions
          novelId={novelId}
          activeSessionId={activeSessionId}
          onSelect={onOpenChat}
          onDeleted={(sessionId) => {
            if (sessionId === activeSessionId) onOpenChat();
          }}
        />
      ) : null}
    </div>
  );
}

interface SessionsProps {
  novelId: string;
  activeSessionId?: string;
  onSelect: (sessionId: string) => void;
  onDeleted: (sessionId: string) => void;
}

function Sessions({ novelId, activeSessionId, onSelect, onDeleted }: SessionsProps) {
  const t = useTranslations("agents");
  const queryClient = useQueryClient();
  const sessions = useChatSessions(novelId);
  const deleteSession = useDeleteChatSession();

  const remove = (session: ChatSession) => {
    deleteSession.mutate(session.id, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: agentKeys.sessions(novelId), exact: true });
        onDeleted(session.id);
      },
    });
  };

  if (sessions.isSuccess && sessions.data.length === 0) {
    return <p className="py-1.5 pl-9 text-xs text-muted-foreground">{t("noChats")}</p>;
  }

  return (
    <div className="pl-5">
      {sessions.data?.map((session) => (
        <div
          key={session.id}
          className={cn(
            "group flex items-center rounded-md pr-1",
            session.id === activeSessionId
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent/60",
          )}
        >
          <button
            type="button"
            onClick={() => onSelect(session.id)}
            className="flex min-w-0 flex-1 cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm outline-none"
          >
            {session.activeRun ? (
              <LoaderCircleIcon className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
            ) : null}
            <span className="truncate">{session.title || t("untitled")}</span>
          </button>
          <div className="flex opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={t("deleteChat")}
              disabled={deleteSession.isPending}
              onClick={() => remove(session)}
            >
              <Trash2Icon />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
