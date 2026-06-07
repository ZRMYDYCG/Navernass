import type { NextRequest } from 'next/server'
import { MessagesService } from '@/lib/supabase/sdk/services/messages.service'
import { withErrorHandler } from '@/lib/supabase/sdk/utils/handler'
import { ApiResponseBuilder } from '@/lib/supabase/sdk/utils/response'
import { createClient } from '@/lib/supabase/server'

/**
 * PATCH /api/chat/messages/update-part
 *
 * 按 (conversationId, toolCallId) 找到目标 part，合并新 output 后写回 messages.parts。
 * 用于桥接工具 (propose_*) 接受/拒绝、ask_user 表单提交等需要在客户端
 * 立即更新 part state 但又必须落库(否则刷新就回到原状态)的场景。
 *
 * Body: { conversationId, toolCallId, output }
 *
 * 行为：
 *   - 找到第一条包含 type=`tool-*` 且 toolCallId 匹配的消息
 *   - 找到对应 part，合并 output（保留已有 input/state）
 *   - update 该行的 parts
 *   - 不允许跨用户写入（auth.uid 校验在 service 内进行）
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

  const messagesService = new MessagesService(supabase)
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

  // 重新构造合并后的 parts：保留原 part 的 input / state / toolCallId / type，
  // 仅替换/合并 output
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
    // merge：保留 input / state 等元数据，output 用新值覆盖
    return { ...part, output: newOutput }
  })

  await messagesService.update(targetMessageId, { parts: updatedParts as unknown[] })

  return ApiResponseBuilder.success({
    messageId: targetMessageId,
    partIndex: targetPartIndex,
  })
})
