import type { Editor } from '@tiptap/react'
import { useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { useAiEditsStore } from '@/store'
import { applySuggestionDiff } from './extensions/suggestion-track'

/**
 * 把 AI 端发出的「修改建议」从 store 拉取并注入当前编辑器。
 *
 * 数据来源：useAiEditsStore（由 ProposeEditPart 推入）
 * - 编辑器即使晚于事件挂载，也能从 store 读到 pending edits
 * - 切走再回到该章节，未应用的 edit 仍然可见
 * - 同一个 edit 通过 partKey 去重，applied=true 后不再重复注入
 *
 * 实现细节：
 * - 直接订阅 edits 对象（稳定引用），用 useMemo 派生当前章节未应用的 edits
 *   避免 selector 每次返回新数组触发 React 19 的「getServerSnapshot should be cached」错误
 */
export function useProposeEditBridge(editor: Editor | null, chapterId?: string) {
  const editsMap = useAiEditsStore(s => s.edits)
  const markApplied = useAiEditsStore(s => s.markApplied)

  const pendingEdits = useMemo(() => {
    if (!chapterId) return []
    return Object.values(editsMap)
      .filter(e => e.chapterId === chapterId && !e.applied)
      .sort((a, b) => a.createdAt - b.createdAt)
  }, [editsMap, chapterId])

  useEffect(() => {
    if (!editor || !chapterId || pendingEdits.length === 0) return

    for (const edit of pendingEdits) {
      const { state } = editor
      const fullText = state.doc.textBetween(0, state.doc.content.size, '\n', '\n')
      const idx = fullText.indexOf(edit.originalText)

      if (idx < 0) {
        toast.warning('AI 提出了修改建议，但在当前章节中没有找到匹配片段', {
          description: edit.reasoning,
        })
        markApplied(edit.id)
        continue
      }

      const range = mapPlainOffsetToDocRange(editor, idx, edit.originalText.length)
      if (!range) {
        toast.warning('AI 提出了修改建议，但定位失败', {
          description: edit.reasoning,
        })
        markApplied(edit.id)
        continue
      }

      const applied = applySuggestionDiff(editor, range, edit.originalText, edit.suggestedText)
      if (!applied) {
        toast.info('修改建议与原文一致，跳过')
        markApplied(edit.id)
        continue
      }

      toast.success('AI 修改建议已注入编辑器', {
        description: edit.reasoning || '请审阅后接受或拒绝',
      })
      markApplied(edit.id)
    }
  }, [editor, chapterId, pendingEdits, markApplied])
}

/**
 * 将「纯文本字符偏移量」转换为 ProseMirror 文档位置区间。
 *
 * 注意：textBetween(0, size, '\n', '\n') 在节点边界产生换行符，所以纯文本偏移
 * 与 doc 位置不是简单 + 1。这里通过逐字符扫描映射回去。
 */
function mapPlainOffsetToDocRange(editor: Editor, plainStart: number, plainLen: number): { from: number, to: number } | null {
  const { state } = editor
  const { doc } = state
  let plainCursor = 0
  let from = -1
  let to = -1
  const targetEnd = plainStart + plainLen

  doc.descendants((node, pos) => {
    if (from >= 0 && to >= 0) return false
    if (!node.isText) return true
    const text = node.text || ''
    for (let i = 0; i < text.length; i += 1) {
      if (plainCursor === plainStart && from < 0) from = pos + i
      plainCursor += 1
      if (plainCursor === targetEnd) {
        to = pos + i + 1
        return false
      }
    }
    return true
  })

  if (from < 0 || to < 0) return null
  return { from, to }
}
