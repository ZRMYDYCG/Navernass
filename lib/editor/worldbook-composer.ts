import type { SerializedWorldbookRef } from './inline-composer'

export function buildWorldbookContextBlock(
  entries: Array<{ id: string, title: string, content: string }>,
): string {
  if (entries.length === 0) return ''
  const lines = entries.map((entry) => {
    const body = entry.content?.trim() || '（无正文）'
    return `## ${entry.title}（worldbookId: ${entry.id}）\n\n${body}`
  })
  return `【@ 世界观上下文】\n${lines.join('\n\n---\n\n')}\n\n`
}

export function extractWorldbookRefsFromMessageParts(
  parts: unknown[],
): SerializedWorldbookRef[] {
  const result: SerializedWorldbookRef[] = []
  const seen = new Set<string>()
  for (const raw of parts) {
    if (typeof raw !== 'object' || raw === null) continue
    const part = raw as { type?: string, data?: { id?: string, title?: string } }
    if (part.type !== 'data-worldbook-ref') continue
    const id = part.data?.id
    const title = part.data?.title
    if (!id || !title || seen.has(id)) continue
    seen.add(id)
    result.push({ id, title })
  }
  return result
}
