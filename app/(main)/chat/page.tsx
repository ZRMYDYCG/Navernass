'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { AiChatInput } from '@/components/buss'
import { useAuth } from '@/hooks/use-auth'
import { useI18n } from '@/hooks/use-i18n'
import { conversationsApi } from '@/lib/supabase/sdk'
import { useAppStore } from '@/store'
import { ChatWelcomeHeader } from './_components/chat-welcome-header'
import { RecentNovels } from './_components/recent-novels'

export default function ChatPage() {
  const { profile, user } = useAuth()
  const { t } = useI18n()
  const penName = profile?.username || user?.email?.split('@')[0]
  const router = useRouter()

  const welcomeInput = useAppStore(s => s.chat.welcomeInput)
  const setWelcomeInput = useAppStore(s => s.chatActions.setWelcomeInput)
  const setPendingDraftMessage = useAppStore(s => s.chatActions.setPendingDraftMessage)

  const [isDispatching, setIsDispatching] = useState(false)

  // 发起对话：前端先在服务端建好空 conversation（拿到真实 id），再跳到会话页发送首条消息。
  // 标题在 /api/chat/stream 流式返回后由 server 异步覆盖。
  const handleSendMessage = useCallback(async (content: string) => {
    const text = content.trim()
    if (!text || isDispatching) return
    setIsDispatching(true)
    try {
      const conversation = await conversationsApi.create()
      setPendingDraftMessage(text)
      setWelcomeInput('')
      router.push(`/chat/${conversation.id}`)
    } catch (error) {
      console.error('Failed to create conversation:', error)
      setIsDispatching(false)
    }
  }, [isDispatching, router, setPendingDraftMessage, setWelcomeInput])

  return (
    <div className="min-h-screen">
      <ChatWelcomeHeader />

      <div className="relative overflow-y-auto max-h-screen">
        <div className="relative mx-auto w-full max-w-5xl px-6 pt-14 pb-10">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              {t('chat.page.hello')}
              {penName ? ` ${penName}` : ''}
            </h1>
            <p className="text-muted-foreground">{t('chat.page.firstLine')}</p>
          </div>
          <div className="mt-8">
            <AiChatInput
              value={welcomeInput}
              onChange={setWelcomeInput}
              onSend={handleSendMessage}
              isSending={isDispatching}
              centered
              showVoice
            />
          </div>
          <RecentNovels maxItems={3} />
        </div>
      </div>
    </div>
  )
}
