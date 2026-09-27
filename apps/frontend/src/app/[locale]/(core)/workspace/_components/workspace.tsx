"use client";

import { useCallback, useRef, useState } from "react";

import type { PanelImperativeHandle } from "react-resizable-panels";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

import { AppHeader } from "./app-header";
import { ChapterEditor, EmptyChapterEditor } from "./chapter-editor/chapter-editor";
import { ChatPanel } from "./chat-panel";
import { EditorTabs, type EditorTab } from "./editor-tabs";
import type { SidebarView } from "./novel-sidebar/activity-bar";
import { NovelSidebar } from "./novel-sidebar/novel-sidebar";
import { SettingsView } from "./settings/settings-view";
import { NovelGraphWorkspace } from "@/features/novel-graph/novel-graph-workspace";

interface WorkspaceProps {
  novelId?: string;
  chapterId?: string;
  sessionId?: string;
  /** 切换语言会整页重新渲染，靠 `view=settings` 参数回到设置页。 */
  settingsActive?: boolean;
  graphActive?: boolean;
}

// 联调期临时方案：未选小说时兜底到写死的开发小说，免登录直接联调对话模块
const DEV_NOVEL_ID = process.env.NEXT_PUBLIC_DEV_NOVEL_ID;

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

export function Workspace({
  novelId,
  chapterId: initialChapterId,
  sessionId,
  settingsActive = false,
  graphActive = false,
}: WorkspaceProps) {
  const [selection, setSelection] = useState<WorkspaceSelection>({
    novelId: novelId ?? DEV_NOVEL_ID,
    chapterId: initialChapterId,
    initialSessionId: sessionId,
  });
  const [settingsOpen, setSettingsOpen] = useState(settingsActive);
  const [graphOpen, setGraphOpen] = useState(graphActive);
  const [activeTab, setActiveTab] = useState<EditorTab>(
    settingsActive ? "settings" : graphActive ? "graph" : "chapter",
  );
  const sidebar = usePanelToggle();
  const chatPanel = usePanelToggle();

  const selectNovel = (id: string) => {
    if (id === selection.novelId) return;
    setSelection({ novelId: id });
    replaceWorkspaceParams({ novelId: id, chapterId: undefined, sessionId: undefined });
  };

  const selectChapter = (id: string) => {
    setSelection((current) => ({ ...current, chapterId: id }));
    setActiveTab("chapter");
    replaceWorkspaceParams({ chapterId: id, view: undefined });
  };

  const selectTab = (tab: EditorTab) => {
    setActiveTab(tab);
    replaceWorkspaceParams({
      view: tab === "settings" ? "settings" : tab === "graph" ? "graph" : undefined,
    });
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
          {selection.novelId ? (
            <NovelSidebar
              key={selection.novelId}
              novelId={selection.novelId}
              activeChapterId={selection.chapterId}
              initialView={graphActive ? "characters" : "novel"}
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
              chapterId={selection.chapterId}
              settingsOpen={settingsOpen}
              graphOpen={graphOpen}
              activeTab={activeTab}
              onSelectTab={selectTab}
              onCloseGraph={closeGraph}
              onCloseSettings={closeSettings}
            />
            {/* 设置页只是遮住编辑器，保留 Lexical 的撤销栈与滚动位置。 */}
            <div hidden={showSettings || showGraph} className="min-h-0 flex-1">
              {selection.novelId && selection.chapterId ? (
                <ChapterEditor
                  key={selection.chapterId}
                  novelId={selection.novelId}
                  chapterId={selection.chapterId}
                />
              ) : (
                <EmptyChapterEditor />
              )}
            </div>
            {graphOpen ? (
              <div hidden={!showGraph} className="min-h-0 flex-1">
                <NovelGraphWorkspace novelId={selection.novelId} />
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
            key={selection.novelId ?? "new-chat"}
            novelId={selection.novelId}
            chapterId={selection.chapterId}
            sessionId={selection.initialSessionId}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
