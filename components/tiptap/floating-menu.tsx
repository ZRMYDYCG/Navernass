'use client'

import type { Editor } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AIFloatingMenu } from './ai-floating-menu'
import { FormatToolbar } from './format-toolbar'

interface FloatingMenuProps {
  editor: Editor | null
}

export function FloatingMenu({ editor }: FloatingMenuProps) {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [showAI, setShowAI] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const lastSelectionRef = useRef<{ from: number, to: number } | null>(null)
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!editor) return

    // 获取编辑器容器元素（有 relative 类的父容器）
    const editorElement = editor.view.dom
    const containerElement = editorElement.closest('.relative') as HTMLElement | null
    if (containerElement) {
      containerRef.current = containerElement
    }

    const updateMenu = () => {
      // 在拖拽时不更新菜单位置，避免 DOM 冲突
      if (isDragging) return

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

        // ProseMirror 的坐标系统获取位置（相对于视口）
        const start = view.coordsAtPos(selection.from)
        const end = view.coordsAtPos(selection.to)

        // 使用 fixed 定位，直接使用视口坐标
        const top = end.bottom + 10
        const left = (start.left + end.right) / 2

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

    // 监听拖拽事件
    const handleDragStart = () => {
      setIsDragging(true)
      setShow(false)
      setShowAI(false)
    }

    const handleDragEnd = () => {
      setIsDragging(false)
    }

    // 监听编辑器事件
    editor.on('selectionUpdate', updateMenu)
    editor.on('update', updateMenu)

    // 获取可滚动的父容器（通常是编辑器内容区域）
    const scrollContainer = editorElement.closest('[class*="overflow"]') as HTMLElement | null

    // 监听拖拽事件
    editorElement.addEventListener('dragstart', handleDragStart, true)
    editorElement.addEventListener('dragend', handleDragEnd, true)
    editorElement.addEventListener('drop', handleDragEnd, true)

    // 监听滚动（容器内滚动和窗口滚动）
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, true)
    }
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)

    return () => {
      editor.off('selectionUpdate', updateMenu)
      editor.off('update', updateMenu)
      editorElement.removeEventListener('dragstart', handleDragStart, true)
      editorElement.removeEventListener('dragend', handleDragEnd, true)
      editorElement.removeEventListener('drop', handleDragEnd, true)
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll, true)
      }
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [editor, show, showAI, isDragging])

  // 在拖拽时隐藏菜单
  if (!show || !editor || isDragging) return null

  // 使用 Portal 渲染到 body，避免 DOM 冲突
  const menuContent = (
    <div
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
        zIndex: 1000,
      }}
      className="flex flex-col items-center gap-2"
    >
      {/* 格式化工具栏 - 当 AI 输入框显示时隐藏 */}
      {!showAI && (
        <FormatToolbar
          editor={editor}
          onAIClick={() => {
            // 保存当前选中状态
            if (editor) {
              const { from, to } = editor.state.selection
              if (from !== to) {
                lastSelectionRef.current = { from, to }
              }
            }
            // 切换 AI 显示状态
            const newShowAI = !showAI
            setShowAI(newShowAI)
            // 在下一个事件循环中恢复选中状态，确保 AI 菜单显示后选中状态保持
            if (newShowAI && lastSelectionRef.current) {
              requestAnimationFrame(() => {
                if (editor && lastSelectionRef.current) {
                  const { from, to } = lastSelectionRef.current
                  editor.chain().focus().setTextSelection({ from, to }).run()
                }
              })
            }
          }}
          isAIActive={showAI}
        />
      )}

      {/* AI 浮动菜单 - 显示在工具栏下方 */}
      {showAI && (
        <AIFloatingMenu
          editor={editor}
          showAI={showAI}
          onCloseAI={() => setShowAI(false)}
        />
      )}
    </div>
  )

  // 只在浏览器环境中使用 Portal
  if (typeof document === 'undefined') return null
  return createPortal(menuContent, document.body)
}
