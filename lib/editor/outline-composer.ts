import type { SerializedOutlineRef } from './inline-composer'

export function buildOutlineContextBlock(
  outlines: Array<{ id: string, title: string, content: string }>,
): string {
  if (outlines.length === 0) return ''
  const lines = outlines.map((outline) => {
    const body = outline.content?.trim() || '（无正文）'
    return `## ${outline.title}（outlineId: ${outline.id}）\n\n${body}`
  })
  return `【@ 大纲上下文】\n${lines.join('\n\n---\n\n')}\n\n`
}

export function extractOutlineRefsFromMessageParts(
  parts: unknown[],
): SerializedOutlineRef[] {
  const result: SerializedOutlineRef[] = []
  const seen = new Set<string>()
  for (const raw of parts) {
    if (typeof raw !== 'object' || raw === null) continue
    const part = raw as { type?: string, data?: { id?: string, title?: string } }
    if (part.type !== 'data-outline-ref') continue
    const id = part.data?.id
    const title = part.data?.title
    if (!id || !title || seen.has(id)) continue
    seen.add(id)
    result.push({ id, title })
  }
  return result
}
