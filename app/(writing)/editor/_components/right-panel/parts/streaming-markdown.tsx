'use client'

import { memo } from 'react'
import { Streamdown } from 'streamdown'

interface StreamingMarkdownProps {
  content: string
  /** 当前是否处于流式输出中（影响 streamdown 的 mode 与 incomplete-token 处理） */
  isStreaming?: boolean
}

/**
 * 基于 streamdown 的 markdown 渲染器，专为 right-panel 流式场景调整。
 *
 * 业界常见做法（AI SDK Message / Streamdown 官方示例）：
 * - `animated` + `isAnimating`：仅对新到达字符做淡入，避免整段重绘
 * - `caret`：流式末尾块状光标
 * - `mode="streaming"` + `parseIncompleteMarkdown`：未闭合 markdown 不抖动
 */
function StreamingMarkdownInner({ content, isStreaming = false }: StreamingMarkdownProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words agui-streamdown">
      <Streamdown
        className="agui-streamdown-inner"
        mode={isStreaming ? 'streaming' : 'static'}
        parseIncompleteMarkdown={isStreaming}
        isAnimating={isStreaming}
        animated={isStreaming ? {
          sep: 'char',
          duration: 70,
          stagger: 12,
          animation: 'fadeIn',
          easing: 'ease-out',
        } : false}
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
