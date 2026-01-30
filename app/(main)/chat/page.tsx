'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { chatApi } from '@/lib/supabase/sdk'
import { ChatInputBox } from './_components/chat-input-box'
import { ChatWelcomeHeader } from './_components/chat-welcome-header'
import { RecentNovels } from './_components/recent-novels'

function ChatContent() {
  const { profile, user } = useAuth()
  const penName = profile?.username || user?.email?.split('@')[0]
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSending, setIsSending] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const initialMessage = searchParams.get('message')

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isSending) return

    setIsSending(true)

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      const conversation = await chatApi.createConversation(content.trim())
      router.push(`/chat/${conversation.id}?message=${encodeURIComponent(content.trim())}`)
    } catch (error) {
      console.error('Failed to create conversation:', error)
      setIsSending(false)
    }
  }

  useEffect(() => {
    if (initialMessage) {
      handleSendMessage(initialMessage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return (
    <div className="min-h-screen">
      <ChatWelcomeHeader />

      <div className="relative overflow-y-auto max-h-screen">
        <div className="relative mx-auto w-full max-w-5xl px-6 pt-14 pb-10">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              你好，
              {penName ? ` ${penName}` : ''}
            </h1>
            <p className="text-muted-foreground">在这里写下你的第一句故事吧！</p>
          </div>
          <div className="mt-8">
            <ChatInputBox onSend={handleSendMessage} disabled={isSending} />
          </div>
          <RecentNovels maxItems={3} />
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatContent />
    </Suspense>
  )
}
