"use client";

import { useCallback, useState } from "react";

import { AuthBar } from "./auth-bar";
import { ChatPanel } from "./chat-panel";

interface WorkspaceProps {
  novelId?: string;
  chapterId?: string;
  sessionId?: string;
}

// 联调期临时方案：未选小说时兜底到写死的开发小说，免登录直接联调对话模块
const DEV_NOVEL_ID = process.env.NEXT_PUBLIC_DEV_NOVEL_ID;

export function Workspace({ novelId, chapterId, sessionId }: WorkspaceProps) {
  const [selectedNovelId, setSelectedNovelId] = useState(novelId);
  const selectNovel = useCallback((id: string) => setSelectedNovelId(id), []);
  const activeNovelId = selectedNovelId ?? DEV_NOVEL_ID;

  return (
    <div className="flex h-dvh min-h-0 flex-col">
      <AuthBar onNovelSelect={selectNovel} />
      <main className="grid min-h-0 flex-1 grid-cols-1 bg-background lg:grid-cols-12">
        <section className="hidden items-center justify-center border-r bg-destructive/15 text-sm text-muted-foreground lg:col-span-2 lg:flex">
          左侧章节与卷列表占位
        </section>
        <section className="hidden items-center justify-center border-r bg-destructive/10 text-sm text-muted-foreground lg:col-span-7 lg:flex">
          中间小说编辑器占位
        </section>
        <div className="min-h-0 lg:col-span-3">
          <ChatPanel
            key={activeNovelId ?? "new-chat"}
            novelId={activeNovelId}
            chapterId={chapterId}
            sessionId={sessionId}
          />
        </div>
      </main>
    </div>
  );
}
