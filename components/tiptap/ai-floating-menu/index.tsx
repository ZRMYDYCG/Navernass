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
  const aiResultPanelRef = useRef<HTMLDivElement | null>(null)
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
      // 保存当前选中范围
      if (editor) {
        const { from, to } = editor.state.selection
        if (from !== to) {
          lastSelectionRef.current = { from, to }
        }
        // 如果有保存的选中范围，恢复它；否则使用当前的选中状态
        const selectionToRestore = lastSelectionRef.current || (from !== to ? { from, to } : null)

        if (selectionToRestore) {
          // 保持编辑器的焦点和选中状态
          requestAnimationFrame(() => {
            editor.chain().focus().setTextSelection({
              from: selectionToRestore.from,
              to: selectionToRestore.to,
            }).run()
            requestAnimationFrame(() => {
              setShowInput(true)
              // 再次确保选中状态保持
              editor.chain().focus().setTextSelection({
                from: selectionToRestore.from,
                to: selectionToRestore.to,
              }).run()
            })
          })
        } else {
          requestAnimationFrame(() => {
            setShowInput(true)
          })
        }
      } else {
        requestAnimationFrame(() => {
          setShowInput(true)
        })
      }
    } else if (!showAI && showInput) {
      requestAnimationFrame(() => {
        setShowInput(false)
        setShowEditMenu(false)
        resetAI()
      })
    }
  }, [showAI, showInput, resetAI, editor])

  // 监听选中文本变化
  useEffect(() => {
    if (!editor) return

    const updateMenu = () => {
      const { from, to } = editor.state.selection
      const hasSelection = from !== to

      if (!hasSelection) {
        // 如果没有选中文本，且之前有选中，说明选中了其他文本（或取消选中）
        if (lastSelectionRef.current) {
          // 如果 AI 菜单是打开的，尝试恢复选中状态
          if (showInput && lastSelectionRef.current) {
            // 只有在用户没有主动取消选中时才恢复（通过检查是否真的没有选中）
            const { from: savedFrom, to: savedTo } = lastSelectionRef.current
            // 检查保存的选中范围是否仍然有效
            const docSize = editor.state.doc.content.size
            if (savedFrom >= 0 && savedTo <= docSize && savedFrom < savedTo) {
              // 恢复选中状态
              editor.chain().focus().setTextSelection({ from: savedFrom, to: savedTo }).run()
              return
            }
          }
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
        // 更新保存的选中范围
        lastSelectionRef.current = { from, to }
      }
    }

    editor.on('selectionUpdate', updateMenu)
    editor.on('update', updateMenu)

    return () => {
      editor.off('selectionUpdate', updateMenu)
      editor.off('update', updateMenu)
    }
  }, [editor, showInput, resetAI])

  // 当显示 AI 菜单时，持续保持选中状态
  useEffect(() => {
    if (!editor || !showInput || !lastSelectionRef.current) return

    // 定期检查并恢复选中状态（如果丢失）
    const interval = setInterval(() => {
      if (!lastSelectionRef.current) return

      const { from, to } = editor.state.selection
      const { from: savedFrom, to: savedTo } = lastSelectionRef.current

      // 如果选中状态丢失了，恢复它
      if (from === to && savedFrom !== savedTo) {
        const docSize = editor.state.doc.content.size
        if (savedFrom >= 0 && savedTo <= docSize && savedFrom < savedTo) {
          editor.chain().focus().setTextSelection({ from: savedFrom, to: savedTo }).run()
        }
      } else if (from !== to && (from !== savedFrom || to !== savedTo)) {
        // 如果选中状态改变了，但不是用户主动改变的（比如点击了其他地方），恢复原来的选中
        // 这里我们只在选中完全丢失时才恢复，如果用户选择了新的文本，我们尊重用户的选择
        // 但如果是相同的选中范围，我们保持它
      }
    }, 50) // 每 50ms 检查一次

    // 监听编辑器点击事件
    const handleEditorClick = () => {
      if (!lastSelectionRef.current) return

      const { from, to } = editor.state.selection
      const { from: savedFrom, to: savedTo } = lastSelectionRef.current

      // 如果选中状态丢失了，恢复它
      if (from === to && savedFrom !== savedTo) {
        const docSize = editor.state.doc.content.size
        if (savedFrom >= 0 && savedTo <= docSize && savedFrom < savedTo) {
          requestAnimationFrame(() => {
            editor.chain().focus().setTextSelection({ from: savedFrom, to: savedTo }).run()
          })
        }
      }
    }

    const editorElement = editor.view.dom
    editorElement.addEventListener('mousedown', handleEditorClick)
    editorElement.addEventListener('touchstart', handleEditorClick)

    return () => {
      clearInterval(interval)
      editorElement.removeEventListener('mousedown', handleEditorClick)
      editorElement.removeEventListener('touchstart', handleEditorClick)
    }
  }, [editor, showInput])

  // 恢复选中状态的辅助函数
  const restoreSelection = () => {
    if (!editor) return

    // 首先检查当前是否有选中状态，如果有，更新保存的选中范围
    const { from: currentFrom, to: currentTo } = editor.state.selection
    if (currentFrom !== currentTo) {
      lastSelectionRef.current = { from: currentFrom, to: currentTo }
      editor.chain().focus().setTextSelection({ from: currentFrom, to: currentTo }).run()
      return
    }

    // 如果当前没有选中，但之前保存了选中范围，尝试恢复
    if (lastSelectionRef.current) {
      const { from, to } = lastSelectionRef.current
      const docSize = editor.state.doc.content.size
      if (from >= 0 && to <= docSize && from < to) {
        editor.chain().focus().setTextSelection({ from, to }).run()
      }
    }
  }

  // 处理自定义 AI 提示
  const handleCustomAI = () => {
    if (!aiPrompt.trim()) return
    // 在调用 AI 之前，先恢复选中状态
    restoreSelection()
    // 使用 requestAnimationFrame 确保选中状态恢复后再调用 AI
    requestAnimationFrame(() => {
      handleAI(aiPrompt)
    })
  }

  // 处理预设 AI 操作
  const handlePresetAI = (prompt: string) => {
    // 在调用 AI 之前，先恢复选中状态
    restoreSelection()
    // 使用 requestAnimationFrame 确保选中状态恢复后再调用 AI
    requestAnimationFrame(() => {
      handleAI(prompt)
    })
  }

  // 处理编辑调整选中内容（显示右侧菜单）
  const handleEditAdjust = () => {
    // 保持选中状态
    restoreSelection()
    setShowEditMenu(true)
  }

  // 自动滚动到 AI 结果面板
  useEffect(() => {
    if (!aiResultPanelRef.current || !editor) return

    // 只在 AI 加载中或完成时，且有内容时才滚动
    if (!isAILoading && !aiCompleted) return
    if (!aiStreamContent) return

    // 使用防抖，避免频繁滚动
    const timeoutId = setTimeout(() => {
      const panel = aiResultPanelRef.current
      if (!panel) return

      // 获取编辑器容器（有 relative 类的父容器）
      const editorElement = editor.view.dom
      const container = editorElement.closest('.relative') as HTMLElement | null
      if (!container) return

      // 获取可滚动的父容器（通常是编辑器内容区域）
      const scrollContainer = editorElement.closest('[class*="overflow"]') as HTMLElement | null
      if (!scrollContainer) return

      // 获取面板相对于容器的位置
      const panelRect = panel.getBoundingClientRect()
      const scrollRect = scrollContainer.getBoundingClientRect()

      // 检查面板是否在可视区域内（留一些边距，避免频繁滚动）
      const margin = 50 // 50px 的边距
      const isVisible
        = panelRect.top >= scrollRect.top - margin
          && panelRect.bottom <= scrollRect.bottom + margin

      // 如果面板不在可视区域内，滚动到面板位置
      if (!isVisible) {
        // 计算需要滚动的距离
        // 将面板滚动到可视区域的中心位置
        const panelTop = panelRect.top - scrollRect.top + scrollContainer.scrollTop
        const scrollTarget = panelTop - (scrollRect.height / 2) + (panelRect.height / 2)

        scrollContainer.scrollTo({
          top: Math.max(0, scrollTarget),
          behavior: 'smooth',
        })
      }
    }, 300) // 300ms 防抖延迟

    return () => {
      clearTimeout(timeoutId)
    }
  }, [aiStreamContent, isAILoading, aiCompleted, editor])

  // 如果没有选中文本且没有打开输入框，不显示
  if ((!show && !showInput) || !editor) return null

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* AI 输入框 */}
      <AIInputBox
        show={showInput}
        onToggle={() => {
          if (!showInput) {
            // 保存当前选中范围并保持焦点
            if (editor) {
              const { from, to } = editor.state.selection
              if (from !== to) {
                lastSelectionRef.current = { from, to }
                editor.chain().focus().setTextSelection({ from, to }).run()
              } else {
                editor.chain().focus().run()
              }
            }
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
      {/* 当输入框有内容时隐藏菜单（用户对话模式），清空时显示 */}
      {showInput && !aiPrompt.trim() && (
        <div className="flex items-start gap-2">
          {/* 左侧菜单 */}
          <AIMenuLeft
            onPresetAction={handlePresetAI}
            onEditAdjust={handleEditAdjust}
            isLoading={isAILoading}
            editor={editor}
          />

          {/* 右侧菜单 - 只在点击"编辑调整选中内容"时显示 */}
          {showEditMenu && (
            <AIMenuRight
              onPresetAction={handlePresetAI}
              isLoading={isAILoading}
              editor={editor}
            />
          )}
        </div>
      )}

      {/* AI 结果面板 */}
      {(isAILoading || aiCompleted) && (
        <AIResultPanel
          ref={aiResultPanelRef}
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
