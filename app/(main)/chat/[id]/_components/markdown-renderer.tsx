'use client'

import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

import 'highlight.js/styles/github-dark.css'

interface MarkdownRendererProps {
  content: string
  className?: string
}

type CodeProps = React.HTMLProps<HTMLElement> & {
  inline?: boolean
  children?: React.ReactNode
}

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: React.ReactNode
}

type UlProps = React.HTMLAttributes<HTMLUListElement> & {
  children?: React.ReactNode
}

type OlProps = React.OlHTMLAttributes<HTMLOListElement> & {
  children?: React.ReactNode
}

type TableProps = React.TableHTMLAttributes<HTMLTableElement> & {
  children?: React.ReactNode
}

type BlockquoteProps = React.BlockquoteHTMLAttributes<HTMLQuoteElement> & {
  children?: React.ReactNode
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const components: Partial<Components> = {
    // 自定义代码块样式
    code({ inline, className, children, ...props }: CodeProps) {
      return inline
        ? (
            <code
              className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-red-600 dark:text-red-400"
              {...props}
            >
              {children}
            </code>
          )
        : (
            <code className={className} {...props}>
              {children}
            </code>
          )
    },
    // 自定义链接样式
    a({ children, ...props }: LinkProps) {
      return (
        <a
          className="text-blue-600 dark:text-blue-400 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      )
    },
    // 自定义列表样式
    ul({ children, ...props }: UlProps) {
      return (
        <ul className="list-disc list-inside space-y-1" {...props}>
          {children}
        </ul>
      )
    },
    ol({ children, ...props }: OlProps) {
      return (
        <ol className="list-decimal list-inside space-y-1" {...props}>
          {children}
        </ol>
      )
    },
    // 自定义表格样式
    table({ children, ...props }: TableProps) {
      return (
        <div className="overflow-x-auto my-4">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props}>
            {children}
          </table>
        </div>
      )
    },
    // 自定义引用块样式
    blockquote({ children, ...props }: BlockquoteProps) {
      return (
        <blockquote
          className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-700 dark:text-gray-300"
          {...props}
        >
          {children}
        </blockquote>
      )
    },
  }

  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
