"use client";

import { useState } from "react";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

import { ChapterEditor, EmptyChapterEditor } from "./chapter-editor";
import { ChatPanel } from "./chat-panel";
import { NovelSidebar } from "./novel-sidebar";

interface WorkspaceProps {
  novelId?: string;
  chapterId?: string;
  sessionId?: string;
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

export function Workspace({ novelId, chapterId: initialChapterId, sessionId }: WorkspaceProps) {
  const [selection, setSelection] = useState<WorkspaceSelection>({
    novelId: novelId ?? DEV_NOVEL_ID,
    chapterId: initialChapterId,
    initialSessionId: sessionId,
  });

  const selectNovel = (id: string) => {
    if (id === selection.novelId) return;
    setSelection({ novelId: id });
    replaceWorkspaceParams({ novelId: id, chapterId: undefined, sessionId: undefined });
  };

  const selectChapter = (id: string) => {
    setSelection((current) => ({ ...current, chapterId: id }));
    replaceWorkspaceParams({ chapterId: id });
  };

  return (
    <div className="h-dvh min-h-0">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel
          defaultSize={300}
          minSize={240}
          maxSize={420}
          groupResizeBehavior="preserve-pixel-size"
        >
          {selection.novelId ? (
            <NovelSidebar
              key={selection.novelId}
              novelId={selection.novelId}
              activeChapterId={selection.chapterId}
              onSelectNovel={selectNovel}
              onSelectChapter={selectChapter}
            />
          ) : null}
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel minSize={480}>
          {selection.novelId && selection.chapterId ? (
            <ChapterEditor
              key={selection.chapterId}
              novelId={selection.novelId}
              chapterId={selection.chapterId}
            />
          ) : (
            <EmptyChapterEditor />
          )}
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel
          defaultSize={400}
          minSize={320}
          maxSize={560}
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
