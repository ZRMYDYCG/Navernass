'use client'

import { NovelChatProvider } from '@/app/(writing)/editor/_components/right-panel/novel-chat'

export default function WritingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <NovelChatProvider>
        {children}
      </NovelChatProvider>
    </div>
  )
}
