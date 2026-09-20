import type { NextRequest } from 'next/server'
import { NovelMessagesService } from '@/lib/supabase/sdk/services/novel-messages.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

/**
 * PATCH /api/editor/novel-messages/update-part
 *
 * 按 (conversationId, toolCallId) 找到目标 part，合并新 output 后写回 novel_messages.parts。
 * 与 app/api/chat/messages/update-part 对称，但作用于 novel_messages（编辑器侧）。
 * 用于：
 *   - 编辑器 ask_user 表单提交后把 submitted 状态落库
 *   - 编辑器 propose_edit / 其他带 output 的工具被 accept/reject 时
 */
export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return ApiResponseBuilder.error('Unauthorized', 'UNAUTHORIZED', 401)
  }

  const body = await req.json().catch(() => null) as
    | { conversationId?: string, toolCallId?: string, output?: unknown }
    | null

  const conversationId = body?.conversationId
  const toolCallId = body?.toolCallId
  const newOutput = body?.output

  if (!conversationId || typeof conversationId !== 'string') {
    return ApiResponseBuilder.error('conversationId is required', 'BAD_REQUEST', 400)
  }
  if (!toolCallId || typeof toolCallId !== 'string') {
    return ApiResponseBuilder.error('toolCallId is required', 'BAD_REQUEST', 400)
  }
  if (newOutput === undefined) {
    return ApiResponseBuilder.error('output is required', 'BAD_REQUEST', 400)
  }

  const messagesService = new NovelMessagesService(supabase)
  const rows = await messagesService.getByConversationId(conversationId)

  let targetMessageId: string | null = null
  let targetPartIndex = -1
  for (const row of rows) {
    const parts = (() => {
      if (!row.parts) return null
      if (Array.isArray(row.parts)) return row.parts
      if (typeof row.parts === 'string') {
        try {
          const parsed = JSON.parse(row.parts)
          return Array.isArray(parsed) ? parsed : null
        } catch {
          return null
        }
      }
      return null
    })()
    if (!parts) continue
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i] as { type?: string, toolCallId?: string } | null
      if (p && typeof p.type === 'string' && p.type.startsWith('tool-') && p.toolCallId === toolCallId) {
        targetMessageId = row.id
        targetPartIndex = i
        break
      }
    }
    if (targetMessageId) break
  }

  if (!targetMessageId || targetPartIndex < 0) {
    return ApiResponseBuilder.error('No matching part found', 'NOT_FOUND', 404)
  }

  const targetRow = rows.find(r => r.id === targetMessageId)!
  const originalParts = (() => {
    if (!targetRow.parts) return []
    if (Array.isArray(targetRow.parts)) return targetRow.parts
    if (typeof targetRow.parts === 'string') {
      try {
        const parsed = JSON.parse(targetRow.parts)
        return Array.isArray(parsed) ? [] : []
      } catch {
        return []
      }
    }
    return []
  })()

  const updatedParts = originalParts.map((p: unknown, idx: number) => {
    if (idx !== targetPartIndex) return p
    const part = (p && typeof p === 'object') ? p as Record<string, unknown> : {}
    return { ...part, output: newOutput }
  })

  await messagesService.update(targetMessageId, { parts: updatedParts as unknown[] })

  return ApiResponseBuilder.success({
    messageId: targetMessageId,
    partIndex: targetPartIndex,
  })
})
