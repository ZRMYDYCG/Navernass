"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  BookIcon,
  BookOpenIcon,
  ChevronDownIcon,
  LoaderCircleIcon,
  MoreHorizontalIcon,
  PanelLeftIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
  SquarePenIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { cn } from "cn";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "@/i18n/navigation";
import type { ChatSession } from "@/lib/http/modules/agent.schema";
import type { Novel as NovelData } from "@/lib/http/modules/library.schema";
import {
  agentKeys,
  useChatSessions,
  useChatSessionsByNovels,
  useDeleteChatSession,
} from "@/servers/agent.server";
import { useSession } from "@/servers/auth.server";
import { useNovelChapters, useNovels } from "@/servers/library.server";
import { useWorkspaceStore } from "@/stores";

import { ChatPanel } from "../../workspace/_components/chat-panel/chat-panel";
import {
  SettingsContent,
  settingsSectionGroups,
  type SettingsSectionId,
} from "../../workspace/_components/settings";
import { Customize, type SkillEditorState } from "../../workspace/_components/settings/customize";
import { SkillEditor } from "../../workspace/_components/settings/skill-editor";

/** 每部小说默认展示的最近对话数，其余收进 More。 */
const RECENT_CHAT_LIMIT = 5;

/** Agents 窗口：以对话为中心的小说模式，左侧按小说分组切换对话，与工作台共享当前小说与会话。 */
export function Agents({ sidebarFooter }: { sidebarFooter?: ReactNode }) {
  const t = useTranslations("agents");
  const router = useRouter();
  const novels = useNovels();
  const storedNovelId = useWorkspaceStore((state) => state.novelId);
  const chapterId = useWorkspaceStore((state) => state.chapterId);
  const sessionIds = useWorkspaceStore((state) => state.sessionIds);
  const [hydrated, setHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  // 非空时进入设置模式：侧栏换成设置导航，主区域显示该分区内容。
  const [settingsSection, setSettingsSection] = useState<SettingsSectionId | null>(null);
  const [skillEditor, setSkillEditor] = useState<SkillEditorState | null>(null);
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
    setCustomizeOpen(false);
    setSkillEditor(null);
    setChatKey((key) => key + 1);
  };

  const openCustomize = () => {
    setSkillEditor(null);
    setCustomizeOpen(true);
  };

  const toggleSettings = () => {
    setSettingsSection((current) => (current ? null : "general"));
  };

  return (
    <div className="flex h-dvh min-h-0 bg-card">
      {sidebarOpen ? (
        <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-background">
          {settingsSection ? (
            <SettingsNav
              activeId={settingsSection}
              onSelect={setSettingsSection}
              onBack={toggleSettings}
            />
          ) : (
            <>
              <div className="flex h-10 shrink-0 items-center px-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("hideSidebar")}
                  onClick={() => setSidebarOpen(false)}
                >
                  <PanelLeftIcon />
                </Button>
              </div>
              <nav className="flex flex-col gap-0.5 px-2">
                <NavItem
                  icon={SquarePenIcon}
                  label={t("newChat")}
                  active={!sessionId && !customizeOpen}
                  disabled={!novelId}
                  onClick={() => novelId && openChat(novelId)}
                />
                <NavItem
                  icon={SearchIcon}
                  label={t("search")}
                  onClick={() => setSearchOpen(true)}
                />
                <NavItem
                  icon={SparklesIcon}
                  label={t("customize")}
                  active={customizeOpen}
                  onClick={openCustomize}
                />
              </nav>
              <p className="px-4 pt-5 pb-1 text-xs text-muted-foreground">{t("novels")}</p>
              <ScrollArea className="min-h-0 flex-1">
                <div className="flex flex-col gap-0.5 px-2 pb-2">
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
            </>
          )}
          {sidebarFooter ?? (
            <Account settingsActive={Boolean(settingsSection)} onOpenSettings={toggleSettings} />
          )}
        </aside>
      ) : null}

      {settingsSection ? (
        <main className="flex min-w-0 flex-1 flex-col">
          <ScrollArea className="min-h-0 flex-1">
            <div className="mx-auto w-full max-w-2xl px-6 py-10">
              <SettingsContent sectionId={settingsSection} />
            </div>
          </ScrollArea>
        </main>
      ) : null}

      {/* 设置与 Customize 视图下只隐藏不卸载，避免中断进行中的对话流。 */}
      <main className={cn("flex min-w-0 flex-1 flex-col", settingsSection && "hidden")}>
        <header className="flex h-10 shrink-0 items-center gap-1 px-2">
          {sidebarOpen ? null : (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("showSidebar")}
              onClick={() => setSidebarOpen(true)}
            >
              <PanelLeftIcon />
            </Button>
          )}
          <span className="min-w-0 flex-1 truncate px-2 text-sm text-muted-foreground">
            {activeSession && !customizeOpen ? activeSession.title || t("untitled") : null}
          </span>
          <Button type="button" variant="ghost" size="xs" onClick={() => router.push("/workspace")}>
            {t("editor")}
            <ArrowUpRightIcon />
          </Button>
        </header>
        {customizeOpen ? (
          skillEditor ? (
            <SkillEditor
              key={skillEditor.id ?? "new-skill"}
              state={skillEditor}
              onChange={setSkillEditor}
              onBack={() => setSkillEditor(null)}
              onClose={() => setSkillEditor(null)}
            />
          ) : (
            <ScrollArea className="min-h-0 flex-1">
              <div className="mx-auto w-full max-w-2xl px-6 pt-4 pb-10">
                <Customize onOpenSkillEditor={setSkillEditor} />
              </div>
            </ScrollArea>
          )
        ) : null}
        <div
          className={cn(
            "mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col",
            customizeOpen && "hidden",
          )}
        >
          {hydrated && novels.isSuccess ? (
            <ChatPanel
              key={`${novelId ?? "none"}:${chatKey}`}
              novelId={novelId}
              chapterId={chapterId}
              sessionSwitcher={false}
              welcomeHeader={
                <ContextPicker
                  novels={novels.data}
                  novelId={novelId}
                  chapterId={chapterId}
                  onSelectNovel={(targetNovelId) => openChat(targetNovelId)}
                />
              }
            />
          ) : null}
        </div>
      </main>

      <ChatSearch
        open={searchOpen}
        novels={novels.data ?? []}
        onOpenChange={setSearchOpen}
        onSelect={(targetNovelId, targetSessionId) => {
          setSearchOpen(false);
          openChat(targetNovelId, targetSessionId);
        }}
      />
    </div>
  );
}

