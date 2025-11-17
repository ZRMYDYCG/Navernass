'use client'

import type { Editor } from '@tiptap/react'
import { useCallback, useEffect, useRef, useState } from 'react'
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
  const [isShaking, setIsShaking] = useState(false)
  const lastSelectionRef = useRef<{ from: number, to: number } | null>(null)
  const aiResultPanelRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const handleActionComplete = () => {
    setShowInput(false)
    setShowEditMenu(false)
    if (onCloseAI) {
      onCloseAI()
    }
  }
  
  const {
    aiPrompt,
    setAiPrompt,
    isAILoading,
    aiStreamContent,
    aiCompleted,
    handleAI,
    resetAI,
    retryAI,
    applyReplace,
    applyInsertBelow,
    cancelAI,
    lastPromptRef,
  } = useAIState(editor, handleActionComplete)
  
  const hasActiveConversation = isAILoading || aiCompleted
  
  const triggerShake = useCallback(() => {
    if (shakeTimeoutRef.current) return
    
    setIsShaking(true)
    shakeTimeoutRef.current = setTimeout(() => {
      setIsShaking(false)
      shakeTimeoutRef.current = null
    }, 600)
  }, [])
  
  const handleCloseRequest = useCallback(() => {
    if (hasActiveConversation) {
      triggerShake()
    } else {
      setShowInput(false)
      setShowEditMenu(false)
      resetAI()
      if (onCloseAI) {
        onCloseAI()
      }
    }
  }, [hasActiveConversation, resetAI, onCloseAI, triggerShake])
  
  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (showAI && !showInput) {
      if (editor) {
        const { from, to } = editor.state.selection
        if (from !== to) {
          lastSelectionRef.current = { from, to }
        }
        const selectionToRestore = lastSelectionRef.current || (from !== to ? { from, to } : null)

        if (selectionToRestore) {
          requestAnimationFrame(() => {
            editor.chain().focus().setTextSelection({
              from: selectionToRestore.from,
              to: selectionToRestore.to,
            }).run()
            requestAnimationFrame(() => {
              setShowInput(true)
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

  useEffect(() => {
    if (!editor) return

    const updateMenu = () => {
      const { from, to } = editor.state.selection
      const hasSelection = from !== to

      if (!hasSelection) {
        if (lastSelectionRef.current) {
          if (showInput && lastSelectionRef.current) {
            const { from: savedFrom, to: savedTo } = lastSelectionRef.current
            const docSize = editor.state.doc.content.size
            if (savedFrom >= 0 && savedTo <= docSize && savedFrom < savedTo) {
              editor.chain().focus().setTextSelection({ from: savedFrom, to: savedTo }).run()
              return
            }
          }
          if (hasActiveConversation) {
            triggerShake()
            return
          }
          setShow(false)
          setShowInput(false)
          lastSelectionRef.current = null
        }
        return
      }

      const isNewSelection = !lastSelectionRef.current
        || lastSelectionRef.current.from !== from
        || lastSelectionRef.current.to !== to

      if (isNewSelection) {
        if (showInput && hasActiveConversation) {
          triggerShake()
          return
        }
        
        if (showInput) {
          setShowInput(false)
          setShowEditMenu(false)
          resetAI()
        }
        lastSelectionRef.current = { from, to }
        setShow(true)
      } else {
        setShow(true)
        lastSelectionRef.current = { from, to }
      }
    }

    editor.on('selectionUpdate', updateMenu)
    editor.on('update', updateMenu)

    return () => {
      editor.off('selectionUpdate', updateMenu)
      editor.off('update', updateMenu)
    }
  }, [editor, showInput, resetAI, hasActiveConversation, triggerShake])

  useEffect(() => {
    if (!editor || !showInput || !lastSelectionRef.current) return

    const interval = setInterval(() => {
      if (!lastSelectionRef.current) return

      const { from, to } = editor.state.selection
      const { from: savedFrom, to: savedTo } = lastSelectionRef.current

      if (from !== savedFrom || to !== savedTo) {
        const docSize = editor.state.doc.content.size
        if (savedFrom >= 0 && savedTo <= docSize && savedFrom < savedTo) {
          try {
            editor.commands.setTextSelection({ from: savedFrom, to: savedTo })
          } catch (e) {
          }
        }
      }
    }, 50)

    const handleEditorClick = () => {
      if (!lastSelectionRef.current) return

      const { from, to } = editor.state.selection
      const { from: savedFrom, to: savedTo } = lastSelectionRef.current

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
  
  useEffect(() => {
    if (!editor || !showInput || !hasActiveConversation) return
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const clickedInsideContainer = containerRef.current?.contains(target)
      
      if (!clickedInsideContainer) {
        event.preventDefault()
        event.stopPropagation()
        triggerShake()
      }
    }
    
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true)
    }, 100)
    
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside, true)
    }
  }, [editor, showInput, hasActiveConversation, triggerShake])

  const restoreSelection = () => {
    if (!editor) return

    const { from: currentFrom, to: currentTo } = editor.state.selection
    if (currentFrom !== currentTo) {
      lastSelectionRef.current = { from: currentFrom, to: currentTo }
      editor.chain().focus().setTextSelection({ from: currentFrom, to: currentTo }).run()
      return
    }

    if (lastSelectionRef.current) {
      const { from, to } = lastSelectionRef.current
      const docSize = editor.state.doc.content.size
      if (from >= 0 && to <= docSize && from < to) {
        editor.chain().focus().setTextSelection({ from, to }).run()
      }
    }
  }

  const handleCustomAI = () => {
    if (!aiPrompt.trim()) return
    restoreSelection()
    requestAnimationFrame(() => {
      handleAI(aiPrompt)
    })
  }

  const handlePresetAI = (prompt: string) => {
    restoreSelection()
    requestAnimationFrame(() => {
      handleAI(prompt)
    })
  }

  const handleEditAdjust = () => {
    restoreSelection()
    setShowEditMenu(true)
  }

  useEffect(() => {
    if (!aiResultPanelRef.current || !editor) return

    if (!isAILoading && !aiCompleted) return
    if (!aiStreamContent) return

    const timeoutId = setTimeout(() => {
      const panel = aiResultPanelRef.current
      if (!panel) return

      const editorElement = editor.view.dom
      const container = editorElement.closest('.relative') as HTMLElement | null
      if (!container) return

      const scrollContainer = editorElement.closest('[class*="overflow"]') as HTMLElement | null
      if (!scrollContainer) return

      const panelRect = panel.getBoundingClientRect()
      const scrollRect = scrollContainer.getBoundingClientRect()

      const margin = 50
      const isVisible
        = panelRect.top >= scrollRect.top - margin
          && panelRect.bottom <= scrollRect.bottom + margin

      if (!isVisible) {
        const panelTop = panelRect.top - scrollRect.top + scrollContainer.scrollTop
        const scrollTarget = panelTop - (scrollRect.height / 2) + (panelRect.height / 2)

        scrollContainer.scrollTo({
          top: Math.max(0, scrollTarget),
          behavior: 'smooth',
        })
      }
    }, 300)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [aiStreamContent, isAILoading, aiCompleted, editor])

  if ((!show && !showInput) || !editor) return null

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col items-center gap-1.5 ${isShaking ? 'ai-menu-shake' : ''}`}
    >
      {hasActiveConversation && (
        <AIResultPanel
          ref={aiResultPanelRef}
          isLoading={isAILoading}
          content={aiStreamContent}
          isCompleted={aiCompleted}
          onReplace={applyReplace}
          onInsertBelow={applyInsertBelow}
          onCancel={cancelAI}
          onRetry={retryAI}
        />
      )}

      <AIInputBox
        show={showInput}
        onToggle={() => {
          if (!showInput) {
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
            handleCloseRequest()
          }
        }}
        onClose={handleCloseRequest}
        prompt={aiPrompt}
        onPromptChange={setAiPrompt}
        onSubmit={handleCustomAI}
        isLoading={isAILoading}
        hasActiveConversation={hasActiveConversation}
      />

      {showInput && !aiPrompt.trim() && !hasActiveConversation && (
        <div className="flex items-start gap-2">
          <AIMenuLeft
            onPresetAction={handlePresetAI}
            onEditAdjust={handleEditAdjust}
            isLoading={isAILoading}
            editor={editor}
          />

          {showEditMenu && (
            <AIMenuRight
              onPresetAction={handlePresetAI}
              isLoading={isAILoading}
              editor={editor}
            />
          )}
        </div>
      )}
    </div>
  )
}
