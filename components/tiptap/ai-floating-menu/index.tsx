'use client'

import type { Editor } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import { AIInputBox } from './ai-input-box'
import { AIMenuLeft } from './ai-menu-left'
import { AIMenuRight } from './ai-menu-right'
import { AIResultPanel } from './ai-result-panel'
import { useAIState } from './use-ai-state'

interface AIFloatingMenuProps {
  editor: Editor | null
  showAI?: boolean
  onCloseAI?: () => void
}

export function AIFloatingMenu({ editor, showAI, onCloseAI }: AIFloatingMenuProps) {
  const [show, setShow] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [showEditMenu, setShowEditMenu] = useState(false)
  const lastSelectionRef = useRef<{ from: number, to: number } | null>(null)
  const {
    aiPrompt,
    setAiPrompt,
    isAILoading,
    aiStreamContent,
    aiCompleted,
    handleAI,
    resetAI,
    applyReplace,
    applyInsertBelow,
    cancelAI,
    lastPromptRef,
  } = useAIState(editor)

  // 当 showAI 为 true 时，自动显示输入框
  useEffect(() => {
    if (showAI && !showInput) {
      requestAnimationFrame(() => {
        setShowInput(true)
      })
    } else if (!showAI && showInput) {
      requestAnimationFrame(() => {
        setShowInput(false)
        setShowEditMenu(false)
        resetAI()
      })
    }
  }, [showAI, showInput, resetAI])

  // 监听选中文本变化
  useEffect(() => {
    if (!editor) return

    const updateMenu = () => {
      const { from, to } = editor.state.selection
      const hasSelection = from !== to

      if (!hasSelection) {
        // 如果没有选中文本，且之前有选中，说明选中了其他文本（或取消选中）
        if (lastSelectionRef.current) {
          setShow(false)
          setShowInput(false)
          lastSelectionRef.current = null
        }
        return
      }

      // 检查是否是新的选中（与上次不同）
      const isNewSelection = !lastSelectionRef.current
        || lastSelectionRef.current.from !== from
        || lastSelectionRef.current.to !== to

      if (isNewSelection) {
        // 如果是新的选中，且之前已经打开了 AI 菜单，则关闭
        if (showInput) {
          setShowInput(false)
          setShowEditMenu(false)
          resetAI()
        }
        lastSelectionRef.current = { from, to }
        setShow(true)
      } else {
        // 如果是相同的选中，保持显示状态
        setShow(true)
      }
    }

    editor.on('selectionUpdate', updateMenu)
    editor.on('update', updateMenu)

    return () => {
      editor.off('selectionUpdate', updateMenu)
      editor.off('update', updateMenu)
    }
  }, [editor, showInput, resetAI])

  // 处理自定义 AI 提示
  const handleCustomAI = () => {
    if (!aiPrompt.trim()) return
    handleAI(aiPrompt)
  }

  // 处理预设 AI 操作
  const handlePresetAI = (prompt: string) => {
    handleAI(prompt)
  }

  // 处理编辑调整选中内容（显示右侧菜单）
  const handleEditAdjust = () => {
    setShowEditMenu(true)
  }

  // 如果没有选中文本且没有打开输入框，不显示
  if ((!show && !showInput) || !editor) return null

  return (
    <div className="flex flex-col items-center gap-2">
      {/* AI 输入框 */}
      <AIInputBox
        show={showInput}
        onToggle={() => {
          if (!showInput) {
            setShowInput(true)
          } else {
            setShowInput(false)
            setShowEditMenu(false)
            resetAI()
            // 通知父组件关闭 AI
            if (onCloseAI) {
              onCloseAI()
            }
          }
        }}
        prompt={aiPrompt}
        onPromptChange={setAiPrompt}
        onSubmit={handleCustomAI}
        isLoading={isAILoading}
      />

      {/* 菜单容器 - 水平排列 */}
      {showInput && (
        <div className="flex items-start gap-2">
          {/* 左侧菜单 */}
          <AIMenuLeft
            onPresetAction={handlePresetAI}
            onEditAdjust={handleEditAdjust}
            isLoading={isAILoading}
          />

          {/* 右侧菜单 - 只在点击"编辑调整选中内容"时显示 */}
          {showEditMenu && (
            <AIMenuRight
              onPresetAction={handlePresetAI}
              isLoading={isAILoading}
            />
          )}
        </div>
      )}

      {/* AI 结果面板 */}
      {(isAILoading || aiCompleted) && (
        <AIResultPanel
          isLoading={isAILoading}
          content={aiStreamContent}
          isCompleted={aiCompleted}
          onReplace={applyReplace}
          onInsertBelow={applyInsertBelow}
          onCancel={cancelAI}
          onRetry={() => {
            resetAI()
            handleAI(lastPromptRef.current)
          }}
        />
      )}
    </div>
  )
}
