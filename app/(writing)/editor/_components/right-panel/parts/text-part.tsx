'use client'

import type { TextUIPart } from 'ai'
import { memo } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import { StreamLoading } from './stream-loading'
import { StreamingMarkdown } from './streaming-markdown'

interface TextPartProps {
  part: TextUIPart
  role: 'user' | 'assistant' | 'system'
  /** 该 part 是否仍在流式产出中 */
  isStreaming?: boolean
}

/**
 * AG-UI 风格 text part 渲染器。
 * 用户消息保持纯文本；助手消息走 markdown 渲染，并在内联图片标记上做替换。
 */
function TextPartInner({ part, role, isStreaming }: TextPartProps) {
  const { t } = useI18n()
  const text = part.text || ''

  if (!text && !isStreaming) return null

  if (role === 'user') {
    return (
      <p className="whitespace-pre-wrap break-words leading-snug text-[12px]">
        {text}
      </p>
    )
  }

  // 助手内容：处理 [图片](url) 内联占位
  const imageRegex = /\[图片\]\((https?:\/\/[^\s)]+)\)/g
  const segments = text.split(imageRegex)
  const elements: React.ReactNode[] = []
  for (let i = 0; i < segments.length; i++) {
    if (i % 2 === 1) {
      elements.push(
        <div key={`img-${i}`} className="my-2">
          <img
            src={segments[i]}
            alt={t('editor.rightPanel.generatedImageAlt')}
            className="max-w-full h-auto rounded-lg border border-border"
            style={{ maxHeight: '300px' }}
          />
        </div>,
      )
    } else if (segments[i]) {
      elements.push(
        <span key={`txt-${i}`} className="text-foreground">
          <StreamingMarkdown content={segments[i]} isStreaming={isStreaming} />
        </span>,
      )
    }
  }

  return (
    <div className="text-foreground break-words break-all [&_.prose]:!text-[11.5px] [&_.prose]:!leading-[1.65] [&_.prose_p]:!my-1 [&_.prose_p]:!text-[11.5px] [&_.prose_h1]:!text-[14px] [&_.prose_h1]:!my-1.5 [&_.prose_h2]:!text-[13px] [&_.prose_h2]:!my-1.5 [&_.prose_h3]:!text-[12px] [&_.prose_h3]:!my-1 [&_.prose_ul]:!my-1 [&_.prose_ol]:!my-1 [&_.prose_li]:!text-[11.5px] [&_.prose_li]:!my-0.5 [&_.prose_code]:!text-[10px] [&_.prose_pre]:!my-1.5 [&_.prose_pre]:!p-1.5 [&_.prose_pre]:!text-[10px] [&_.prose_blockquote]:!my-1.5 [&_.prose_blockquote]:!pl-3 [&_.prose_table]:!my-1.5 [&_.prose_th]:!text-[11.5px] [&_.prose_th]:!px-2 [&_.prose_th]:!py-1 [&_.prose_td]:!text-[11.5px] [&_.prose_td]:!px-2 [&_.prose_td]:!py-1">
      {elements.length > 0 ? elements : <span className="text-foreground"><StreamingMarkdown content={text} isStreaming={isStreaming} /></span>}
      {isStreaming && !text && <StreamLoading variant="card" />}
    </div>
  )
}

export const TextPart = memo(TextPartInner)
