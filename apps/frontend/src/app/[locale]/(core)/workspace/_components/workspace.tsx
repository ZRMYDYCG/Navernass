"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { PanelImperativeHandle } from "react-resizable-panels";
import { useTranslations } from "next-intl";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { NovelGraphWorkspace } from "@/app/[locale]/(core)/workspace/_components/novel-graph/novel-graph-workspace";
import { useCreateStarterWorkspace, useNovelChapters, useNovels } from "@/servers/library.server";

import { AppHeader } from "./app-header";
import { ChapterEditor, EmptyChapterEditor } from "./chapter-editor/chapter-editor";
import { ChatPanel } from "./chat-panel/chat-panel";
import { EditorTabs, type EditorTab } from "./editor-tabs";
import type { SidebarView } from "./novel-sidebar/activity-bar";
import { NovelSidebar } from "./novel-sidebar/novel-sidebar";
import { SettingsView } from "./settings/settings-view";

interface WorkspaceProps {
  novelId?: string;
  chapterId?: string;
  sessionId?: string;
}

interface WorkspaceSelection {
  novelId?: string;
  chapterId?: string;
  /** 只保存由页面参数传入的初始会话；后续会话状态由 ChatPanel 自己管理。 */
  initialSessionId?: string;
}

function replaceWorkspaceParams(params: Record<string, string | undefined>) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function usePanelToggle() {
  const panelRef = useRef<PanelImperativeHandle>(null);
  const [collapsed, setCollapsed] = useState(false);

  const toggle = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) {
      panel.expand();
      setCollapsed(false);
    } else {
      panel.collapse();
      setCollapsed(true);
    }
  }, []);

  return { panelRef, collapsed, toggle };
}

export function Workspace({ novelId, chapterId: initialChapterId, sessionId }: WorkspaceProps) {
  const t = useTranslations("workspaceStarter");
  const novels = useNovels();
  const starter = useCreateStarterWorkspace();
  const starterStartedRef = useRef(false);
  const [selection, setSelection] = useState<WorkspaceSelection>({
    novelId,
    chapterId: initialChapterId,
    initialSessionId: sessionId,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [graphOpen, setGraphOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>("chapter");
  const sidebar = usePanelToggle();
  const chatPanel = usePanelToggle();
  const effectiveNovelId = selection.novelId ?? novels.data?.[0]?.id;
  const chapters = useNovelChapters(effectiveNovelId);
  const effectiveChapterId =
    selection.chapterId ?? chapters.data?.[0]?.id ?? starter.data?.chapter.id;

  useEffect(() => {
    if (selection.novelId || novels.isLoading || novels.isError || novels.data?.length) return;
    if (starterStartedRef.current || starter.isPending || starter.data) return;
    starterStartedRef.current = true;
    starter.mutate({ novelTitle: t("novelTitle"), chapterTitle: t("chapterTitle") });
  }, [novels.data?.length, novels.isError, novels.isLoading, selection.novelId, starter, t]);

  const selectNovel = (id: string) => {
    if (id === effectiveNovelId) return;
    setSelection({ novelId: id });
    replaceWorkspaceParams({ novelId: id, chapterId: undefined, sessionId: undefined });
  };

  const selectChapter = (id: string) => {
    setSelection((current) => ({ ...current, chapterId: id }));
    setActiveTab("chapter");
    replaceWorkspaceParams({ novelId: effectiveNovelId, chapterId: id });
  };

  const selectTab = (tab: EditorTab) => {
    setActiveTab(tab);
  };

  const openSettings = () => {
    setSettingsOpen(true);
    selectTab("settings");
  };

  const closeGraph = () => {
    setGraphOpen(false);
    selectTab("chapter");
  };

  const selectSidebarView = (view: SidebarView) => {
    if (view === "characters") {
      setGraphOpen(true);
      selectTab("graph");
      return;
    }

    if (view === "novel" && activeTab === "graph") {
      selectTab("chapter");
    }
  };

  const closeSettings = () => {
    setSettingsOpen(false);
    selectTab("chapter");
  };

  const showSettings = settingsOpen && activeTab === "settings";
  const showGraph = graphOpen && activeTab === "graph";

  return (
    <div className="flex h-dvh min-h-0 flex-col">
      <AppHeader
        sidebarCollapsed={sidebar.collapsed}
        chatPanelCollapsed={chatPanel.collapsed}
        onToggleSidebar={sidebar.toggle}
        onToggleChatPanel={chatPanel.toggle}
        onOpenSettings={openSettings}
      />
      <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
        <ResizablePanel
          panelRef={sidebar.panelRef}
          defaultSize={300}
          minSize={240}
          maxSize={420}
          collapsible
          collapsedSize={0}
          groupResizeBehavior="preserve-pixel-size"
        >
          {effectiveNovelId ? (
            <NovelSidebar
              key={effectiveNovelId}
              novelId={effectiveNovelId}
              activeChapterId={effectiveChapterId}
              onSelectNovel={selectNovel}
              onSelectChapter={selectChapter}
              onSelectView={selectSidebarView}
            />
          ) : null}
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel minSize={480}>
          <div className="flex h-full min-h-0 flex-col">
            <EditorTabs
              chapterId={effectiveChapterId}
              settingsOpen={settingsOpen}
              graphOpen={graphOpen}
              activeTab={activeTab}
              onSelectTab={selectTab}
              onCloseGraph={closeGraph}
              onCloseSettings={closeSettings}
            />
            {/* 设置页只是遮住编辑器，保留 Lexical 的撤销栈与滚动位置。 */}
            <div hidden={showSettings || showGraph} className="min-h-0 flex-1">
              {effectiveNovelId && effectiveChapterId ? (
                <ChapterEditor
                  key={effectiveChapterId}
                  novelId={effectiveNovelId}
                  chapterId={effectiveChapterId}
                />
              ) : (
                <EmptyChapterEditor />
              )}
            </div>
            {graphOpen ? (
              <div hidden={!showGraph} className="min-h-0 flex-1">
                <NovelGraphWorkspace novelId={effectiveNovelId} />
              </div>
            ) : null}
            {settingsOpen ? (
              <div hidden={!showSettings} className="min-h-0 flex-1">
                <SettingsView />
              </div>
            ) : null}
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel
          panelRef={chatPanel.panelRef}
          defaultSize={400}
          minSize={320}
          maxSize={560}
          collapsible
          collapsedSize={0}
          groupResizeBehavior="preserve-pixel-size"
        >
          <ChatPanel
            key={effectiveNovelId ?? "new-chat"}
            novelId={effectiveNovelId}
            chapterId={effectiveChapterId}
            sessionId={selection.initialSessionId}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
