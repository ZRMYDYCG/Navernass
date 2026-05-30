'use client'

import type { TextUIPart } from 'ai'
import { Check } from 'lucide-react'
import { memo, useState } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import { StreamingMarkdown } from './streaming-markdown'

interface TextPartProps {
  part: TextUIPart
  role: 'user' | 'assistant' | 'system'
  /** 该 part 是否仍在流式产出中 */
  isStreaming?: boolean
  /** 是否为该消息的最后一段文本（决定是否显示复制按钮） */
  isLast?: boolean
}

/**
 * AG-UI 风格 text part 渲染器。
 * 用户消息保持纯文本；助手消息走 markdown 渲染，并在内联图片标记上做替换。
 */
function TextPartInner({ part, role, isStreaming, isLast }: TextPartProps) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  const showCopy = !isStreaming && isLast && text.length > 0

  return (
    <>
      <div className="text-foreground break-words break-all [&_.prose]:!text-[12px] [&_.prose]:!leading-snug [&_.prose_p]:!my-1 [&_.prose_p]:!text-[12px] [&_.prose_h1]:!text-[14px] [&_.prose_h1]:!my-1.5 [&_.prose_h2]:!text-[13px] [&_.prose_h2]:!my-1.5 [&_.prose_h3]:!text-[12px] [&_.prose_h3]:!my-1 [&_.prose_ul]:!my-1 [&_.prose_ol]:!my-1 [&_.prose_li]:!text-[12px] [&_.prose_li]:!my-0.5 [&_.prose_code]:!text-[10px] [&_.prose_pre]:!my-1.5 [&_.prose_pre]:!p-1.5 [&_.prose_pre]:!text-[10px] [&_.prose_blockquote]:!my-1.5 [&_.prose_blockquote]:!pl-3 [&_.prose_table]:!my-1.5 [&_.prose_th]:!text-[12px] [&_.prose_th]:!px-2 [&_.prose_th]:!py-1 [&_.prose_td]:!text-[12px] [&_.prose_td]:!px-2 [&_.prose_td]:!py-1">
        {elements.length > 0 ? elements : <span className="text-foreground"><StreamingMarkdown content={text} isStreaming={isStreaming} /></span>}
        {isStreaming && <span className="inline-block w-1 h-3 ml-0.5 bg-foreground/60 align-middle animate-pulse" />}
      </div>
      {showCopy && (
        <div className="mt-1 flex justify-end">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer transition-colors"
          >
            {t('editor.rightPanel.copy')}
            {copied && <Check className="w-3 h-3 text-emerald-500" />}
          </button>
        </div>
      )}
    </>
  )
}

export const TextPart = memo(TextPartInner)
