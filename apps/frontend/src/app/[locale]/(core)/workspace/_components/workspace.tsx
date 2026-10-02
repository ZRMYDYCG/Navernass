"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { PanelImperativeHandle } from "react-resizable-panels";
import { useTranslations } from "next-intl";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { RelationshipGraphWorkspace } from "./relationship-graph";
import { useCreateStarterWorkspace, useNovelChapters, useNovels } from "@/servers/library.server";
import { useWorkspaceStore } from "@/stores";

import { AppHeader } from "./app-header";
import { ChapterEditor, EmptyChapterEditor } from "./editor";
import type { ChapterEditorHandle } from "./editor";
import { ChatPanel } from "./chat-panel/chat-panel";
import { Sidebar } from "./sidebar/sidebar";
import type { SidebarView } from "./sidebar/types";
import { Settings } from "./settings";

function usePanelToggle(collapsed: boolean, onCollapsedChange: (collapsed: boolean) => void) {
  const panelRef = useRef<PanelImperativeHandle>(null);

  const toggle = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const nextCollapsed = !panel.isCollapsed();
    if (nextCollapsed) {
      panel.collapse();
    } else {
      panel.expand();
    }
    onCollapsedChange(nextCollapsed);
  }, [onCollapsedChange]);

  return { panelRef, collapsed, toggle };
}

type WorkspaceView = "editor" | "graph" | "settings";

