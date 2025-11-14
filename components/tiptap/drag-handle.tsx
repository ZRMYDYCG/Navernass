import type { Editor } from '@tiptap/react'
import { GripVertical } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface DragHandleProps {
  editor: Editor | null
}

export function DragHandle({ editor }: DragHandleProps) {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const draggedElementRef = useRef<HTMLElement | null>(null)
  const draggedPosRef = useRef<number | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!editor) return

    const editorElement = editor.view.dom as HTMLElement
    // 找到包含编辑器的容器（通常是带有 relative 定位的父元素）
    // 拖拽手柄渲染在 tiptap-editor 的 relative 容器中
    let container = editorElement.parentElement
    while (container && getComputedStyle(container).position === 'static') {
      container = container.parentElement
    }
    if (!container) {
      container = editorElement.parentElement
    }
    if (!container) return

    containerRef.current = container as HTMLElement

    let currentBlock: HTMLElement | null = null

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // 清除隐藏定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      // 查找最近的块级元素
      const block = target.closest('p, h1, h2, h3, h4, h5, h6, blockquote, pre') as HTMLElement

      if (block && editorElement.contains(block)) {
        if (block !== currentBlock) {
          currentBlock = block
          const rect = block.getBoundingClientRect()
          const containerRect = container.getBoundingClientRect()

          const topPos = rect.top - containerRect.top + 6
          const leftPos = rect.left - containerRect.left - 28

          setPosition({
            top: topPos,
            left: leftPos,
          })
          draggedElementRef.current = block

          try {
            const pos = editor.view.posAtDOM(block, 0)
            const resolved = editor.view.state.doc.resolve(pos)
            if (resolved.parentOffset > 0) {
              draggedPosRef.current = resolved.start(resolved.depth)
            } else {
              draggedPosRef.current = pos
            }
          } catch (error) {
            console.error('Error getting position:', error)
            draggedPosRef.current = null
          }
        }
        setShow(true)
      } else {
        const dragHandle = document.querySelector('[data-drag-handle]') as HTMLElement
        if (!dragHandle || !dragHandle.matches(':hover')) {
          timeoutRef.current = setTimeout(() => {
            setShow(false)
            currentBlock = null
          }, 500)
        }
      }
    }

    const handleMouseLeave = () => {
      timeoutRef.current = setTimeout(() => {
        setShow(false)
        currentBlock = null
      }, 300)
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [editor])

  const handleDragStart = (e: React.DragEvent) => {
    const draggedElement = draggedElementRef.current
    const draggedPos = draggedPosRef.current

    if (!draggedElement || draggedPos === null || !editor) {
      return
    }

    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', draggedElement.outerHTML)

    draggedElement.style.opacity = '0.4'
    draggedElement.classList.add('dragging')
  }

  const handleDragEnd = useCallback(() => {
    const draggedElement = draggedElementRef.current

    if (draggedElement) {
      draggedElement.style.opacity = '1'
      draggedElement.classList.remove('dragging')
    }

    const editorElement = editor?.view.dom as HTMLElement
    editorElement?.querySelectorAll('.drag-over').forEach((el) => {
      el.classList.remove('drag-over')
    })
  }, [editor])

  useEffect(() => {
    if (!editor) return

    const editorElement = editor.view.dom as HTMLElement

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.dataTransfer!.dropEffect = 'move'

      const target = (e.target as HTMLElement).closest(
        'p, h1, h2, h3, h4, h5, h6, blockquote, pre',
      ) as HTMLElement

      const draggedElement = draggedElementRef.current

      if (target && target !== draggedElement) {
        editorElement.querySelectorAll('.drag-over').forEach((el) => {
          el.classList.remove('drag-over')
        })
        target.classList.add('drag-over')
      }
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()

      const target = (e.target as HTMLElement).closest(
        'p, h1, h2, h3, h4, h5, h6, blockquote, pre',
      ) as HTMLElement

      const draggedElement = draggedElementRef.current
      const draggedPos = draggedPosRef.current
      if (!target || !draggedElement || draggedPos === null || target === draggedElement) {
        handleDragEnd()
        return
      }

      try {
        let targetPos = editor.view.posAtDOM(target, 0)
        const { state } = editor.view

        const resolvedTarget = state.doc.resolve(targetPos)
        if (resolvedTarget.parentOffset > 0) {
          targetPos = resolvedTarget.start(resolvedTarget.depth)
        }

        const resolvedSource = state.doc.resolve(draggedPos)
        const sourceNode = resolvedSource.nodeAfter

        if (!sourceNode) {
          handleDragEnd()
          return
        }

        const sourceStart = draggedPos
        const sourceEnd = draggedPos + sourceNode.nodeSize

        let insertPos = targetPos

        if (targetPos > sourceEnd) {
          insertPos = targetPos - sourceNode.nodeSize
        } else if (targetPos > sourceStart && targetPos < sourceEnd) {
          handleDragEnd()
          return
        }

        const tr = state.tr

        tr.delete(sourceStart, sourceEnd)

        tr.insert(insertPos, sourceNode)

        editor.view.dispatch(tr)
      } catch (error) {
        console.error('❌ 拖放过程出错:', error)
      }

      handleDragEnd()
    }

    editorElement.addEventListener('dragover', handleDragOver)
    editorElement.addEventListener('drop', handleDrop)

    return () => {
      editorElement.removeEventListener('dragover', handleDragOver)
      editorElement.removeEventListener('drop', handleDrop)
    }
  }, [editor, handleDragEnd])

  useEffect(() => {
    if (typeof document === 'undefined') return

    const oldStyle = document.getElementById('drag-handle-styles')
    if (oldStyle) {
      oldStyle.remove()
    }

    const style = document.createElement('style')
    style.id = 'drag-handle-styles'
    style.textContent = `
      /* 移除可能存在的 padding-left */
      .ProseMirror > p,
      .ProseMirror > h1,
      .ProseMirror > h2,
      .ProseMirror > h3,
      .ProseMirror > h4,
      .ProseMirror > h5,
      .ProseMirror > h6,
      .ProseMirror > blockquote,
      .ProseMirror > pre {
        position: relative;
      }

      /* 确保没有 ::before 伪元素 */
      .ProseMirror > p::before,
      .ProseMirror > h1::before,
      .ProseMirror > h2::before,
      .ProseMirror > h3::before,
      .ProseMirror > h4::before,
      .ProseMirror > h5::before,
      .ProseMirror > h6::before,
      .ProseMirror > blockquote::before,
      .ProseMirror > pre::before {
        content: none !important;
        display: none !important;
      }

      .ProseMirror > .dragging {
        opacity: 0.4 !important;
      }

      .ProseMirror > .drag-over {
        border-top: 2px solid #3b82f6 !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      style.remove()
    }
  }, [])

  if (!show || !editor) return null

  return (
    <div
      data-drag-handle
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => {
        setShow(true)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      }}
      onMouseLeave={() => {
        timeoutRef.current = setTimeout(() => {
          setShow(false)
        }, 300)
      }}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 1000,
        cursor: 'grab',
        pointerEvents: 'auto',
      }}
      className="flex items-center justify-center w-6 h-6 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-all active:cursor-grabbing"
      title="拖拽移动段落"
      onMouseDown={(e) => {
        e.stopPropagation()
      }}
    >
      <GripVertical className="w-4 h-4" />
    </div>
  )
}
