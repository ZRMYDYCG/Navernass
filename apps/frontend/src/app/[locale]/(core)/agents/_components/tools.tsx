"use client";

import { getToolName, isToolUIPart } from "ai";
import { diffArrays } from "diff";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
  DiffIcon,
  FileTextIcon,
  PlusIcon,
  Undo2Icon,
  WaypointsIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { articleWriteOutputSchema } from "@/lib/http/modules/agent-tool.schema";
import type { Chapter } from "@/lib/http/modules/library.schema";
import { useSessionMessages } from "@/servers/agent.server";
import {
  useChapterRevisionDiffs,
  useNovelChapters,
  useResolveChapterReview,
  useUpdateChapterContent,
} from "@/servers/library.server";
import { useWorkspaceStore } from "@/stores";

import { chapterWritingTools } from "../../workspace/_components/chat-panel/chat-panel";
import type { ChatMessage } from "../../workspace/_components/chat-panel/types";
import { ChapterEditor } from "../../workspace/_components/editor";
import { RelationshipGraphWorkspace } from "../../workspace/_components/relationship-graph/workspace";
import { ChapterOutline } from "../../workspace/_components/sidebar/views/chapter-outline";

type Tab = { kind: "changes" } | { kind: "chapters" } | { kind: "graph" } | ChapterTab;

interface ChapterTab {
  kind: "chapter";
  chapterId: string;
}

interface ChangeStats {
  added: number;
  removed: number;
}

interface ToolsProps {
  novelId: string;
  novelTitle: string;
  sessionId?: string;
  initialTool: ToolKind;
  onClose: () => void;
}

export type ToolKind = "changes" | "chapters" | "graph";

/** Agents 窗口右侧的小说工具面板：审阅当前对话的改动、浏览章节、查看人物关系，以标签页打开。 */
export function Tools({ novelId, novelTitle, sessionId, initialTool, onClose }: ToolsProps) {
  const t = useTranslations("agents.tools");
  const chapters = useNovelChapters(novelId);
  const activeChapterId = useWorkspaceStore((state) => state.chapterId);
  const selectChapter = useWorkspaceStore((state) => state.selectChapter);
  const { changes, total, loading } = useSessionChanges(sessionId);
  const [tabs, setTabs] = useState<Tab[]>([{ kind: initialTool }]);
  const [activeKey, setActiveKey] = useState<string | null>(initialTool);

  const open = (tab: Tab) => {
    const key = tabKey(tab);
    if (!tabs.some((item) => tabKey(item) === key)) setTabs([...tabs, tab]);
    setActiveKey(key);
  };

  const openChapter = (chapterId: string) => {
    selectChapter(chapterId);
    open({ kind: "chapter", chapterId });
  };

  const closeTab = (key: string) => {
    const next = tabs.filter((item) => tabKey(item) !== key);
    setTabs(next);
    if (activeKey === key) {
      const last = next.at(-1);
      setActiveKey(last ? tabKey(last) : null);
    }
  };

  const tabLabel = (tab: Tab) => {
    if (tab.kind !== "chapter") return t(tab.kind);
    return (
      chapters.data?.find((chapter) => chapter.id === tab.chapterId)?.title ?? t("untitledChapter")
    );
  };

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-l border-border bg-background",
        activeKey ? "w-2/5 min-w-96" : "w-72",
      )}
    >
      <header className="flex h-10 shrink-0 items-center gap-1 px-2">
        {tabs.length ? (
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const key = tabKey(tab);
              return (
                <div
                  key={key}
                  className={cn(
                    "group flex h-7 max-w-48 shrink-0 items-center gap-1.5 rounded-md pr-1 pl-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    key === activeKey && "bg-accent text-accent-foreground",
                  )}
                >
                  <button
                    type="button"
                    className="flex min-w-0 cursor-default items-center gap-1.5 outline-none"
                    onClick={() => setActiveKey(key)}
                  >
                    <TabIcon tab={tab} />
                    <span className="truncate">{tabLabel(tab)}</span>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={t("closeTab")}
                    onClick={() => closeTab(key)}
                  >
                    <XIcon />
                  </Button>
                </div>
              );
            })}
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={t("newTab")}
              onClick={() => setActiveKey(null)}
            >
              <PlusIcon />
            </Button>
          </div>
        ) : (
          <span className="min-w-0 flex-1 truncate px-2 text-sm text-muted-foreground">
            {t("on", { title: novelTitle })}
          </span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("close")}
          onClick={onClose}
        >
          <ChevronsRightIcon />
        </Button>
      </header>

      {activeKey === null ? (
        <div className="px-2">
          <ToolList
            title={tabs.length ? t("on", { title: novelTitle }) : undefined}
            changes={changes.length ? total : undefined}
            chapterCount={chapters.data?.length}
            onOpen={(kind) => open({ kind })}
          />
        </div>
      ) : null}

      {/* 非激活标签只隐藏不卸载，保留编辑器与关系图的状态。 */}
      {tabs.map((tab) => {
        const key = tabKey(tab);
        return (
          <div key={key} hidden={key !== activeKey} className="min-h-0 flex-1">
            {tab.kind === "changes" ? (
              <Changes
                empty={!sessionId ? t("noSession") : loading ? t("loading") : t("noChanges")}
                changes={changes}
                total={total}
                onOpenChapter={openChapter}
              />
            ) : tab.kind === "chapters" ? (
              <ScrollArea className="h-full">
                <ChapterOutline
                  novelId={novelId}
                  activeChapterId={activeChapterId}
                  onSelectChapter={openChapter}
                />
              </ScrollArea>
            ) : tab.kind === "graph" ? (
              <RelationshipGraphWorkspace novelId={novelId} />
            ) : (
              <ChapterEditor key={tab.chapterId} novelId={novelId} chapterId={tab.chapterId} />
            )}
          </div>
        );
      })}
    </aside>
  );
}

