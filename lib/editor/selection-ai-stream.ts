import type { UIMessage, UIMessageChunk } from 'ai'
import { readUIMessageStream } from 'ai'
import type { EditorAction } from '@/prompts/editor'

export interface SelectionAIStreamRequest {
  action: EditorAction
  text: string
  prompt?: string
  context?: string
  model?: string
}

export interface SelectionAIStreamCallbacks {
  onTextUpdate?: (fullText: string) => void
  signal?: AbortSignal
}

export function extractTextFromUIMessage(message: UIMessage | undefined): string {
  if (!message?.parts?.length) return ''
  return message.parts
    .filter((part): part is { type: 'text', text: string } =>
      part.type === 'text' && typeof part.text === 'string',
    )
    .map(part => part.text)
    .join('')
}

function buildUserMessageText(request: SelectionAIStreamRequest): string {
  if (request.prompt?.trim()) return request.prompt.trim()
  if (request.action === 'continue') return '请根据上文自然续写'
  return '请处理以下文本'
}

function createUIMessages(request: SelectionAIStreamRequest): UIMessage[] {
  return [{
    id: crypto.randomUUID(),
    role: 'user',
    parts: [{ type: 'text', text: buildUserMessageText(request) }],
  }]
}

export async function streamSelectionAI(
  request: SelectionAIStreamRequest,
  callbacks: SelectionAIStreamCallbacks = {},
): Promise<string> {
  const response = await fetch('/api/editor/selection-ai/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: request.action,
      selectedText: request.text,
      customPrompt: request.prompt,
      context: request.context,
      messages: createUIMessages(request),
      model: request.model,
    }),
    signal: callbacks.signal,
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(detail || `Selection AI request failed (${response.status})`)
  }

  if (!response.body) {
    throw new Error('Selection AI response body is empty')
  }

  let fullText = ''
  for await (const message of readUIMessageStream({
    stream: response.body as unknown as ReadableStream<UIMessageChunk>,
  })) {
    const nextText = extractTextFromUIMessage(message)
    if (nextText !== fullText) {
      fullText = nextText
      callbacks.onTextUpdate?.(fullText)
    }
  }

  return fullText
}
