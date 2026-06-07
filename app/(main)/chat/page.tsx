'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { AiChatInput } from '@/components/buss'
import { useI18n } from '@/hooks/use-i18n'
import type { ChatAiMode } from '@/lib/ai/agents'
import { conversationsApi } from '@/lib/supabase/sdk'
import type { AiModel } from '@/app/(writing)/editor/_components/right-panel/types'
import { useAppStore } from '@/store'
import { ChatWelcomeHeader } from './_components/chat-welcome-header'
import { ChatModeSelector } from './[id]/_components/chat-mode-selector'
import { ChatModelSelector } from './[id]/_components/chat-model-selector'

export default function ChatPage() {
  const { t } = useI18n()
  const router = useRouter()

  const welcomeInput = useAppStore(s => s.chat.welcomeInput)
  const setWelcomeInput = useAppStore(s => s.chatActions.setWelcomeInput)
  const setPendingDraftMessage = useAppStore(s => s.chatActions.setPendingDraftMessage)
  const welcomeMode = useAppStore(s => s.chat.welcomeMode)
  const welcomeModel = useAppStore(s => s.chat.welcomeModel)
  const setWelcomeMode = useAppStore(s => s.chatActions.setWelcomeMode)
  const setWelcomeModel = useAppStore(s => s.chatActions.setWelcomeModel)

  const [isDispatching, setIsDispatching] = useState(false)

  // 发起对话：先在服务端建好空 conversation（拿到真实 id），再跳到会话页发送首条消息。
  // mode / model 写入 conversations 行；/chat/[id] 挂载时 useChatAgent 会从 store 读取并落库。
  const handleSendMessage = useCallback(async (content: string) => {
    const text = content.trim()
    if (!text || isDispatching) return
    setIsDispatching(true)
    try {
      const conversation = await conversationsApi.create({
        mode: welcomeMode,
        model: welcomeModel,
      })
      setPendingDraftMessage(text)
      setWelcomeInput('')
      router.push(`/chat/${conversation.id}`)
    } catch (error) {
      console.error('Failed to create conversation:', error)
      setIsDispatching(false)
    }
  }, [isDispatching, router, setPendingDraftMessage, setWelcomeInput, welcomeMode, welcomeModel])

  const handleModeChange = useCallback((mode: ChatAiMode) => {
    setWelcomeMode(mode)
  }, [setWelcomeMode])

  const handleModelChange = useCallback((model: AiModel) => {
    setWelcomeModel(model)
  }, [setWelcomeModel])

  return (
    <div className="flex flex-col h-full">
      <ChatWelcomeHeader />

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-3xl space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
              {t(`chat.agent.welcome.${welcomeMode}.heading`)}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t(`chat.agent.welcome.${welcomeMode}.subtitle`)}
            </p>
          </div>

          <AiChatInput
            value={welcomeInput}
            onChange={setWelcomeInput}
            onSend={handleSendMessage}
            isSending={isDispatching}
            centered
            showVoice
            toolbar={(
              <>
                <ChatModeSelector value={welcomeMode} onChange={handleModeChange} />
                <div className="flex-1 min-w-0">
                  <ChatModelSelector value={welcomeModel} onChange={handleModelChange} />
                </div>
              </>
            )}
          />
        </div>
      </div>
    </div>
  )
}
