'use client'

import { memo } from 'react'
import { Streamdown } from 'streamdown'
import { cn } from '@/lib/utils'
import { STREAM_ANIMATION } from './stream-animation'

interface StreamingPlainTextProps {
  content: string
  /** 当前是否处于流式输出中 */
  isStreaming?: boolean
  className?: string
}

/**
 * 纯文本流式渲染：与 StreamingMarkdown 共用 shimmerIn 字符闪光。
 */
function StreamingPlainTextInner({ content, isStreaming = false, className }: StreamingPlainTextProps) {
  return (
    <div
      className={cn('break-words leading-[1.45] agui-streamdown [&_p]:my-0 [&_p]:leading-[1.45]', className)}
      data-streaming={isStreaming ? 'true' : undefined}
    >
      <Streamdown
        className="agui-streamdown-inner"
        mode={isStreaming ? 'streaming' : 'static'}
        parseIncompleteMarkdown={isStreaming}
        isAnimating={isStreaming}
        animated={STREAM_ANIMATION}
        controls={{
          code: false,
          mermaid: false,
          table: false,
        }}
      >
        {content}
      </Streamdown>
    </div>
  )
}

export const StreamingPlainText = memo(StreamingPlainTextInner)
