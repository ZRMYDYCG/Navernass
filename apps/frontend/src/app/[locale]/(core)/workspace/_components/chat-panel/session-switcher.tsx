"use client";

import {
  CircleCheckIcon,
  HistoryIcon,
  LoaderCircleIcon,
  MessageSquareIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatSession } from "@/schemas/agent.schema";

interface SessionSwitcherProps {
  sessions: ChatSession[];
  activeSessionId?: string;
  disabled: boolean;
  loading: boolean;
  onSelect: (sessionId: string) => void;
  onNew: () => void;
  onDelete: (sessionId: string) => void;
}

type SessionGroupKey = "today" | "yesterday" | "older";

interface SessionGroup {
  key: SessionGroupKey;
  sessions: ChatSession[];
}

const GROUP_KEYS: SessionGroupKey[] = ["today", "yesterday", "older"];

/** 按 updated_at 把会话分到 今天 / 昨天 / 更早。 */
function groupSessionsByTime(sessions: ChatSession[], now: Date): SessionGroup[] {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = startOfToday.getTime() - 86_400_000;

  const buckets: Record<SessionGroupKey, ChatSession[]> = {
    today: [],
    yesterday: [],
    older: [],
  };
  for (const session of sessions) {
    const updatedAt = new Date(session.updated_at).getTime();
    if (updatedAt >= startOfToday.getTime()) buckets.today.push(session);
    else if (updatedAt >= startOfYesterday) buckets.yesterday.push(session);
    else buckets.older.push(session);
  }
  return GROUP_KEYS.map((key) => ({ key, sessions: buckets[key] })).filter(
    (group) => group.sessions.length > 0,
  );
}

export function SessionSwitcher({
  sessions,
  activeSessionId,
  disabled,
  loading,
  onSelect,
  onNew,
  onDelete,
}: SessionSwitcherProps) {
  const t = useTranslations("chat.sessions");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const activeSession = sessions.find((session) => session.id === activeSessionId);

  const closeHistory = () => setHistoryOpen(false);

  const groups = useMemo(() => {
    const text = keyword.trim().toLowerCase();
    const matched = text
      ? sessions.filter(
          (session) =>
            (session.title ?? "").toLowerCase().includes(text) ||
            (session.lastMessage?.content ?? "").toLowerCase().includes(text),
        )
      : sessions;
    return groupSessionsByTime(matched, new Date());
  }, [keyword, sessions]);

  return (
    <header className="flex h-12 shrink-0 items-center gap-1 border-b px-3">
      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium">
        <MessageSquareIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{activeSession?.title || t("newConversation")}</span>
      </div>

      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        disabled={disabled}
        aria-label={t("new")}
        onClick={() => {
          onNew();
          closeHistory();
        }}
      >
        <PlusIcon />
      </Button>

      <Popover open={historyOpen} onOpenChange={setHistoryOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              disabled={disabled}
              aria-label={t("history")}
            />
          }
        >
          <HistoryIcon />
        </PopoverTrigger>
        <PopoverContent align="end" className="max-h-100 w-80 gap-0 rounded-xl p-1">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={t("search")}
            autoComplete="off"
            className="w-full shrink-0 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground/70"
          />
          {/* 弹层只有 max-height，视口的 height:100% 无法解析；让 Root 也成为 flex 列，视口作为 flex 子项被压缩后才能滚动。 */}
          <ScrollArea className="flex min-h-0 flex-1 flex-col">
            <div>
              {groups.map((group, index) => (
                <div
                  key={group.key}
                  role="group"
                  aria-label={t(group.key)}
                  className={index > 0 ? "mt-1 border-t pt-1" : undefined}
                >
                  <p className="px-2 pt-1 pb-1 text-xs text-muted-foreground">{t(group.key)}</p>
                  {group.sessions.map((session) => (
                    <SessionRow
                      key={session.id}
                      session={session}
                      active={session.id === activeSessionId}
                      labels={{
                        untitled: t("untitled"),
                        delete: t("delete"),
                      }}
                      onSelect={() => {
                        onSelect(session.id);
                        closeHistory();
                      }}
                      onDelete={() => onDelete(session.id)}
                    />
                  ))}
                </div>
              ))}
              {!loading && sessions.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t("empty")}</p>
              ) : null}
              {!loading && sessions.length > 0 && groups.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  {t("noMatch")}
                </p>
              ) : null}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </header>
  );
}

interface SessionRowProps {
  session: ChatSession;
  active: boolean;
  labels: { untitled: string; delete: string };
  onSelect: () => void;
  onDelete: () => void;
}

function SessionRow({ session, active, labels, onSelect, onDelete }: SessionRowProps) {
  const running = Boolean(session.activeRun);

  return (
    <div
      className={`group flex items-center rounded-md pr-1 ${active ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"}`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-start outline-none"
      >
        {running ? (
          <LoaderCircleIcon className="size-4 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <CircleCheckIcon className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className="min-w-0 flex-1 truncate text-sm">{session.title || labels.untitled}</span>
      </button>
      <div className="flex opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          className="text-muted-foreground hover:bg-transparent hover:text-foreground"
          aria-label={labels.delete}
          onClick={onDelete}
        >
          <Trash2Icon />
        </Button>
      </div>
    </div>
  );
}
