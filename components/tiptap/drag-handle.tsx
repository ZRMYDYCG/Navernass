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

  useEffect(() => {
    if (!editor) return

    const editorElement = editor.view.dom as HTMLElement
    const container = editorElement.parentElement
    if (!container) return

    let currentBlock: HTMLElement | null = null
    let hideTimeout: NodeJS.Timeout | null = null

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // 清除隐藏定时器
      if (hideTimeout) {
        clearTimeout(hideTimeout)
        hideTimeout = null
      }

      // 查找最近的块级元素
      const block = target.closest('p, h1, h2, h3, h4, h5, h6, blockquote, pre') as HTMLElement

      if (block && editorElement.contains(block)) {
        if (block !== currentBlock) {
          currentBlock = block
          const rect = block.getBoundingClientRect()
          const containerRect = container.getBoundingClientRect()

          setPosition({
            top: rect.top - containerRect.top + container.scrollTop,
            left: -36, // 固定在左侧
          })
          draggedElementRef.current = block

          try {
            draggedPosRef.current = editor.view.posAtDOM(block, 0)
          } catch (error) {
            console.error('Error getting position:', error)
          }
        }
        setShow(true)
      } else {
        // 延迟隐藏，给用户时间移动到拖拽图标
        hideTimeout = setTimeout(() => {
          setShow(false)
          currentBlock = null
        }, 100)
      }
    }

    const handleMouseLeave = () => {
      hideTimeout = setTimeout(() => {
        setShow(false)
        currentBlock = null
      }, 100)
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
      if (hideTimeout) {
        clearTimeout(hideTimeout)
      }
    }
  }, [editor])

  // 拖拽处理
  const handleDragStart = (e: React.DragEvent) => {
    const draggedElement = draggedElementRef.current
    const draggedPos = draggedPosRef.current

    console.log('🚀 拖拽开始', { draggedElement, draggedPos })

    if (!draggedElement || draggedPos === null || !editor) {
      console.log('❌ 缺少必要数据，取消拖拽')
      return
    }

    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', draggedElement.outerHTML)

    // 添加拖拽样式
    draggedElement.style.opacity = '0.4'
    draggedElement.classList.add('dragging')

    console.log('✅ 拖拽样式已应用')
  }

  const handleDragEnd = useCallback(() => {
    const draggedElement = draggedElementRef.current

    if (draggedElement) {
      draggedElement.style.opacity = '1'
      draggedElement.classList.remove('dragging')
    }

    // 清除所有 drag-over 类
    const editorElement = editor?.view.dom as HTMLElement
    editorElement?.querySelectorAll('.drag-over').forEach((el) => {
      el.classList.remove('drag-over')
    })
  }, [editor])

  // 监听编辑器的 drop 事件
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
        // 清除之前的 drag-over
        editorElement.querySelectorAll('.drag-over').forEach((el) => {
          el.classList.remove('drag-over')
        })
        target.classList.add('drag-over')
      }
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      console.log('📍 放置触发')

      const target = (e.target as HTMLElement).closest(
        'p, h1, h2, h3, h4, h5, h6, blockquote, pre',
      ) as HTMLElement

      const draggedElement = draggedElementRef.current
      const draggedPos = draggedPosRef.current

      console.log('🎯 目标元素:', target)
      console.log('📦 拖拽元素:', draggedElement)

      if (!target || !draggedElement || draggedPos === null || target === draggedElement) {
        console.log('❌ 无效的拖放操作')
        handleDragEnd()
        return
      }

      try {
        const targetPos = editor.view.posAtDOM(target, 0)
        const { state } = editor.view

        console.log('📍 位置信息:', { sourcePos: draggedPos, targetPos })

        // 获取源节点
        const resolvedSource = state.doc.resolve(draggedPos)
        const sourceNode = resolvedSource.nodeAfter

        if (sourceNode) {
          const tr = state.tr

          // 删除源节点
          tr.delete(draggedPos, draggedPos + sourceNode.nodeSize)

          // 计算新的目标位置
          const newTargetPos = targetPos > draggedPos ? targetPos - sourceNode.nodeSize : targetPos

          console.log('🔄 移动到新位置:', newTargetPos)

          // 在目标位置插入节点
          tr.insert(newTargetPos, sourceNode)

          // 应用事务
          editor.view.dispatch(tr)

          console.log('✅ 拖放成功!')
        }
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

  // 清理旧样式并添加新样式
  useEffect(() => {
    if (typeof document === 'undefined') return

    // 移除旧的样式
    const oldStyle = document.getElementById('drag-handle-styles')
    if (oldStyle) {
      oldStyle.remove()
    }

    // 添加新的最小样式
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
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setShow(true)}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 50,
        cursor: 'grab',
      }}
      className="flex items-center justify-center w-6 h-6 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-all active:cursor-grabbing"
      title="拖拽移动段落"
      onMouseDown={e => e.stopPropagation()}
    >
      <GripVertical className="w-4 h-4" />
    </div>
  )
}
