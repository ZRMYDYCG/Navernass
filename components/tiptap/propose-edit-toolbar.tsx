'use client'

import type { Editor } from '@tiptap/react'
import { Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { acceptSuggestions, rejectSuggestions } from './extensions/suggestion-track'

interface ProposeEditToolbarProps {
  editor: Editor | null
  chapterId?: string
}

/**
 * AI 修改建议的浮动操作栏
 *
 * 当编辑器中存在 suggestion_add / suggestion_del 标记时显示，
 * 提供「全部接受 / 全部拒绝」两个动作（一次处理整个文档的所有挂起建议）。
 *
 * 后续可扩展为「逐项 hover 接受」，但 MVP 阶段全量接受/拒绝足够覆盖
 * AI 一次只改一处的使用场景（参考 propose_edit 工具的"最小改动"原则）。
 */
export function ProposeEditToolbar({ editor }: ProposeEditToolbarProps) {
  const [hasSuggestions, setHasSuggestions] = useState(false)

  useEffect(() => {
    if (!editor) return

    const check = () => {
      const html = editor.getHTML()
      setHasSuggestions(/data-suggestion="(?:add|del)"/.test(html))
    }

    check()
    editor.on('transaction', check)
    return () => {
      editor.off('transaction', check)
    }
  }, [editor])

  if (!editor || !hasSuggestions) return null

  return (
    <div className="absolute top-2 right-2 z-30 flex items-center gap-1 rounded-md border border-border bg-card/95 backdrop-blur-sm shadow-lg px-1.5 py-1 animate-in fade-in-0 slide-in-from-top-1 duration-200">
      <span className="text-[10px] text-muted-foreground px-1">AI 建议</span>
      <button
        type="button"
        onClick={() => acceptSuggestions(editor)}
        className="flex items-center gap-1 px-2 py-0.5 text-[11px] rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 transition-colors"
        title="接受所有 AI 修改建议"
      >
        <Check className="w-3 h-3" />
        接受
      </button>
      <button
        type="button"
        onClick={() => rejectSuggestions(editor)}
        className="flex items-center gap-1 px-2 py-0.5 text-[11px] rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 transition-colors"
        title="拒绝所有 AI 修改建议"
      >
        <X className="w-3 h-3" />
        拒绝
      </button>
    </div>
  )
}