/** 工具面板收起时浮在对话区右上角的入口，点选后展开面板并打开对应工具。 */
export function ToolLauncher({
  novelId,
  novelTitle,
  sessionId,
  onOpen,
}: {
  novelId: string;
  novelTitle: string;
  sessionId?: string;
  onOpen: (kind: ToolKind) => void;
}) {
  const t = useTranslations("agents.tools");
  const chapters = useNovelChapters(novelId);
  const { changes, total } = useSessionChanges(sessionId);
  return (
    <ToolList
      title={t("on", { title: novelTitle })}
      changes={changes.length ? total : undefined}
      chapterCount={chapters.data?.length}
      onOpen={onOpen}
    />
  );
}

/** 当前对话改写过的章节及其对比，已撤销到原文的章节不再列出。 */
function useSessionChanges(sessionId: string | undefined) {
  const messages = useSessionMessages(sessionId);
  const edits = sessionEdits(messages.data ?? []);
  const changes: ChapterChange[] = useChapterRevisionDiffs(edits)
    .filter((diff) => !diff.missing)
    .map(({ chapterId, chapterTitle, baseRevision, chapter, before }) => ({
      chapterId,
      title: chapter?.title ?? chapterTitle,
      baseRevision,
      chapter,
      before,
      lines: chapter && before !== undefined ? diffLines(before, chapter.content) : undefined,
    }))
    .filter((change) => !change.lines || change.lines.some((line) => line.kind !== "same"));
  const total = sumStats(changes.map((change) => change.lines ?? []).flat());
  return { changes, total, loading: messages.isLoading };
}

function ToolList({
  title,
  changes,
  chapterCount,
  onOpen,
}: {
  title?: string;
  changes?: ChangeStats;
  chapterCount?: number;
  onOpen: (kind: ToolKind) => void;
}) {
  const t = useTranslations("agents.tools");
  return (
    <nav className="flex flex-col gap-0.5">
      {title ? (
        <p className="truncate px-2 pt-1 pb-2 text-sm text-muted-foreground">{title}</p>
      ) : null}
      <ToolItem icon={DiffIcon} label={t("changes")} onClick={() => onOpen("changes")}>
        {changes ? <Stats stats={changes} /> : null}
      </ToolItem>
      <ToolItem icon={FileTextIcon} label={t("chapters")} onClick={() => onOpen("chapters")}>
        {chapterCount === undefined ? null : (
          <span className="text-xs text-muted-foreground">{chapterCount}</span>
        )}
      </ToolItem>
      <ToolItem icon={WaypointsIcon} label={t("graph")} onClick={() => onOpen("graph")} />
    </nav>
  );
}

