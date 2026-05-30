'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: (error: Error, retry: () => void) => ReactNode
}

interface State {
  error: Error | null
}

/**
 * 包住右面板消息列表的错误边界。
 *
 * 历史回填时如果某条 tool part 的字段格式与当前组件预期不匹配（比如新加了
 * 字段、旧消息的 jsonb 是字符串等），单条消息渲染异常不应整个面板挂掉。
 *
 * 显示一个简短报错和"重试"按钮（重置错误状态，让 React 重新渲染）。
 */
export class MessageErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('[message-list] render crashed:', error, info)
  }

  retry = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.retry)
      }
      return (
        <div className="m-2 rounded border border-destructive/40 bg-destructive/10 p-3 text-[11px] text-destructive">
          <div className="font-medium mb-1">消息渲染出错</div>
          <div className="text-foreground/70 mb-2 break-all">
            {this.state.error.message}
          </div>
          <button
            type="button"
            onClick={this.retry}
            className="underline text-foreground hover:opacity-80"
          >
            重试
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
