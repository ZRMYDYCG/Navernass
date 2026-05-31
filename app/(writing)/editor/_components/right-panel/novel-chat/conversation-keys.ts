export const DRAFT_CONVERSATION_SLOT = '__draft__'

export function makeConversationKey(
  novelId: string,
  conversationId: string | null,
  isDraft: boolean,
): string {
  const slot = isDraft || !conversationId ? DRAFT_CONVERSATION_SLOT : conversationId
  return `${novelId}:${slot}`
}

export function parseConversationKey(key: string): { novelId: string, slot: string } {
  const idx = key.indexOf(':')
  if (idx === -1) return { novelId: key, slot: DRAFT_CONVERSATION_SLOT }
  return { novelId: key.slice(0, idx), slot: key.slice(idx + 1) }
}
