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
 * 关键设计：
 * - 流式期间使用 mode="streaming" + parseIncompleteMarkdown，
 *   让未闭合的 ** _ ``` 列表等不出现「半生不熟」的字符抖动；
 * - 完成后切回 "static"，触发一次最终 re-parse 保证准确性；
 * - 关闭 mermaid 与图表内置控件——写作面板用不到，避免无谓体积；
 * - 链接强制 target="_blank" rel="noreferrer"。
 *
 * 字号/间距压缩仍由调用方在外层用 [&_.prose_*] 选择器覆盖。
 */
function StreamingMarkdownInner({ content, isStreaming = false }: StreamingMarkdownProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
      <Streamdown
        mode={isStreaming ? 'streaming' : 'static'}
        parseIncompleteMarkdown={isStreaming}
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
              className="text-blue-600 dark:text-blue-400 hover:underline"
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
