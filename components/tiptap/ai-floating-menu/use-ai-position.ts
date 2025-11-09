import type { Editor } from '@tiptap/react'
import { useEffect, useState } from 'react'

interface Position {
  top: number
  left: number
}

export function useAIPosition(editor: Editor | null, show: boolean): Position | null {
  const [position, setPosition] = useState<Position | null>(null)

  useEffect(() => {
    if (!editor || !show) {
      requestAnimationFrame(() => {
        setPosition(null)
      })
      return
    }

    const updatePosition = () => {
      const { from, to } = editor.state.selection
      if (from === to) {
        requestAnimationFrame(() => {
          setPosition(null)
        })
        return
      }

      // 获取选中文本的位置
      const { view } = editor
      const { state } = view
      const { selection } = state

      try {
        // 使用 ProseMirror 的坐标系统获取位置
        const start = view.coordsAtPos(selection.from)
        const end = view.coordsAtPos(selection.to)

        // 计算选中文本的底部中心位置
        const top = end.bottom + window.scrollY + 10
        const left = (start.left + end.right) / 2 + window.scrollX

        requestAnimationFrame(() => {
          setPosition({ top, left })
        })
      } catch (error) {
        // 如果获取坐标失败，忽略错误
        console.warn('Failed to get selection coordinates:', error)
      }
    }

    // 初始更新
    updatePosition()

    // 监听滚动和选择变化
    const handleScroll = () => {
      updatePosition()
    }

    const handleSelectionUpdate = () => {
      updatePosition()
    }

    const handleUpdate = () => {
      updatePosition()
    }

    // 监听编辑器事件
    editor.on('selectionUpdate', handleSelectionUpdate)
    editor.on('update', handleUpdate)

    // 监听窗口滚动
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
      editor.off('update', handleUpdate)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [editor, show])

  return position
}
