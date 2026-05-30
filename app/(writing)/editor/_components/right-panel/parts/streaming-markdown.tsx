'use client'

import { memo } from 'react'
import { Streamdown } from 'streamdown'
import { STREAM_ANIMATION } from './stream-animation'

interface StreamingMarkdownProps {
  content: string
  /** 当前是否处于流式输出中 */
  isStreaming?: boolean
}

/**
 * 基于 streamdown 的 markdown 渲染器。
 * - `animated` + `isAnimating`：新到达字符带闪光淡入
 * - `mode="streaming"` + `parseIncompleteMarkdown`：未闭合 markdown 不抖动
 */
function StreamingMarkdownInner({ content, isStreaming = false }: StreamingMarkdownProps) {
  return (
    <div
      className="prose prose-sm dark:prose-invert max-w-none break-words agui-streamdown"
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
        components={{
          a: ({ children, href, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              {...props}
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </Streamdown>
    </div>
  )
}

export const StreamingMarkdown = memo(StreamingMarkdownInner)