interface NavItemProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function NavItem({ icon: Icon, label, active = false, disabled, onClick }: NavItemProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-7 cursor-default items-center gap-2 rounded-md px-2 text-sm text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        active && "bg-accent text-accent-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

interface SettingsNavProps {
  activeId: SettingsSectionId;
  onSelect: (id: SettingsSectionId) => void;
  onBack: () => void;
}

/** 设置模式下替换侧栏的导航：返回、按名称过滤分区、分组列出分区。 */
function SettingsNav({ activeId, onSelect, onBack }: SettingsNavProps) {
  const t = useTranslations("agents");
  const tSettings = useTranslations("settings");
  const [query, setQuery] = useState("");
  const keyword = query.trim().toLowerCase();
  // Customize 在 Agents 侧栏有独立入口，不在设置里重复出现。
  const groups = settingsSectionGroups
    .map((group) =>
      group.filter(
        (section) =>
          section.id !== "customize" &&
          tSettings(`sections.${section.id}`).toLowerCase().includes(keyword),
      ),
    )
    .filter((group) => group.length > 0);

  return (
    <>
      <div className="flex shrink-0 flex-col gap-2 px-2 pt-2 pb-3">
        <NavItem icon={ArrowLeftIcon} label={t("back")} onClick={onBack} />
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchSettings")}
            aria-label={t("searchSettings")}
          />
        </InputGroup>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <nav aria-label={tSettings("title")} className="flex flex-col gap-4 px-2 pb-2">
          {groups.map((group) => (
            <div key={group[0].id} className="flex flex-col gap-0.5">
              {group.map((section) => (
                <NavItem
                  key={section.id}
                  icon={section.icon}
                  label={tSettings(`sections.${section.id}`)}
                  active={section.id === activeId}
                  onClick={() => onSelect(section.id)}
                />
              ))}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </>
  );
}

interface NovelProps {
  novelId: string;
  title: string;
  current: boolean;
  activeSessionId?: string;
  onOpenChat: (sessionId?: string) => void;
}

/** 侧栏里的一部小说：可展开查看其下的最近对话。 */
function Novel({ novelId, title, current, activeSessionId, onOpenChat }: NovelProps) {
  const t = useTranslations("agents");
  const [expanded, setExpanded] = useState(current);
  const Icon = expanded ? BookOpenIcon : BookIcon;

  return (
    <div>
      <div className="group flex h-7 items-center rounded-md pr-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className="flex h-full min-w-0 flex-1 cursor-default items-center gap-2 rounded-md px-2 text-start text-sm outline-none"
        >
          <Icon className="size-4 shrink-0" />
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
  const [showAll, setShowAll] = useState(false);

  const remove = (session: ChatSession) => {
    deleteSession.mutate(session.id, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: agentKeys.sessions(novelId), exact: true });
        onDeleted(session.id);
      },
    });
  };

  if (sessions.isSuccess && sessions.data.length === 0) {
    return <p className="py-1 pl-8 text-xs text-muted-foreground">{t("noChats")}</p>;
  }

  const all = sessions.data ?? [];
  const visible = showAll ? all : all.slice(0, RECENT_CHAT_LIMIT);

  return (
    <div className="flex flex-col gap-0.5">
      {visible.map((session) => (
        <div
          key={session.id}
          className={cn(
            "group flex h-7 items-center gap-2 rounded-md pr-1 pl-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground has-data-popup-open:bg-accent",
            session.id === activeSessionId && "bg-accent text-accent-foreground",
          )}
        >
          <span className="flex size-4 shrink-0 items-center justify-center">
            {session.activeRun ? <LoaderCircleIcon className="size-3 animate-spin" /> : null}
          </span>
          <button
            type="button"
            onClick={() => onSelect(session.id)}
            className="h-full min-w-0 flex-1 cursor-default truncate text-start outline-none"
          >
            {session.title || t("untitled")}
          </button>
          <span className="shrink-0 text-xs text-muted-foreground group-hover:hidden group-has-data-popup-open:hidden">
            {formatAge(Date.parse(session.updated_at))}
          </span>
          <div className="hidden group-hover:flex group-has-data-popup-open:flex">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={t("moreActions")}
                  />
                }
              >
                <MoreHorizontalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={deleteSession.isPending}
                  onClick={() => remove(session)}
                >
                  {t("deleteChat")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
      {!showAll && all.length > RECENT_CHAT_LIMIT ? (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="flex h-7 cursor-default items-center rounded-md pl-8 text-start text-sm text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground"
        >
          {t("more")}
        </button>
      ) : null}
    </div>
  );
}

interface ContextPickerProps {
  novels: NovelData[];
  novelId?: string;
  chapterId?: string;
  onSelectNovel: (novelId: string) => void;
}

/** 新对话输入框上方的上下文选择：小说与章节。 */
function ContextPicker({ novels, novelId, chapterId, onSelectNovel }: ContextPickerProps) {
  const t = useTranslations("agents");
  const chapters = useNovelChapters(novelId);
  const selectChapter = useWorkspaceStore((state) => state.selectChapter);
  const novel = novels.find((item) => item.id === novelId);
  const chapter = chapters.data?.find((item) => item.id === chapterId);

  return (
    <div className="flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="xs" />}>
          <BookIcon />
          <span className="max-w-40 truncate">{novel?.title ?? t("noNovel")}</span>
          <ChevronDownIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {novels.map((item) => (
            <DropdownMenuItem key={item.id} onClick={() => onSelectNovel(item.id)}>
              {item.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button type="button" variant="ghost" size="xs" disabled={!novelId} />}
        >
          <span className="max-w-40 truncate">{chapter?.title ?? t("noChapter")}</span>
          <ChevronDownIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-80">
          <DropdownMenuItem onClick={() => selectChapter(undefined)}>
            {t("noChapter")}
          </DropdownMenuItem>
          {chapters.data?.length ? <DropdownMenuSeparator /> : null}
          {chapters.data?.map((item) => (
            <DropdownMenuItem key={item.id} onClick={() => selectChapter(item.id)}>
              {item.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface ChatSearchProps {
  open: boolean;
  novels: NovelData[];
  onOpenChange: (open: boolean) => void;
  onSelect: (novelId: string, sessionId: string) => void;
}

/** 跨小说按标题搜索对话。 */
function ChatSearch({ open, novels, onOpenChange, onSelect }: ChatSearchProps) {
  const t = useTranslations("agents");
  const results = useChatSessionsByNovels(
    novels.map((novel) => novel.id),
    open,
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("search")}
      description={t("searchPlaceholder")}
    >
      <Command>
        <CommandInput placeholder={t("searchPlaceholder")} />
        <CommandList>
          <CommandEmpty>{t("noResults")}</CommandEmpty>
          {novels.map((novel, index) => {
            const sessions = results[index]?.data ?? [];
            if (!sessions.length) return null;
            return (
              <CommandGroup key={novel.id} heading={novel.title}>
                {sessions.map((session) => (
                  <CommandItem
                    key={session.id}
                    value={`${session.title || t("untitled")} ${session.id}`}
                    onSelect={() => onSelect(novel.id, session.id)}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {session.title || t("untitled")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatAge(Date.parse(session.updated_at))}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

function Account({
  settingsActive,
  onOpenSettings,
}: {
  settingsActive: boolean;
  onOpenSettings: () => void;
}) {
  const t = useTranslations("agents");
  const session = useSession();
  const user = session.data?.user;
  const displayName = user?.name || user?.email || t("anonymous");

  return (
    <footer className="flex shrink-0 items-center gap-2 px-3 py-2">
      <Avatar size="sm">
        {user?.image ? <AvatarImage src={user.image} alt={displayName} /> : null}
        <AvatarFallback>{displayName.slice(0, 1).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1 truncate text-sm">{displayName}</span>
      <Button
        type="button"
        variant={settingsActive ? "secondary" : "ghost"}
        size="icon-sm"
        aria-label={t("settings")}
        onClick={onOpenSettings}
      >
        <SettingsIcon />
      </Button>
    </footer>
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
