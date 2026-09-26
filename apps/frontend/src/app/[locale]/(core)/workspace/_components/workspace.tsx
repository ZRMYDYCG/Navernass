"use client";

import { ChatPanel } from "./chat-panel";

interface WorkspaceProps {
  novelId?: string;
  chapterId?: string;
  sessionId?: string;
}

// 联调期临时方案：未选小说时兜底到写死的开发小说，免登录直接联调对话模块
const DEV_NOVEL_ID = process.env.NEXT_PUBLIC_DEV_NOVEL_ID;

export function Workspace({ novelId, chapterId, sessionId }: WorkspaceProps) {
  const activeNovelId = novelId ?? DEV_NOVEL_ID;

  return (
    <div className="h-dvh min-h-0">
      <ChatPanel
        key={activeNovelId ?? "new-chat"}
        novelId={activeNovelId}
        chapterId={chapterId}
        sessionId={sessionId}
      />
    </div>
  );
}
