'use client'

import { memo } from 'react'
import type { AnimateOptions } from 'streamdown'
import { Streamdown } from 'streamdown'

interface StreamingMarkdownProps {
  content: string
  /** 当前是否处于流式输出中 */
  isStreaming?: boolean
}

/** 流式字符闪光：见 https://streamdown.ai/docs/animation */
const STREAM_ANIMATION: AnimateOptions = {
  animation: 'shimmerIn',
  duration: 280,
  easing: 'ease-out',
  sep: 'char',
  stagger: 16,
}

/**
 * 基于 streamdown 的 markdown 渲染器。
 * - `animated` + `isAnimating`：新到达字符带闪光淡入
 * - `caret`：流式末尾块状光标
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
        caret={isStreaming ? 'block' : undefined}
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
