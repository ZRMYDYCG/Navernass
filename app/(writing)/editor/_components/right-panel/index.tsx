'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { useI18n } from '@/hooks/use-i18n'
import { EmptyState } from './empty-state'
import { Header } from './header'
import { MessageList } from './message-list'
import { ModeSelector } from './mode-selector'
import { ModelSelector } from './model-selector'
import { ChapterChatInput } from './chapter-chat-input'
import { ChatActionsProvider } from './parts/chat-actions-context'
import type { FormSubmitPayload } from './parts/chat-actions-context'
import { MessageErrorFallback } from './message-error-fallback'
import { MessageErrorBoundary } from './message-error-boundary'
import { RecentConversations } from './recent-conversations'
import { useNovelChat } from './novel-chat'

export default function RightPanel() {
  const { t } = useI18n()
  const {
    novelId,
    messages,
    error,
    isLoading,
    hasMessages,
    streamingMessageId,
    isAwaitingFirstToken,
    mode,
    model,
    input,
    conversations,
    currentConversationId,
    isDraftConversation,
    isLoadingMessages,
    loadMessagesError,
    submittedFormKeys,
    setInput,
    setMode,
    setModel,
    setSelectedChapters,
    addSubmittedFormKey,
    removeSubmittedFormKey,
    handleSend,
    handleNewChat,
    handleSelectConversation,
    handleDeleteConversation,
    loadMessages,
    loadConversations,
    sendMessage,
  } = useNovelChat()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handler = (event: Event) => {
      const text = (event as CustomEvent<{ text?: string }>).detail?.text
      if (!text) return
      setInput(prev => (prev.trim() ? `${prev.trim()}\n\n${text}` : text))
    }
    window.addEventListener('novel-ai-insert-from-editor', handler)
    return () => window.removeEventListener('novel-ai-insert-from-editor', handler)
  }, [setInput])

  const submitFormResponse = useCallback(async (payload: FormSubmitPayload) => {
    if (isLoading || submittedFormKeys.has(payload.formKey) || !sendMessage) return
    const header = payload.title || t('editor.rightPanel.askUserForm.replyHeader')
    const lines = Object.entries(payload.values)
      .filter(([, v]) => v.trim())
      .map(([id, v]) => `${payload.labels[id] || id}: ${v}`)
      .join('\n')
    if (!lines) return
    addSubmittedFormKey(payload.formKey)
    try {
      await sendMessage({ text: `[${header}]\n${lines}` })
    } catch (e) {
      removeSubmittedFormKey(payload.formKey)
      console.error('Failed to submit form:', e)
    }
  }, [isLoading, submittedFormKeys, sendMessage, addSubmittedFormKey, removeSubmittedFormKey, t])

  const chatActions = useMemo(() => ({
    submitFormResponse,
    isFormSubmitted: (formKey: string) => submittedFormKeys.has(formKey),
    isChatLoading: isLoading,
  }), [submitFormResponse, submittedFormKeys, isLoading])

  return (
    <div className="h-full w-full bg-transparent relative">
      <div className="h-full flex flex-col border-border bg-background">
        <Header
          onNewChat={handleNewChat}
          isNewChatActive={!currentConversationId && !hasMessages && isDraftConversation}
          conversations={conversations}
          currentConversationId={currentConversationId || undefined}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onHistoryOpenChange={(open) => {
            if (open) void loadConversations?.()
          }}
        />

        <div className="flex-1 min-h-0 overflow-hidden py-2 relative">
          {isLoadingMessages
            ? (
                <div className="h-full flex flex-col items-center justify-center gap-2">
                  <Spinner className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t('editor.rightPanel.loadingConversation')}</span>
                </div>
              )
            : loadMessagesError
              ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2 px-4">
                    <div className="text-[12px] text-destructive font-medium">{t('editor.rightPanel.loadMessagesFailed')}</div>
                    <div className="text-[11px] text-muted-foreground text-center max-w-xs break-all">
                      {loadMessagesError}
                    </div>
                    <button
                      type="button"
                      onClick={() => currentConversationId && loadMessages?.(currentConversationId)}
                      className="text-[11px] underline text-foreground hover:opacity-80"
                    >
                      {t('editor.rightPanel.retry')}
                    </button>
                  </div>
                )
              : !hasMessages
                  ? (
                      <EmptyState mode={mode} />
                    )
                  : (
                      <ChatActionsProvider value={chatActions}>
                        <MessageErrorBoundary
                          fallback={(error, retry) => (
                            <MessageErrorFallback error={error} onRetry={retry} />
                          )}
                        >
                          <MessageList
                            novelId={novelId}
                            messages={messages}
                            streamingMessageId={streamingMessageId}
                            isLoading={isAwaitingFirstToken}
                          />
                        </MessageErrorBoundary>
                      </ChatActionsProvider>
                    )}
          {error && (
            <div className="absolute bottom-2 left-2 right-2 text-[11px] text-destructive bg-destructive/10 border border-destructive/30 rounded px-2 py-1">
              {error.message}
            </div>
          )}
        </div>

        <div className="px-5 py-2 space-y-2 bg-background rounded-b-lg z-10">
          {!hasMessages && !isLoadingMessages && (
            <RecentConversations
              conversations={conversations}
              onSelect={handleSelectConversation}
            />
          )}
          <ChapterChatInput
            value={input}
            onChange={setInput}
            onSend={() => handleSend()}
            placeholder={t(`editor.rightPanel.mode.placeholder.${mode}`)}
            disabled={isLoading || !novelId}
            isSending={isLoading}
            variant="compact"
            onSelectionChange={setSelectedChapters}
            mode={mode}
            model={model}
            onModeChange={setMode}
            onModelChange={setModel}
          />
        </div>
      </div>
    </div>
  )
}
