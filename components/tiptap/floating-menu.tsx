'use client'

import type { Editor } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import { AIFloatingMenu } from './ai-floating-menu'
import { FormatToolbar } from './format-toolbar'

interface FloatingMenuProps {
  editor: Editor | null
}

export function FloatingMenu({ editor }: FloatingMenuProps) {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [showAI, setShowAI] = useState(false)
  const lastSelectionRef = useRef<{ from: number, to: number } | null>(null)

  useEffect(() => {
    if (!editor) return

    const updateMenu = () => {
      const { from, to } = editor.state.selection
      const hasSelection = from !== to

      if (!hasSelection) {
        // 如果没有选中文本，关闭菜单和 AI
        if (lastSelectionRef.current) {
          requestAnimationFrame(() => {
            setShow(false)
            setShowAI(false)
          })
          lastSelectionRef.current = null
        }
        return
      }

      // 检查是否是新的选中（与上次不同）
      const isNewSelection = !lastSelectionRef.current
        || lastSelectionRef.current.from !== from
        || lastSelectionRef.current.to !== to

      if (isNewSelection) {
        // 如果是新的选中，关闭 AI 菜单
        requestAnimationFrame(() => {
          setShowAI(false)
        })
        lastSelectionRef.current = { from, to }
      }

      // 更新位置
      try {
        const { view } = editor
        const { state } = view
        const { selection } = state

        // ProseMirror 的坐标系统获取位置
        const start = view.coordsAtPos(selection.from)
        const end = view.coordsAtPos(selection.to)

        // 计算选中文本的底部中心位置
        const top = end.bottom + window.scrollY + 10
        const left = (start.left + end.right) / 2 + window.scrollX

        requestAnimationFrame(() => {
          setPosition({ top, left })
          setShow(true)
        })
      } catch (error) {
        // 如果获取坐标失败，忽略
        console.warn('Failed to get selection coordinates:', error)
      }
    }

    // 监听滚动和选择变化
    const handleScroll = () => {
      if (show || showAI) {
        updateMenu()
      }
    }

    // 初始更新
    updateMenu()

    // 监听编辑器事件
    editor.on('selectionUpdate', updateMenu)
    editor.on('update', updateMenu)

    // 监听窗口滚动
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)

    return () => {
      editor.off('selectionUpdate', updateMenu)
      editor.off('update', updateMenu)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [editor, show, showAI])

  if (!show || !editor) return null

  return (
    <>
      {/* 格式化工具栏 */}
      <div
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: 'translateX(-50%)',
          zIndex: 50,
        }}
        className="flex flex-col items-center gap-2"
      >
        <FormatToolbar
          editor={editor}
          onAIClick={() => setShowAI(!showAI)}
          isAIActive={showAI}
        />

        {/* AI 浮动菜单 - 显示在工具栏下方 */}
        {showAI && (
          <AIFloatingMenu
            editor={editor}
            showAI={showAI}
            onCloseAI={() => setShowAI(false)}
          />
        )}
      </div>
    </>
  )
}
