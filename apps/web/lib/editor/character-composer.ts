import { buildCharacterSubagentLine } from '@/lib/ai/agents/subagent-trigger-hints'
import {
  extractCharacterMarkersFromSerialized,
  type SerializedCharacterRef,
} from './inline-composer'

export function buildCharacterContextBlock(
  characters: SerializedCharacterRef[],
  options?: { refsOnlyMention?: boolean, userText?: string },
): string {
  if (characters.length === 0) return ''
  const lines = characters.map(c => `- ${c.name}（characterId: ${c.id}）`)
  const primary = characters[0]
  const hints = [
    characters.length === 1
      ? `主 Agent 委派 delegate_character_timeline 时可使用 characterId=${primary.id}，无需用户重复提供。`
      : `多条 @ 角色时，以第一条为主要聚焦：${primary.name}（${primary.id}）。`,
  ]
  if (options?.refsOnlyMention) {
    hints.push(
      '用户本回合可能仅以 @ 提及角色而未附长文，请结合上文对话理解意图并继续执行，勿回复「消息为空」或「无法解读」。',
    )
  }
  const userText = options?.userText?.trim()
  if (userText) {
    const subLine = buildCharacterSubagentLine(userText, primary.name)
    if (subLine) hints.push(subLine)
  }
  return `【@ 角色上下文】\n${lines.join('\n')}\n${hints.join('\n')}\n\n`
}

export function pickPrimaryCharacter(
  characters: SerializedCharacterRef[],
): SerializedCharacterRef | null {
  return characters[0] ?? null
}

/** 请求体 focusCharacter + 消息 parts 中的 @ 角色（客户端 sanitize 后 parts 可能已无 chip） */
export function resolveCharacterRefsForRequest(
  focusFromBody: SerializedCharacterRef | undefined,
  fromMessageParts: SerializedCharacterRef[],
): SerializedCharacterRef[] {
  const result: SerializedCharacterRef[] = []
  const seen = new Set<string>()
  const add = (ref: SerializedCharacterRef | null | undefined) => {
    if (!ref?.id || !ref.name || seen.has(ref.id)) return
    seen.add(ref.id)
    result.push({ id: ref.id, name: ref.name })
  }
  add(focusFromBody)
  for (const ref of fromMessageParts) add(ref)
  return result
}

export function extractCharacterRefsFromMessageParts(
  parts: unknown[],
): SerializedCharacterRef[] {
  const result: SerializedCharacterRef[] = []
  const seen = new Set<string>()
  for (const raw of parts) {
    if (typeof raw !== 'object' || raw === null) continue
    const part = raw as { type?: string, data?: { id?: string, name?: string, title?: string } }
    if (part.type !== 'data-character-ref') continue
    const id = part.data?.id
    const name = part.data?.name || part.data?.title
    if (!id || !name || seen.has(id)) continue
    seen.add(id)
    result.push({ id, name })
  }
  return result
}

export { extractCharacterMarkersFromSerialized }