function ToolItem({
  icon: Icon,
  label,
  onClick,
  children,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 cursor-default items-center gap-2.5 rounded-md px-2 text-sm text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate text-foreground">{label}</span>
      {children}
    </button>
  );
}

function TabIcon({ tab }: { tab: Tab }) {
  const Icon =
    tab.kind === "changes" ? DiffIcon : tab.kind === "graph" ? WaypointsIcon : FileTextIcon;
  return <Icon className="size-3.5 shrink-0" />;
}

function Stats({ stats }: { stats: ChangeStats }) {
  return (
    <span className="flex shrink-0 gap-1.5 text-xs tabular-nums">
      <span className="text-primary">+{stats.added}</span>
      <span className="text-destructive">-{stats.removed}</span>
    </span>
  );
}

interface ChapterChange {
  chapterId: string;
  title: string;
  /** 本对话第一次改写该章前的版本。 */
  baseRevision: number;
  chapter?: Chapter;
  before?: string;
  lines?: DiffLine[];
}

/** 当前对话改写过的章节，按章节堆叠展示「对话前原文 → 当前正文」的段落级对比。 */
function Changes({
  empty,
  changes,
  total,
  onOpenChapter,
}: {
  empty: string;
  changes: ChapterChange[];
  total: ChangeStats;
  onOpenChapter: (chapterId: string) => void;
}) {
  const t = useTranslations("agents.tools");
  if (!changes.length) {
    return <p className="px-4 py-6 text-center text-sm text-muted-foreground">{empty}</p>;
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-4 text-sm text-muted-foreground">
        <span>{t("sessionChapters", { count: changes.length })}</span>
        <Stats stats={total} />
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col">
          {changes.map((change) => (
            <ChapterChangeBlock
              key={change.chapterId}
              change={change}
              onOpen={() => onOpenChapter(change.chapterId)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function ChapterChangeBlock({ change, onOpen }: { change: ChapterChange; onOpen: () => void }) {
  const t = useTranslations("agents.tools");
  const { chapterId, title, baseRevision, chapter, before, lines } = change;
  const [expanded, setExpanded] = useState(true);
  const resolveReview = useResolveChapterReview(chapterId);
  const updateContent = useUpdateChapterContent(chapterId);
  const busy = resolveReview.isPending || updateContent.isPending;
  const reviewBase = chapter?.review_base_revision ?? null;

  const undo = async () => {
    if (before === undefined) return;
    await updateContent.mutateAsync(before);
    // 审阅起点早于本对话时，更早的待审阅改动仍保留在正文里，不能顺带清掉审阅标记。
    if (reviewBase !== null && reviewBase >= baseRevision) resolveReview.mutate();
  };

  return (
    <section className="border-b border-border">
      <header className="sticky top-0 z-10 flex h-9 items-center gap-2 bg-background px-2 text-sm">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-expanded={expanded}
          aria-label={expanded ? t("collapse") : t("expand")}
          onClick={() => setExpanded((value) => !value)}
        >
          <ChevronDownIcon className={cn("transition-transform", !expanded && "-rotate-90")} />
        </Button>
        <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 truncate">{title || t("untitledChapter")}</span>
        {lines ? <Stats stats={sumStats(lines)} /> : null}
        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          {chapter && reviewBase === null ? (
            <span className="px-1.5 text-xs text-muted-foreground">{t("reviewed")}</span>
          ) : null}
          <Button type="button" variant="ghost" size="xs" onClick={onOpen}>
            {reviewBase === null ? t("openChapter") : t("review")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            title={t("undo")}
            aria-label={t("undo")}
            disabled={busy || before === undefined}
            onClick={() => void undo()}
          >
            <Undo2Icon />
          </Button>
          {reviewBase === null ? null : (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              title={t("acceptAll")}
              aria-label={t("acceptAll")}
              disabled={busy}
              onClick={() => resolveReview.mutate()}
            >
              <CheckIcon />
            </Button>
          )}
        </div>
      </header>
      {expanded ? (
        lines ? (
          <DiffBody lines={lines} />
        ) : (
          <p className="px-4 pb-3 text-xs text-muted-foreground">{t("loading")}</p>
        )
      ) : null}
    </section>
  );
}

/** 未修改段落折叠时，改动前后各保留的上下文段落数。 */
const CONTEXT_LINES = 2;

function DiffBody({ lines }: { lines: DiffLine[] }) {
  const t = useTranslations("agents.tools");
  const [unfolded, setUnfolded] = useState<Set<number>>(() => new Set());
  const blocks = foldUnchanged(lines);

  return (
    <div className="pb-2 text-sm leading-6">
      {blocks.map((block, index) =>
        block.folded && !unfolded.has(index) ? (
          <button
            key={index}
            type="button"
            onClick={() => setUnfolded(new Set(unfolded).add(index))}
            className="flex h-7 w-full cursor-default items-center gap-2 bg-muted/50 px-4 text-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground"
          >
            <ChevronsUpDownIcon className="size-3.5" />
            {t("unchanged", { count: block.lines.length })}
          </button>
        ) : (
          block.lines.map((line, lineIndex) => (
            <div
              key={`${index}:${lineIndex}`}
              className={cn(
                "flex gap-3 px-4 py-0.5",
                line.kind === "added" && "bg-primary/10",
                line.kind === "removed" && "bg-destructive/10 text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "w-3 shrink-0 text-muted-foreground select-none",
                  line.kind === "added" && "text-primary",
                  line.kind === "removed" && "text-destructive",
                )}
              >
                {line.kind === "added" ? "+" : line.kind === "removed" ? "-" : ""}
              </span>
              <p className="min-w-0 flex-1 whitespace-pre-wrap">{line.text}</p>
            </div>
          ))
        ),
      )}
    </div>
  );
}

/** 从对话消息里的正文写入工具结果，汇总每章在本对话中第一次被改写前的版本，按首次改写顺序排列。 */
function sessionEdits(messages: ChatMessage[]) {
  const edits = new Map<
    string,
    { chapterId: string; chapterTitle: string; baseRevision: number }
  >();
  for (const message of messages) {
    for (const part of message.parts) {
      if (!isToolUIPart(part) || part.state !== "output-available") continue;
      if (!chapterWritingTools.has(getToolName(part))) continue;
      const output = articleWriteOutputSchema.safeParse(part.output);
      if (!output.success) continue;
      const { chapterId, chapterTitle, baseRevision } = output.data;
      const existing = edits.get(chapterId);
      edits.set(chapterId, {
        chapterId,
        chapterTitle,
        baseRevision: Math.min(baseRevision, existing?.baseRevision ?? baseRevision),
      });
    }
  }
  return [...edits.values()];
}

function tabKey(tab: Tab) {
  return tab.kind === "chapter" ? `chapter:${tab.chapterId}` : tab.kind;
}

interface DiffLine {
  kind: "same" | "added" | "removed";
  text: string;
}

/** 段落级对比：忽略空行，与修订视图的审阅粒度一致。 */
function diffLines(before: string, after: string): DiffLine[] {
  const paragraphs = (text: string) => text.split("\n").filter((line) => line.trim());
  return diffArrays(paragraphs(before), paragraphs(after)).flatMap((change) =>
    change.value.map((text) => ({
      kind: change.added ? "added" : change.removed ? "removed" : "same",
      text,
    })),
  );
}

function sumStats(lines: DiffLine[]): ChangeStats {
  return {
    added: lines.filter((line) => line.kind === "added").length,
    removed: lines.filter((line) => line.kind === "removed").length,
  };
}

/** 把长段未修改内容折叠，只在改动前后保留少量上下文。 */
function foldUnchanged(lines: DiffLine[]) {
  const blocks: { folded: boolean; lines: DiffLine[] }[] = [];
  let start = 0;
  while (start < lines.length) {
    const same = lines[start].kind === "same";
    let end = start;
    while (end < lines.length && (lines[end].kind === "same") === same) end++;
    const run = lines.slice(start, end);
    const head = start === 0 ? 0 : CONTEXT_LINES;
    const tail = end === lines.length ? 0 : CONTEXT_LINES;
    if (same && run.length > head + tail + 1) {
      if (head) blocks.push({ folded: false, lines: run.slice(0, head) });
      blocks.push({ folded: true, lines: run.slice(head, run.length - tail) });
      if (tail) blocks.push({ folded: false, lines: run.slice(run.length - tail) });
    } else {
      blocks.push({ folded: false, lines: run });
    }
    start = end;
  }
  return blocks;
}