export function Workspace() {
  const t = useTranslations("workspaceStarter");
  const novels = useNovels();
  const starter = useCreateStarterWorkspace();
  const starterStartedRef = useRef(false);
  const storedNovelId = useWorkspaceStore((state) => state.novelId);
  const storedChapterId = useWorkspaceStore((state) => state.chapterId);
  const selectNovelInStore = useWorkspaceStore((state) => state.selectNovel);
  const selectChapterInStore = useWorkspaceStore((state) => state.selectChapter);
  const storedPanelLayout = useWorkspaceStore((state) => state.panelLayout);
  const storedSidebarCollapsed = useWorkspaceStore((state) => state.sidebarCollapsed);
  const storedChatPanelCollapsed = useWorkspaceStore((state) => state.chatPanelCollapsed);
  const savePanelLayout = useWorkspaceStore((state) => state.savePanelLayout);
  const setSidebarCollapsedInStore = useWorkspaceStore((state) => state.setSidebarCollapsed);
  const setChatPanelCollapsedInStore = useWorkspaceStore((state) => state.setChatPanelCollapsed);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [graphOpen, setGraphOpen] = useState(false);
  const [activeView, setActiveView] = useState<WorkspaceView>("editor");
  const [hydrated, setHydrated] = useState(false);
  const sidebar = usePanelToggle(storedSidebarCollapsed, setSidebarCollapsedInStore);
  const chatPanel = usePanelToggle(storedChatPanelCollapsed, setChatPanelCollapsedInStore);
  const editorRef = useRef<ChapterEditorHandle>(null);

  // persist 采用 skipHydration，挂载后再恢复本地缓存，避免 SSR 水合不一致。
  // 面板布局经 defaultLayout 只在挂载时生效，需等恢复完成后再渲染面板组。
  useEffect(() => {
    void Promise.resolve(useWorkspaceStore.persist.rehydrate()).then(() => setHydrated(true));
  }, []);

  // 收起的面板以 flexGrow 0 参与恢复，保证刷新后仍保持收起状态。
  const defaultLayout = useMemo(() => {
    if (!storedPanelLayout) return undefined;
    return {
      ...storedPanelLayout,
      sidebar: storedSidebarCollapsed ? 0 : storedPanelLayout.sidebar,
      chat: storedChatPanelCollapsed ? 0 : storedPanelLayout.chat,
    };
  }, [storedChatPanelCollapsed, storedPanelLayout, storedSidebarCollapsed]);

  const effectiveNovelId = storedNovelId ?? novels.data?.[0]?.id;
  const chapters = useNovelChapters(effectiveNovelId);
  const effectiveChapterId = storedChapterId ?? chapters.data?.[0]?.id ?? starter.data?.chapter.id;

  // 本地缓存里的 id 可能指向已删除的小说或章节，数据到位后校正。
  useEffect(() => {
    if (novels.isLoading || !novels.data) return;
    if (storedNovelId && !novels.data.some((novel) => novel.id === storedNovelId)) {
      selectNovelInStore(undefined);
    }
  }, [novels.data, novels.isLoading, selectNovelInStore, storedNovelId]);

  useEffect(() => {
    if (!effectiveNovelId || chapters.isLoading || !chapters.data) return;
    if (storedChapterId && !chapters.data.some((chapter) => chapter.id === storedChapterId)) {
      selectChapterInStore(chapters.data[0]?.id);
    }
  }, [chapters.data, chapters.isLoading, effectiveNovelId, selectChapterInStore, storedChapterId]);

  useEffect(() => {
    if (storedNovelId || novels.isLoading || novels.isError || novels.data?.length) return;
    if (starterStartedRef.current || starter.isPending || starter.data) return;
    starterStartedRef.current = true;
    starter.mutate({ novelTitle: t("novelTitle"), chapterTitle: t("chapterTitle") });
  }, [novels.data?.length, novels.isError, novels.isLoading, storedNovelId, starter, t]);

  const selectNovel = (id: string) => {
    if (id === effectiveNovelId) return;
    selectNovelInStore(id);
  };

  const selectChapter = (id: string) => {
    selectChapterInStore(id);
    setActiveView("editor");
  };

  const saveCurrentChapter = useCallback(async () => {
    await editorRef.current?.save();
  }, []);

  // 设置入口只剩顶栏按钮，作为开关使用。
  const toggleSettings = () => {
    setSettingsOpen((open) => {
      if (open) setActiveView("editor");
      else setActiveView("settings");
      return !open;
    });
  };

  const selectSidebarView = (view: SidebarView) => {
    if (view === "characters") {
      setGraphOpen(true);
      setActiveView("graph");
      return;
    }

    if (view === "novel" && activeView === "graph") {
      setActiveView("editor");
    }
  };

  if (!hydrated) return null;

  return (
    <div className="flex h-dvh min-h-0 flex-col">
      <AppHeader
        sidebarCollapsed={sidebar.collapsed}
        chatPanelCollapsed={chatPanel.collapsed}
        onToggleSidebar={sidebar.toggle}
        onToggleChatPanel={chatPanel.toggle}
        onOpenSettings={toggleSettings}
      />
      <ResizablePanelGroup
        orientation="horizontal"
        className="min-h-0 flex-1"
        defaultLayout={defaultLayout}
        onLayoutChanged={(layout, meta) => {
          if (meta.isUserInteraction) savePanelLayout(layout);
        }}
      >
        <ResizablePanel
          id="sidebar"
          panelRef={sidebar.panelRef}
          defaultSize={300}
          minSize={240}
          maxSize={420}
          collapsible
          collapsedSize={0}
          groupResizeBehavior="preserve-pixel-size"
        >
          {effectiveNovelId ? (
            <Sidebar
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
        <ResizablePanel id="content" minSize={480}>
          <div className="flex h-full min-h-0 flex-col">
            {/* 覆盖视图只是遮住编辑器，编辑器保持挂载以保留状态与滚动位置。 */}
            <div hidden={activeView !== "editor"} className="min-h-0 flex-1">
              {effectiveNovelId && effectiveChapterId ? (
                <ChapterEditor
                  key={effectiveChapterId}
                  novelId={effectiveNovelId}
                  chapterId={effectiveChapterId}
                  ref={editorRef}
                />
              ) : (
                <EmptyChapterEditor />
              )}
            </div>
            {graphOpen ? (
              <div hidden={activeView !== "graph"} className="min-h-0 flex-1">
                <RelationshipGraphWorkspace novelId={effectiveNovelId} />
              </div>
            ) : null}
            {settingsOpen ? (
              <div hidden={activeView !== "settings"} className="min-h-0 flex-1">
                <Settings />
              </div>
            ) : null}
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel
          id="chat"
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
            onBeforeSend={saveCurrentChapter}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
