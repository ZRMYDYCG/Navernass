'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { AiChatInput } from '@/components/buss'
import { useI18n } from '@/hooks/use-i18n'
import { conversationsApi } from '@/lib/supabase/sdk'
import { useAppStore } from '@/store'
import { ChatWelcomeHeader } from './_components/chat-welcome-header'

export default function ChatPage() {
  const { t } = useI18n()
  const router = useRouter()

  const welcomeInput = useAppStore(s => s.chat.welcomeInput)
  const setWelcomeInput = useAppStore(s => s.chatActions.setWelcomeInput)
  const setPendingDraftMessage = useAppStore(s => s.chatActions.setPendingDraftMessage)

  const [isDispatching, setIsDispatching] = useState(false)

  // 发起对话：先在服务端建好空 conversation（拿到真实 id），再跳到会话页发送首条消息。
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
    <div className="flex flex-col h-full">
      <ChatWelcomeHeader />

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-3xl space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
              {t('chat.page.heading')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('chat.page.subtitle')}
            </p>
          </div>

          <AiChatInput
            value={welcomeInput}
            onChange={setWelcomeInput}
            onSend={handleSendMessage}
            isSending={isDispatching}
            centered
            showVoice
          />
        </div>
      </div>
    </div>
  )
}
