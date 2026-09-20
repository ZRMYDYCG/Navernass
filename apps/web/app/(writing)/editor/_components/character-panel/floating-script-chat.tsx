'use client'

import type { NovelCharacter } from '@/lib/supabase/sdk'
import type { UIMessage } from 'ai'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { GripHorizontal, Loader2, Send, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { findLastRenderableIndex, isBubblePart, isRenderablePart, renderPart } from '../right-panel/parts/registry'

interface FloatingScriptChatProps {
  novelId: string
  character: NovelCharacter | null
  open: boolean
  onClose: () => void
}

const DEFAULT_POS = { x: 80, y: 80 }
const DEFAULT_SIZE = { w: 380, h: 480 }

/**
 * 浮动剧本对话框
 *
 * 角色面板上的"角色剧本 Agent"：可拖动浮窗，绑定当前角色，
 * 调用 /api/editor/character-script/stream 与 character-scriptwriter agent 对话。
 *
 * Agent 会自主调用 list/create/update/delete_character_event 工具维护时间线，
 * 浮窗里通过 AutoWriteToolPart 反馈结果，时间线 store 立即同步，TimelinePanel 自动刷新。
 */
export function FloatingScriptChat({ novelId, character, open, onClose }: FloatingScriptChatProps) {
  const [pos, setPos] = useState(DEFAULT_POS)
  const dragStartRef = useRef<{ x: number, y: number, startX: number, startY: number } | null>(null)
  const [input, setInput] = useState('')

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/editor/character-script/stream',
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: {
            ...body,
            messages,
            novelId,
            characterId: character?.id,
            characterName: character?.name,
          },
        }),
      }),
    [novelId, character?.id, character?.name],
  )

  const { messages, sendMessage, setMessages, status, stop, error } = useChat({
    transport,
    onError: (err) => {
      console.error('character-script useChat error:', err)
    },
  })

  // 切换角色清空对话
  useEffect(() => {
    setMessages([])
    setInput('')
  }, [character?.id, setMessages])

  const isLoading = status === 'submitted' || status === 'streaming'
  const hasMessages = messages.length > 0
  const streamingMessageId = useMemo(() => {
    if (status !== 'streaming') return null
    const last = messages[messages.length - 1]
    return last?.role === 'assistant' ? last.id : null
  }, [status, messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading || !character) return
    setInput('')
    try {
      await sendMessage({ text })
    } catch (e) {
      console.error('Failed to send message:', e)
    }
  }

  // 拖动逻辑
  const onMouseDown = (e: React.MouseEvent) => {
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: pos.x,
      startY: pos.y,
    }
    const onMove = (ev: MouseEvent) => {
      if (!dragStartRef.current) return
      const dx = ev.clientX - dragStartRef.current.x
      const dy = ev.clientY - dragStartRef.current.y
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - DEFAULT_SIZE.w, dragStartRef.current.startX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 80, dragStartRef.current.startY + dy)),
      })
    }
    const onUp = () => {
      dragStartRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  if (!open || !character) return null

  return (
    <div
      className="fixed z-50 rounded-lg shadow-2xl border border-border bg-card flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        left: pos.x,
        top: pos.y,
        width: DEFAULT_SIZE.w,
        height: DEFAULT_SIZE.h,
      }}
    >
      {/* Header（可拖动） */}
      <div
        className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-muted/30 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={onMouseDown}
      >
        <GripHorizontal className="w-3 h-3 text-muted-foreground" />
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-medium text-foreground truncate">
            {character.name} · 剧本助手
          </div>
          <div className="text-[10px] text-muted-foreground truncate">
            为该角色规划时间线、构思成长弧
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-accent rounded transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-2 scrollbar-none">
        {!hasMessages
          ? (
              <div className="h-full flex flex-col items-center justify-center gap-1.5 text-center px-4">
                <Sparkles className="w-5 h-5 text-muted-foreground/50" />
                <div className="text-[11px] text-muted-foreground">
                  让 AI 帮你规划 <span className="text-foreground font-medium">{character.name}</span> 的剧本
                </div>
                <div className="text-[10px] text-muted-foreground/70">
                  例如："列一下他到目前为止的关键节点" / "设计一个让他黑化的转折"
                </div>
              </div>
            )
          : (
              messages.map(m => (
                <ChatMessage
                  key={m.id}
                  message={m}
                  isStreaming={streamingMessageId === m.id}
                />
              ))
            )}
        {isLoading && !streamingMessageId && (
          <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            正在思考…
          </div>
        )}
        {error && (
          <div className="text-[10.5px] text-destructive bg-destructive/10 border border-destructive/30 rounded px-2 py-1">
            {error.message}
          </div>
        )}
      </div>

      {/* 输入区 */}
      <div className="border-t border-border p-2 space-y-1.5 bg-background">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`和 ${character.name} 的剧本助手对话…`}
          rows={2}
          className="text-[11.5px] resize-none min-h-[44px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void handleSend()
            }
          }}
        />
        <div className="flex justify-end gap-1.5">
          {isLoading && (
            <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => stop()}>
              停止
            </Button>
          )}
          <Button
            size="sm"
            className="h-7 text-[11px] gap-1"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-3 h-3" />
            发送
          </Button>
        </div>
      </div>
    </div>
  )
}

function ChatMessage({ message, isStreaming }: { message: UIMessage, isStreaming: boolean }) {
  const isUser = message.role === 'user'
  const parts = (message.parts || []) as any[]
  const lastIdx = findLastRenderableIndex(parts)

  // 复用主对话面板的 part registry（tool 卡片、reasoning、ask_user 等都能渲染）
  type Group =
    | { kind: 'bubble', items: { part: any, index: number }[] }
    | { kind: 'standalone', part: any, index: number }
  const groups: Group[] = []
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (!isRenderablePart(part)) continue
    if (isBubblePart(part)) {
      const tail = groups[groups.length - 1]
      if (tail && tail.kind === 'bubble') {
        tail.items.push({ part, index: i })
      } else {
        groups.push({ kind: 'bubble', items: [{ part, index: i }] })
      }
    } else {
      groups.push({ kind: 'standalone', part, index: i })
    }
  }

  if (groups.length === 0 && !isStreaming) return null

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[88%] space-y-1', isUser ? '' : 'w-full')}>
        {groups.map((group, gi) => {
          if (group.kind === 'bubble') {
            return (
              <div
                key={`g-${gi}`}
                className={cn(
                  'rounded-md px-2 py-1 text-[11.5px]',
                  isUser
                    ? 'bg-primary text-primary-foreground w-fit ml-auto'
                    : 'bg-secondary text-foreground',
                )}
              >
                {group.items.map(({ part, index }) =>
                  renderPart(part, {
                    message,
                    isStreaming,
                    index,
                    isLast: index === lastIdx,
                    formKey: `${message.id}:${index}`,
                  }),
                )}
              </div>
            )
          }
          return (
            <div key={`g-${gi}`}>
              {renderPart(group.part, {
                message,
                isStreaming,
                index: group.index,
                isLast: group.index === lastIdx,
                formKey: `${message.id}:${group.index}`,
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
